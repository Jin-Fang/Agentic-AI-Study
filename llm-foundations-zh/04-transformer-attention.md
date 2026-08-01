# 第 4 章：Transformer 与 Attention

现代大多数 LLM 都基于 *Attention Is All You Need* 提出的 Transformer 架构（[Vaswani et al., 2017](https://arxiv.org/abs/1706.03762)）。Karpathy 在入门讲解中也指出，这类模型背后的神经网络架构是 Transformer（[Intro to LLMs, around 00:11:40](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=700s)）。这一架构解释了 token 序列如何变成依赖上下文的预测。

## 输入与输出

语言模型从 token ID 开始。Embedding table 把每个 ID 映射为一个向量，于是输入序列就变成了向量序列。模型还必须表示顺序：没有位置信息时，同一组 token 以不同顺序出现会很难区分。

不同 Transformer 家族用不同方法编码位置，例如 learned absolute position embedding、sinusoidal encoding、relative position bias，以及在 attention 内应用的 rotary position embedding。因此，位置是模型序列表示的一部分，但不一定总是以直接加到 token embedding 上的形式存在。

这些向量会经过一组堆叠的 Transformer block。每个 block 都为各个位置产生新的表示。最后一个 block 之后，学得的 projection 把每个位置的表示映射为词表 logits。进行 next-token training 时，这些 logits 会与每个可预测位置的后续 token 比较；生成时，最后一个位置的 logits 定义用于选择下一个 token 的分布。

Karpathy 将这一流程描述为：token 经过重复的 Transformer block，直到网络产生 next-token prediction（[Deep Dive, around 00:23:24](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1404s)）。模型并不是把序列解析成一组显式变量，而是在反复转换向量表示。

## 原始 Transformer 与 Decoder-Only LLM

原始 Transformer 是面向机器翻译等 sequence-to-sequence 任务的 encoder-decoder 架构。Encoder 为输入序列构建表示；decoder 既对输出前缀使用 causal self-attention，也通过 cross-attention 使用 encoder 的表示。

许多 autoregressive LLM 改用 decoder-only 架构。它们没有单独的 encoder 或 cross-attention 阶段，而是让同一组堆叠层在 causal constraint 下处理前缀，并预测紧随其后的 token。训练时，每个位置的正确前缀已经存在，所以可以并行计算许多 next-token prediction；生成时，则逐个追加 token。

因此，“Transformer” 指的是一族架构，而不是一种固定布局。不同模型家族还会采用不同的 normalization placement、position method、attention variant、activation function 等细节。它们共享的核心思想是：用一组学得的 block，把 token 序列转换成上下文化表示。

## Self-Attention

Self-attention 让一个位置能够混合同一序列中其他位置的信息，从而使 token 表示依赖其上下文。例如，问题中的词可以与前面的 source text 发生交互，一行代码也可以与更早的变量定义发生交互。

Attention computation 是学得的、柔性的操作。它不会按固定规则检索一条符号记录或复制某个事实，而是生成 value vector 的加权混合；这些结果还会与其他信号结合，再由网络的其余部分继续转换。

### Query、Key 与 Value

在单个 attention head 内，学得的 projection 会把每个输入表示转换成三种向量：

- **Query** 表示当前位置在寻找什么。
- **Key** 表示一个可用位置可以怎样被匹配。
- **Value** 表示这个可用位置可以贡献什么信息。

对于输入矩阵 \(X\)，一个 head 会计算 projection \(Q=XW_Q\)、\(K=XW_K\) 和 \(V=XW_V\)。其输出形式为

```text
Attention(Q, K, V) =
  softmax((Q K^T) / sqrt(d_k) + M) V
```

其中 \(M\) 是 attention mask。点积产生匹配分数，softmax 把允许使用的分数转换成权重，加权求和则混合各个 value vector。

假设一段代码中包含 `user_count = ...`，随后执行到 `return `。某些 head 可能会给前面的定义相对较高的权重，并把与 `user_count` 有关的信息贡献给后面位置的表示。这只是对一次中间计算的直觉说明：通常并不是某一个 head 直接决定下一个 token 就是 `user_count`。在词表 logits 产生之前，多个 head、residual path、MLP 和许多层的输出都会共同参与。

对散文也需要保持同样的谨慎。用于回答问题的位置可能会给前面陈述相关事实的句子较高权重，但最终答案并不是由某一条 attention link 机械决定的。Attention 可能混合有用、无关或误导信息；仅凭较高的 attention weight，也不能证明某个位置具有因果重要性。

### Causal Mask

在 decoder-only language model 中，mask \(M\) 会阻止当前位置 attend 到更靠后的位置。不允许使用的分数会在 softmax 前被实际设为负无穷，因此对应权重变为零。位置 \(i\) 的表示可以使用位置不晚于 \(i\) 的 token，却不能使用它之后的 token。

Causal mask 让架构与 next-token prediction 对齐。训练时，模型可以处理完整序列，同时仍然阻止每个位置看到自己应该预测的 token；生成时，同一约束意味着新生成的 token 只能依赖已有前缀。

### Multi-Head Attention

Multi-head attention 使用不同的 learned projection 并行运行多次 attention computation。各个 head 的输出会被拼接，再 projection 回模型的 residual stream。多个 head 使一层能够以多种方式并行组合不同位置的信息。

有些 head 会呈现可识别的模式，例如关注局部位置或追踪重复 token，但并不能保证所有 head 都具有清晰、可用人类语言描述的分工。它们的贡献可能互相重叠、随上下文变化，并与后续层发生交互。更合适的理解是：head 是分布式计算的一个组成部分，而不是独立的决策者。

Karpathy 在解释 Transformer 内各个位置如何通信时，重点指出了 attention block（[Deep Dive, around 00:24:29](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1469s)）。它为前文影响后续表示提供了路径，但不保证模型一定能正确找出并使用最相关的信息。

## Transformer Block

Attention 只是 Transformer block 的一部分。典型的 decoder-only block 包含：

1. 一次 normalization。
2. Causal multi-head self-attention。
3. 一条 residual connection，把 attention 输出加回持续传递的表示。
4. 另一次 normalization。
5. 一个对各位置独立应用的 feed-forward network，通常称为 MLP。
6. 另一条 residual connection。

具体顺序因模型家族而异；例如，normalization 可能位于 sublayer 之前或之后。比确切变体更重要的是功能差异：attention 在 token 位置之间混合信息，MLP 则在每个位置内应用学得的非线性变换。Residual connection 让信号经过许多 block 时得以保留和累积，normalization 则有助于保持计算稳定。

重复这些 block 会产生以可用前缀为条件的表示。各层不一定对应“先语法、后语义”这样的整齐阶段。特征可以分散在多个层与组件中，同一组件也可能针对不同输入参与不同计算。

## 分布式表示与可解释性

模型学到的知识和行为分布在许多参数与 activation 中。Karpathy 强调，数十亿参数以我们尚未从机制上完全理解的方式共同工作（[Intro to LLMs, around 00:11:57](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=717s)）。因此，“某个事实存在哪里”通常没有简单答案。

特定预测也同样如此。Attention weight 揭示了内部计算的一部分，却不是完整解释：value vector、MLP、residual path 和后续层都会发挥作用。Mechanistic interpretability 研究这些计算，但现有方法通常还不能为每个生成 token 提供简单而完备的因果说明。

分布式表示也意味着模型知识不是一张可直接编辑的事实表。改动一个参数可能影响许多输入，而一种行为也可能依赖大量参数。网络仍然执行确定的数值计算，但其内部概念通常不会与人类标签一一对应。

## 架构与训练是两件事

架构定义网络可以执行的运算，训练则确定这些运算使用的参数值。随机初始化的 Transformer 拥有架构，却没有实用的语言行为。Pretraining 让参数拟合训练序列上的 next-token prediction，post-training 则可以进一步改变其回答分布。

这种区分可以避免把架构当成包罗一切的解释。Self-attention 为前文影响后续预测提供了路径，但训练决定模型学会识别哪些模式，以及使用这些模式的可靠程度。架构相近的两个模型，可能因为数据、目标、参数量和 post-training 不同而表现迥异。

## Attention 成本

对 \(n\) 个 token 进行标准 full-sequence attention 时，每个位置都要与其他允许使用的位置形成分数，因此每个 head 的 score matrix 包含 \(O(n^2)\) 个元素。在模型宽度和层数不变时，训练以及处理 prompt（也称为 **prefill**）期间，attention 中随序列长度变化的计算量是平方级的。Causal mask 去掉了对未来位置的交互，但不会改变这一渐近复杂度。

这个结论专门针对 block 中的 attention 部分。Linear projection 和 MLP 同样消耗大量计算，在许多实际序列长度下甚至可能主导总运行时间。传统 attention 实现还可能需要 \(O(n^2)\) 的临时内存来存放 attention score；memory-efficient kernel 可以避免显式生成完整矩阵，但并不会消除底层成对 attention 运算。

使用 **KV cache** 时，autoregressive decoding 呈现不同的计算特征。各层会保存已有 token 的 key 与 value。对于一个新 token，模型只计算新的 query、key 和 value，再让这个 query attend 到缓存的前缀。在模型维度固定时，这一步的 attention 计算量随前缀长度按 \(O(n)\) 增长，而不必为整个前缀重新计算 \(O(n^2)\) attention。KV-cache memory 则随缓存 token 数量线性增长。

生成多个 token 时，这些逐步线性的成本会累积：在长度为 \(p\) 的 prompt 之后生成 \(m\) 个 token，attention score work 大致与 \(mp + m^2\) 成正比，此外还要加上 prefill 与每个 block 中的其他计算。架构与 kernel 优化可以改变常数，或改用近似、稀疏模式，但更长的序列仍会带来真实的计算、内存和延迟成本。

## 要点

- Decoder-only Transformer 让 token 与位置信息经过重复 block，最终得到 next-token logits。
- Causal self-attention 通过学得的 query、key 和 value projection，混合可用前缀的信息。
- 多个 head 和多层会共同贡献分布式的中间信号；单个 attention head 并不直接选择输出 token。
- Attention 能让相关前文产生影响，但不保证一定能正确选择或使用这些信息。
- 标准 prefill attention 的计算量随序列长度平方增长，而使用 KV cache 的 decoding 对每个新 token 使用线性 attention 计算和线性 cache memory。
