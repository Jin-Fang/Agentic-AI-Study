# 第 4 章：Transformer 与 Attention

现代大多数 LLM 都基于 Transformer 架构。Transformer 最初由 *Attention Is All You Need* 提出 ([Vaswani et al., 2017](https://arxiv.org/abs/1706.03762))。Karpathy 在 intro 里也明确指出，这类模型背后的神经网络架构就是 Transformer ([Intro to LLMs, around 00:11:40](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=700s))。对 harness engineer 来说，架构之所以重要，是因为它解释了 context 为什么强大、昂贵，而且并不完美。

## 原始 Transformer vs Decoder-Only LLM

原始 Transformer 是用于机器翻译等 sequence-to-sequence 任务的 encoder-decoder 架构。许多现代 autoregressive LLM 使用 decoder-only 变体：它们处理一个前缀，并在 causal mask 约束下预测下一个 token。

这个区别很重要，因为 “Transformer” 是一族计算模式，不是单一产品形态。Causal language model 在训练和生成时不能 attend 到未来 token。它的 attention 被约束为每个位置只能使用更早的位置，这与 next-token objective 对齐。

现代 LLM 还包含一些高层解释容易跳过的细节：

- **Multi-head attention** 让不同 head 并行关注不同关系。
- **位置信息** 告诉模型 token 出现在哪里。现代系统可能使用 learned positions、sinusoidal positions、rotary position embeddings 或其他变体。
- **Causal masking** 防止模型在学习预测时看到答案 token。

对 harness 来说，重点不是背诵架构变体，而是记住：context 之所以可用，来自一套具体的 sequence-processing computation；不同模型家族在位置、长度和 attention 表示上可能不同。

## 从 Token 到向量

模型首先把 token ID 映射成向量，也就是 embedding。一个 token，例如 `hello`、换行符或代码片段，会变成高维空间中的一个点。位置信息会被加入表示中，使模型能够区分同一个 token 出现在不同位置。

然后这些向量会经过许多重复层。每一层都会通过混合其他 token 的信息和应用学得的变换，更新每个 token 的表示。

Karpathy 在 deep dive 中把 Transformer 讲成这类场景使用的具体神经网络：token 经过一连串 block，最后网络产生下一个 token 的预测 ([Deep Dive, around 00:23:24](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1404s))。对 harness 来说，重点是：模型不是把文档读进显式变量，而是在转换一串向量状态。

每个 token 位置都携带一个逐层精炼的表示。早期层可能表示局部语法或 token 身份，后面层可能表示对预测更有用的抽象关系。内部特征未必完全可解释，但过程仍然是机械的：基于上下文做向量变换。

## Attention：在上下文中回看

Self-attention 让每个 token 表示都能从上下文中的其他 token 收集信息。在 causal language model 里，某个位置可以 attend 到更早的位置，但不能看到未来位置。这就是模型能根据 prompt、历史对话、检索段落、工具结果和示例来预测下一个 token 的原因。

基本直觉是：

- query 表示当前位置需要什么信息；
- key 表示每个早期位置能提供什么；
- value 携带实际要混入的信息；
- attention weight 决定各位置影响有多强。

举个具体的画面：设想模型正在生成代码，走到 `return ` 后面那个位置。为了预测下一个 token，这个位置的 query 与前文某行 `user_count = ...` 的 key 强烈匹配，于是携带那个变量名的 value 被混入，模型输出 `user_count`。散文里也一样：回答问题时，生成位置会 attend 回检索段落中真正给出答案的那句话，把信息拉到当前位置。不需要任何数学，只是一个靠后的位置回看前文、并按相关性给更早的位置加权。

这不是数据库查询，而是一种学得的、柔性的、分布式操作。相关文本能影响生成，无关或误导文本也能影响生成。长上下文同时增加机会和风险。

Karpathy 指向 attention block 来解释 Transformer 内部位置如何交流 ([Deep Dive, around 00:24:29](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1469s))。从 harness 角度看，attention 是把证据放进 prompt 后可能有效的原因；也是证据位置、分隔符和噪声控制重要的原因。

一个直接回答问题的检索段落，会给 attention 提供有用目标。一个只是主题相关的段落，则会和答案竞争注意力。一个包含几千行成功测试输出的工具日志，可能让模型注意到无关模式。Attention 很强，但不足以支撑随意堆上下文。

## MLP 和层结构

Attention 在位置之间移动信息。Feed-forward 或 MLP block 在每个位置内部转换信息。Residual connection 让表示跨层传递。Layer normalization 稳定训练。

对 harness 工作来说，细节不如整体形状重要：模型会反复混合上下文并转换表示。它不会把 prompt 解析成一张清晰的事实表，而是构建一个受整段 token 序列影响的分布式激活状态。

这解释了为什么指令位置重要。靠近回答点的清晰指令可能占优势。顶部的高优先级指令也可能被几千个噪声 token 稀释。检索段落相关且紧凑时能帮助模型；包含干扰替代说法时也会伤害模型。

## Dense 模型与 Mixture-of-Experts 模型

上面的 MLP block 承载了模型大部分参数和计算，也是不同模型家族差异最大的地方。*Dense* 模型对每个 token 都跑全部参数。*Mixture-of-Experts*（MoE）模型则把部分 MLP block 换成许多并行的 expert 子网络，外加一个 router，每个 token 只激活其中几个 expert。Switch Transformer 表明，这种稀疏路由能让总参数量增长，而每 token 计算量不必同比上升 ([Switch Transformers](https://arxiv.org/abs/2101.03961))。

对 harness engineer 来说，MoE 打破了一个方便的假设：模型对外宣称的大小能预测它的成本和延迟。一个 MoE 模型的*总*参数量可能很大，但每 token 的*激活*参数量却小得多。由此有两个后果：

- 仅凭模型大小不再能预测 inference 成本。推断延迟和价格时，要问激活参数，而不只是总参数。
- 路由本身也是行为的一部分。不同输入激活不同 expert，这会让性能在不同领域之间不均匀，并以 dense 模型没有的方式与 batching 和吞吐量相互作用。

这不改变 harness 的职责，但改变模型选型。一个“更小”的 dense 模型和一个“更大”的 MoE 模型，成本可能接近，而在你的工作负载上表现不同。一如既往，要在真实任务上评测（见[第 13 章](./13-evaluation-for-llm-behavior.md)），而不是凭参数量推断可靠性。

## 参数分布在整个网络中

模型知识和行为不在一个显眼位置。Karpathy 强调，数十亿参数分散在网络各处，以我们尚未完全理解的方式协同工作 ([Intro to LLMs, around 00:11:57](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=717s))。所以“这个事实存在模型哪里？”通常没有简单答案。

对 harness 来说，这有三个后果：

- 你不能通过编辑模型内部一行数据库来修正事实错误。
- 你不能可靠地检查模型内部来证明它为什么生成某个答案。
- 相比推测内部电路，改变输入、工具、检索和验证通常更可控。

Mechanistic interpretability 是重要研究方向，但生产 harness 需要现在就能工作的控制手段。

## 训练和架构是两件事

Transformer 架构定义计算；训练设定参数。随机初始化的 Transformer 没有什么实用能力。训练后的 Transformer 吸收了数据结构。Post-trained Transformer 还被进一步塑造成 assistant 行为。

这个区别能避免混乱。当模型没有遵循工具 schema，原因可能是架构限制，但更常见是数据、post-training、prompt 格式或 harness 设计问题。当模型处理长文档不好，原因可能是 context length，也可能是检索噪声或指令位置。

## Attention 成本

标准 attention 需要每个位置和其他每个位置相互比较，所以计算量大致随序列长度平方增长（O(n^2)）：上下文翻倍，attention 计算量约变为四倍。生成阶段每个新 token 也要付一份随前缀长度增长的代价。现代系统有很多优化，但 context length 仍然影响延迟、内存和成本。Harness 不应该把大 context window 当作“可以粘贴一切”的许可。

好的 harness 会有意识地使用模型注意力：

- 当前指令保持紧凑且可见。
- 检索小而相关的片段，而不是整个语料。
- 摘要或外部化旧状态。
- 用文件、数据库和缓存作为模型外部记忆。
- 在添加更多上下文之前测量是否真的提高结果。

## 要点

- Transformer 把 token 序列转换成上下文化向量表示。
- Attention 让 token 能依赖早期上下文，但它是柔性的、会犯错的。
- 长上下文既强大又昂贵。
- Harness 应该通过减少噪声、突出相关证据来帮助 attention。
