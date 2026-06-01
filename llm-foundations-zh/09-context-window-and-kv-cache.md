# 第 9 章：Context Window 与 KV Cache

Context window 是模型单次调用中最多能条件化的 token 序列。Karpathy 把 context window 描述为模型当前能看到的工作上下文 ([Intro to LLMs, around 00:32:42](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1962s))。把长 context window 当成记忆很诱人，但这是错误的。

Context 是输入；memory 是调用之外持久存在的状态。

## 有限上下文

Prompt 里的每个 token 都在争夺 attention 和预算。系统指令、developer 指令、用户消息、检索文档、工具输出、示例和摘要共享同一个窗口。窗口满了，就必须省略或压缩某些内容。

失败模式不只是硬性溢出。即使窗口还没满，性能也可能下降。重要约束可能离生成点太远，干扰文本可能吸走 attention，摘要可能遗漏细节，检索文档也可能引入冲突说法。

Karpathy 把 context window 称为有限而珍贵的资源，并把它和模型完成任务所能使用的信息联系起来 ([Intro to LLMs, around 00:32:42](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1962s), [00:44:38](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2678s))。这就是模型机制和 context engineering 的连接点。如果信息不在上下文里，也不能通过工具获得，模型就只能依赖参数或猜测。

因此每一份信息都要回答设计问题：

- 它现在应该进 prompt 吗？
- 是否应该按需检索？
- 是否应该摘要？
- 是否应该外部存储并用 ID 引用？
- 是否应该用工具检查，而不是让模型阅读？

Context window 让这些问题不可避免。

## KV Cache

Inference 过程中，[Transformer attention](./04-transformer-attention.md) 会为 token 产生 key 和 value 向量。系统会缓存这些向量，让生成时复用已有前缀的计算，而不用每次重算整段上下文。这就是 KV cache。

KV cache 是 inference 优化，不是语义记忆。它帮助模型高效继续当前序列。它不会决定哪些事实重要，不会更新长期状态，也不会解决 context pollution。

对 harness 来说，KV cache 重要是因为长 prompt 和长输出会消耗内存并影响延迟。复用稳定前缀能提高性能，但过期或臃肿前缀仍然伤害模型行为。

## 工作记忆 vs 长期记忆

Context window 是工作记忆。长期记忆必须存在别处。Karpathy 提到 memory 和 computational tools 是增强模型能力的方式，可以帮助模型完成自然 context 之外的任务 ([Intro to LLMs, around 00:42:46](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2566s))。Harness 会把这个想法变成具体基础设施。

长期记忆可以是：

- 用户 profile；
- vector index；
- task database；
- 写入文件的笔记；
- 对话摘要；
- repository checkout；
- browser session；
- workflow engine 中的结构化状态。

模型在需要时读取这份记忆的切片，而不应该被要求把所有状态都背在 prompt 里。

## Context Selection

Harness 需要 context-selection policy。每次模型调用，它都要选择包含什么：

- 当前用户请求；
- 持久任务状态；
- 相关历史决策；
- 可用工具；
- 最新 observation；
- 检索文档；
- 示例；
- 输出约束。

选择通常比压缩更重要。一个只包含正确 file diff 和 failing test 的短 prompt，可能胜过一个包含整个项目历史的长 prompt。

## Context Rot

任务变长时，上下文往往会积累无关材料：旧工具输出、失败计划、重复日志、过期假设、摘要的摘要。这就是 context rot。模型可能把 attention 花在不再代表当前任务的文本上。

好的 harness 会这样对抗 context rot：

- 把结构化任务状态放在模型外部；
- 摘要时显式保留约束和开放问题；
- 从工具输出抽取持久事实后丢掉原始输出；
- 大型对象用 handle 存储；
- 每次调用只 rehydrate 相关切片；
- 把用户内容和系统指令分开。

另一个实用规则是：工具原始输出中的信息被抽取后，就不要继续把原始输出留在上下文里。5000 行日志应该变成“测试 `x` 在调用 `z` 后因为断言 `y` 失败”，再加一个指向完整日志的 handle。模型之后需要时再请求完整日志。

## Context 也是安全边界

Context 不只是记忆预算，也是信任边界。模型可能 attend 到 prompt 中任何内容，包括检索网页或文档里的恶意指令。Context 越大，攻击面越大。

Harness 应该对进入 context 的内容做权限和标记：

- 不要检索用户无权查看的文档；
- 把不可信内容标记为 data；
- 工具说明不要放进检索内容里；
- 除非必要，不要粘贴 secrets；
- 优先用 handle 和 scoped tools，而不是裸敏感上下文。

## Long-Context Models

Long-context model 降低压力，但不能取消 context engineering。更大的窗口能支持更大文档、更丰富 trace、更少 compaction；也会鼓励粗心堆料。

长上下文也不意味着每个 token 都被均匀使用。*Lost in the Middle* 发现，模型使用输入开头或结尾附近的相关信息时，可能明显好于使用中间位置的信息 ([Lost in the Middle](https://arxiv.org/abs/2307.03172))。不同模型和上下文长度会有差异，但稳定结论是：“放进窗口某处”不等于“模型可靠可用”。

对 harness 来说，evidence placement 是设计问题。当前任务、关键约束和决定性证据应该放在模型更可能使用的位置。如果必须放入长文档，应考虑 section summaries、targeted retrieval、citations 和 follow-up search，而不是假设整个窗口都会被同等可靠地阅读。

用真实任务衡量 long-context workflow。问清楚：额外上下文是否提高成功率、减少重试，还是只是增加成本？有时 search tool 加小上下文会胜过巨大 prompt。

## 要点

- Context window 是有限输入，不是持久记忆。
- KV cache 加速 inference，但不解决语义状态。
- Context rot 是长运行 workflow 的主要失败模式。
- Harness 应外部化状态，并给模型相关切片。
