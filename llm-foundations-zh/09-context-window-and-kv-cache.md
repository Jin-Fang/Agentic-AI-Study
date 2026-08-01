# 第 9 章：Context Window 与 KV Cache

Context window 是模型在一次生成中能够条件化的 token 序列。它的上限通常约束 prompt **加上已经生成的 token**，而不只约束 prompt。如果模型的 context 上限是 \(C\) 个 token，序列化后的 prompt 使用了 \(n\) 个，那么最多只剩 \(C-n\) 个位置可用于生成。Provider 还可能分别设置 input 和 output 上限，因此模型的架构上限与 API 实际接受的限制并不总是相同。

Context 是一次生成的临时输入。它不是持久状态，也不能保证模型会可靠使用其中的每个 token。

## 有限的 Token 序列

模型接收 token ID，其中包括 chat template 添加的 special token。它们都会占用序列位置。生成继续时，每个被选中的 token 都会追加到同一序列，并减少剩余容量。因此，tokenization 和不可见的格式开销既影响能放入多少输入，也影响还能生成多少输出；见[第 2 章](./02-tokenization.md)。

超出限制是容量问题：API 可能拒绝请求、截断一部分内容，或在配置的 output 上限处停止生成。低于限制只能说明序列放得下，并不能证明模型能够同样可靠地回忆、比较或推理序列的每一部分。

Karpathy 把 context window 描述为模型有限的工作上下文，也就是它生成时当前能看到的信息 ([Intro to LLMs, around 00:32:42](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1962s))。把它类比成 working memory 很有用，前提是不要误以为它具有持久性或可靠的随机访问能力。

## Prefill 与 Decode

自回归 inference 包含两个计算特征不同的阶段。

### Prefill

在 **prefill** 阶段，模型让 prompt 通过所有 [Transformer layer](./04-transformer-attention.md)。Causal mask 使 prompt 中的各个位置可以并行计算，同时每个位置仍然只能 attend 到自身和更早的位置。

对于长度为 \(n\) 的 prompt，标准 dense self-attention 的 attention 计算量按 \(O(n^2)\) 增长。优化后的 attention kernel 可以大幅减少中间内存读写和常数开销，但不会改变这种两两比较的基本 scaling。Prefill 产生用于选择第一个生成 token 的 logits，也会创建 decode 阶段将要复用的 key 和 value tensor。

因此，prompt 长度会直接影响 prefill 工作量，通常也会影响首 token 延迟。模型的其他部分、硬件、batching 和 serving 实现同样会产生影响，所以 token 数量不能单独决定延迟。

### Decode

在 **decode** 阶段，模型每次选择一个新 token。在每个 layer 中，模型计算新 token 的 query、key 和 value。Query 会 attend 到已经为此前序列保存的 key 和 value，随后新的 key 和 value 被追加到 cache。

使用 KV cache 后，无需重复进行更早 token 的 projection 和 MLP 计算。不过对于标准 dense attention，新 query 仍然需要与不断增长的前缀比较。因此，序列长度为 \(t\) 时，单个 decode token 的 attention 计算量是 \(O(t)\)，并不是常数时间。在 \(n\) 个 prompt token 之后生成 \(m\) 个 token，这些 token 的 decode attention 总工作量约为 \(O(mn+m^2)\)。如果没有 cache，朴素实现会在每一步反复运行整个增长中的前缀，重复大量计算。

这个区别解释了两种常见延迟指标：prefill 在很大程度上决定首 token 延迟，而顺序执行的 decode 在很大程度上决定后续 token 的生成速率。

## KV Cache 存储什么

在每个 attention layer 中，每个已经处理过的 token 都有一个 key vector 和一个 value vector。**KV cache** 保存这些 tensor，供后续 decode step 复用。它缓存的是某个精确 token 前缀的中间数值状态，而不是事实，也不是文本摘要。

对于每个活跃序列，它的大小近似随下式增长：

```text
每个请求的 KV 元素数 =
  2 * layer 数 * 缓存 token 数 * KV head 数 * head dimension
```

还要乘以每个元素所占的 byte 数。Batch size、并行采样和 beam search 都可能成倍增加这项成本。Grouped-query attention 或 multi-query attention 等架构使用更少的 KV head，可以降低开销；sliding-window 或其他 attention 变体则可能改变必须保留哪些 token。

