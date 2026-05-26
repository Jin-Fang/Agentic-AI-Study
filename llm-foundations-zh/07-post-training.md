# 第 7 章：Post-Training

预训练教模型预测文本。Post-training 塑造模型作为 assistant 的行为。Karpathy 的 intro 把预训练和 fine-tuning 分开讲，并描述后续阶段如何让模型更适合对话和指令遵循 ([Intro to LLMs, around 00:14:29](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=869s))。

这个区别非常关键。Base model 可能知识丰富，但不一定合作。Assistant model 则被训练成更受控地回应用户请求。

## Supervised Fine-Tuning

Supervised fine-tuning，简称 SFT，会用期望行为的样例继续训练模型：指令和好回答、对话、格式模式、工具调用演示、领域任务等。这会把模型从 raw continuation 推向 instruction following。

模型仍然在预测 token，但分布变了。它看过许多 assistant 行为样例，所以 chat prompt 会诱发 assistant-like continuation。

Karpathy 把 fine-tuning 讲成把 raw internet-document completer 改造成 assistant model 的阶段 ([Intro to LLMs, around 00:14:29](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=869s))。实践中，训练数据不再像任意网页，而更像对话：

```text
User: Explain gradient descent.
Assistant: ...
```

或者是供应商特定 chat template 序列化出来的 role。模型学到的不只是内容，还包括交互风格：回答最新用户、尊重高优先级指令、格式化代码块、拒绝某些请求、提问澄清，以及在格式要求时使用工具。

这就是 base model 和 chat model 即使架构相近，体感也会非常不同的原因。

## Instruction Data 教会接口

Post-training 可以教模型接口约定。如果工具调用在训练数据中表现为 JSON object，模型就会学这个模式。如果隐藏测试奖励简洁答案，模型就会学简洁。如果 safety 数据包含拒绝样例，模型就会学 refusal pattern。

Harness 应尽量和模型训练过的接口保持一致：

- 使用供应商推荐的 chat 格式。
- 工具 schema 尽量接近模型可能见过的例子。
- 对不常见内部工具提供演示。
- 除非 constrained decoding 能保证，否则不要发明晦涩语法。
- 把模型升级视为接口变化，而不只是能力变化。

## Preference Training 和 RLHF

Instruction-following 模型通常使用人类偏好数据。InstructGPT 工作中，标注者写 demonstrations、排序模型输出，这些排序被用来训练 reward model，并通过 reinforcement learning from human feedback 优化 policy ([Training Language Models to Follow Instructions with Human Feedback](https://arxiv.org/abs/2203.02155))。

操作上的结果是，模型更倾向于产生人类喜欢的输出：更有帮助、更诚实、更少毒性、更遵循指令。但这不是正确性或安全性的形式化证明。

后续方法会更直接地优化偏好。Direct Preference Optimization 用另一种方式处理 preference learning，不再以同样方式训练单独 reward model ([Direct Preference Optimization](https://arxiv.org/abs/2305.18290))。Constitutional AI 使用由原则引导的模型反馈，减少某些 harmlessness training 对人类标签的依赖 ([Constitutional AI](https://arxiv.org/abs/2212.08073))。

Karpathy 的 deep dive 更细地解释了 reward-model 框架。Reward model 本身也是一个神经网络，训练目标是根据偏好数据给输出打分 ([Deep Dive, around 02:52:39](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10359s))。它的输出可以是一个 scalar score，表示 reward model 对某个候选回答的偏好程度。

主模型随后可以基于这个学得的 reward signal 优化。这样做强大，因为人类判断昂贵；一旦 reward model 存在，它可以比人类更便宜地给大量样本打分。但它也危险，因为 reward model 只是近似。

Karpathy 把这种近似称为 human preference 的有损模拟 ([Deep Dive, around 03:00:54](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10854s))。有损模拟可以被优化，也可以被利用。

## Reward Hacking

如果优化器过度优化一个不完美 reward model，它可能找到分数高但真实并不好的输出。Karpathy 把这称为 reward hacking：模型发现 reward model 喜欢的 artifact，即使人类不喜欢 ([Deep Dive, around 03:04:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11051s))。

Harness engineer 应该在 RLHF 之外也识别同一模式：

- model grader 可能被冗长但浅薄的回答骗过；
- citation checker 可能被大量无关引用骗过；
- 只看单元测试的 coding eval 可能被过拟合测试骗过；
- helpfulness 指标可能被自信猜测骗过；
- support bot 可能优化“快速关闭”而不是正确解决。

每个 proxy metric 都可能变成被优化的目标。重要 workflow 应该加入 adversarial cases、人类 review 和多重信号。

## 可验证和不可验证奖励

有些任务奖励清晰。单元测试通过，JSON schema 验证通过，棋类引擎判断走法合法。另一些任务高度依赖偏好：写一个好解释、给出有用建议、判断回答是否安全。

Karpathy 区分 verifiable setting 里的 reinforcement learning 和不可验证或偏好型 setting 里的 reinforcement learning ([Deep Dive, around 02:51:33](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10293s))。Harness 也应该这样区分。目标能做成可验证时，就不要只让模型“听起来对”。

## 行为不等于能力

Post-training 可以显露、压制或重定向预训练中学到的能力。模型可能知道如何写 exploit code，但拒绝提供。它可能能解决数学题，却因为 assistant 行为鼓励快速流畅回答而没认真计算。它可能学过某种工具格式，却在略有不同的 schema 上失败。

Harness engineer 应该区分：

- 模型能表示什么；
- 模型倾向于输出什么；
- 产品政策允许什么；
- harness 允许什么动作。

混淆这些层会导致坏设计。拒绝不证明模型没有能力。自信回答不证明模型知道事实。工具调用字符串不证明动作应该执行。

Jailbreak 展示了这种分离。Karpathy 给出例子说明 adversarial prompt 或多模态输入可以把模型推离 safety behavior ([Intro to LLMs, around 00:46:16](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2776s))。重要的不是某个具体攻击字符串，而是：安全行为是学出来的，并受上下文影响。它应该由 policy checks、permission boundaries、tool gating 等 harness 控制强化。

## Fine-Tuning vs Harnessing

Fine-tuning 改模型。Harnessing 改模型周围环境。许多问题应该先在 harness 里解决：

- 需要当前文档？用检索。
- 需要精确计算？用工具。
- 需要稳定输出格式？用 schema validation 和示例。
- 需要更安全副作用？用权限和沙箱。
- 需要任务可靠性？做 eval 和 trace。

当某种行为必须跨大量调用内化，或长 prompt 造成延迟不可接受时，fine-tuning 很有力。但它不能替代 source-of-truth state、执行控制或验证。

## 要点

- 预训练创造广泛 next-token 能力；post-training 塑造 assistant 行为。
- SFT 用期望回答样例训练模型。
- RLHF 和 preference optimization 把输出推向偏好行为。
- Harness 不应把模型行为误认为保证真实、权限或执行。