因此，更长的 context 会消耗更多 cache memory，也要求每个新 query 读取更多缓存状态。即使 model weight 能轻松装入内存，KV-cache 容量仍可能限制 batch size 和 throughput。

不能仅仅因为前缀描述了过期事实就称 cache “过期”。这些 tensor 仍然正确表示生成它们的精确 token；过期的是**内容**。如果前缀中的某个 token 改变，受影响的 hidden state 及其派生的 key 和 value 就必须重新计算。

## Context、KV Cache 与 Provider Prompt Caching

这三个概念相互关联，但不能互换：

- **Context** 是允许模型条件化的 token 序列。
- **单次请求内的 KV cache** 保存本次生成中已经处理位置的 layer-level key 和 value tensor。
- **Provider prompt caching** 可以在不同请求之间复用共享前缀的 prefill 工作。

Provider prompt caching 是 API 和 serving contract，并不是模型有 context window 就必然具备的性质。它的适用条件、前缀匹配规则、保留时间、计费方式和延迟效果都取决于 provider；匹配通常要求开头的 token 完全相同。Provider 可能通过保留 KV 派生状态或其他内部方式实现这个功能。无论如何，它都不会扩大 context window、提高前缀的可信度，也不会把请求变成持久的语义记忆。

## 工作上下文不是持久状态

一次调用结束时，它的 context 不会自动成为后续调用可用的状态。Application 可以在外部保存信息，再把其中一部分放入之后的 prompt，但那是另一个系统机制。详细的 context management 和 memory 架构见 *Agent Harness* [第 3 章](../agent-harness-zh/03-context-as-finite-resource.md)和[第 5 章](../agent-harness-zh/05-compaction-memory-context-handoffs.md)；持久 execution state 与 event history 则见[第 10 章](../agent-harness-zh/10-state-event-history-production-factors.md)。

## Long-Context 容量与可靠性

更大的标称窗口提高的是**容量**：能够放入更多 token。它不保证模型会均匀或可靠地**利用**这些 token。长输入会暴露多种经验性弱点：

- 对相关信息所在位置敏感；
- 相关材料被 distractor 包围时准确率降低；
- 难以整合分散在相距很远位置的证据；
- 在触及硬性 context 上限之前，任务表现就已经下降。

**Context rot** 常用来泛指 context 变长时出现的这类退化。它是一种经验行为，而不是单一机制，也没有对所有情况都成立的统一阈值。严重程度取决于模型、任务、序列长度、位置和周围内容。

*Lost in the Middle* 发现，在 key-value retrieval 和 multi-document question answering 任务上，当相关信息位于输入开头或结尾时，模型表现可能优于信息位于中间时 ([Liu et al., 2023](https://arxiv.org/abs/2307.03172))。并非每个模型都会呈现完全相同的模式，但这个结果说明了核心区别：信息处于模型支持的窗口之内，不等于模型会可靠使用它。

因此，阅读 long-context 主张时必须区分概念。最大 token 数描述的是能够接受的序列长度；短 retrieval probe 上的表现描述的是一种行为。两者单独都不能证明模型能在该长度下对任意输入进行可靠的理解、回忆或推理。

## Context 不是 Enforcement Boundary

模型会对收到的序列化 token 进行计算；它不会在序列不同部分之间提供可靠的信任隔离。Label、role marker 和 delimiter 可能影响行为，但不可信文本仍然可能影响生成，详见[第 8 章](./08-prompting-and-in-context-learning.md)。

因此，context 是输入面和攻击面，而不是 authorization 或 enforcement boundary。任何硬性的访问或行动边界都必须存在于模型之外。详细控制属于配套教材 [*Agent Harness*](../agent-harness-zh/README.md)。

## 要点

- Context-window 上限通常约束 prompt 加生成 token；provider 的 input 和 output 上限还可能带来额外约束。
- Prefill 处理 prompt，并构建每层的 key 和 value；decode 随后复用它们，顺序生成 token。
- KV cache 避免重复计算旧 token，但其内存随缓存序列长度线性增长，标准 decode attention 仍然要扫描不断增长的前缀。
- Context、单次请求内的 KV cache 和 provider prompt caching 是生命周期与 contract 都不同的概念。
- Long-context 容量不保证模型可靠使用每个已放入的 token。
- Context 是临时输入，不是持久记忆，也不是模型强制执行的信任边界。
