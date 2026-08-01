# 第 7 章：Post-Training

预训练教模型在广泛的文本分布上预测 token；post-training 则在更窄的数据或反馈上继续优化，使模型更常表现得像一个 assistant。Karpathy 的 introduction 把预训练和 fine-tuning 分开讲，并描述后续阶段如何让模型更适合对话和指令遵循场景 ([Intro to LLMs, around 00:14:29](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=869s))。

这个区别有助于解释：源自相似架构的 base model 和 assistant model，为什么会表现得如此不同。Post-training 改变各种可能输出的概率；它可以让有帮助的回答、拒绝、特定风格和多轮交互约定更容易出现，但这些倾向并不是对正确性、安全性或完整性的形式化保证。

## Supervised Fine-Tuning

Supervised fine-tuning，简称 SFT，会在输入与期望回答配对的样例上继续训练。样例可以包括指令与回答、对话、格式模式或领域任务。模型仍然通过 token prediction 学习，通常把 loss 集中在目标回答的 token 上，但新数据会把输出分布推向被演示的行为。

SFT 数据可以由人编写、由其他模型生成，也可以由人工数据和合成数据混合而成。数据在训练前还可能经过筛选、修改或标注。不同项目的数据构成并不相同，因此，纯人工数据或纯合成数据都不是 SFT 定义的一部分。

一个最简对话样例如下：

```text
User: Explain gradient descent.
Assistant: ...
```

在大量此类样例上训练后，相似 prompt 更容易得到 assistant-like continuation。一个有用的心智模型是：模型会复现入选答案中的模式，包括语气、细节程度、请求澄清的方式，以及拒绝哪些类型的请求。它并不会因此获得答案编写者或选择者的意图和理解。

SFT 可以教会模型有用的任务行为，但成功模仿训练分布本身，既不能证明回答为真，也不能保证这种行为能泛化到每个新输入。

## 学得的交互约定

对话中的 role 和边界最终都必须表示为 token。Chat template 可以把 role 标签、消息分隔符、轮次结束符和其他 control token 序列化成一个序列。当这些模式出现在 post-training 数据中时，它们就成为模型所学分布的一部分。

因此，assistant model 可能学会一些约定，例如以 assistant role 回答、回应当前请求、在信息不足时提问澄清、使用熟悉的格式，以及在预期边界结束回答。如果训练数据对某些类别的请求包含拒绝样例，模型也可以学会 refusal pattern。

这些约定是统计规律，而不是在模型外实现的符号协议。其可靠性取决于训练分布和 inference 时给出的 context。熟悉的序列化方式可以更稳定地诱发学得的行为，而不同或含糊的序列化方式则未必如此。

## 偏好优化：RLHF、DPO 与 AI Feedback

SFT 会演示期望回答，但许多质量标准通过比较候选答案来表达，比编写唯一的理想答案更容易。在 InstructGPT 工作中，标注者编写 demonstrations、排序模型输出，并提供 preference data，用来训练 reward model，再通过 reinforcement learning from human feedback（RLHF）优化 policy ([Training Language Models to Follow Instructions with Human Feedback](https://arxiv.org/abs/2203.02155))。

经典 RLHF 流程包含五个阶段：

1. 训练一个 SFT assistant model，或从这样的模型开始。
2. 针对 prompt 采样多个候选回答。
3. 收集人类 ranking 或 pairwise preference。
4. 训练 reward model 去预测这些偏好。
5. 优化 assistant policy 以获得更高的预测 reward，通常同时约束它不要离 reference model 太远。

Reward model 是另一个学得的模型。它把候选回答及其 context 映射成一个分数，近似 comparison data 中的偏好 ([Deep Dive, around 02:52:39](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10359s))。Reference constraint 会限制 policy optimization 偏离起始行为的程度；如果没有这种约束，优化更容易把 policy 推进 reward model 不可靠的区域。

Direct Preference Optimization（DPO）利用 preferred 和 dispreferred response，通过 classification-like objective 优化 policy，不再采用相同的独立 reward-model 训练和在线 reinforcement-learning loop ([Direct Preference Optimization](https://arxiv.org/abs/2305.18290))。它是另一种从偏好中学习的方法，而不是真理来源。

Preference judgment 也可以部分来自模型，而不完全直接来自人。例如，Constitutional AI 使用书面原则引导的反馈，从而减少部分 harmlessness training 所需的人工标注量 ([Constitutional AI](https://arxiv.org/abs/2212.08073))。无论反馈来自人还是模型，其质量和覆盖范围都会塑造优化所强化的行为。

## 代理奖励与 Reward Hacking

学得的 reward 是设计者所关心质量的代理。人类偏好先被压缩成有限的比较数据，再由模型近似，因此得到的分数必然不完整。Karpathy 把 reward model 描述为 human preference 的有损模拟 ([Deep Dive, around 03:00:54](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10854s))。

当 policy 针对一个不完美的 proxy 被强力优化时，它可能找到分数很高、却不符合底层意图的输出。这就是 reward hacking ([Deep Dive, around 03:04:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11051s))。Policy 可能学会偏好答案的表面标记，变得不必要地冗长，过度赞同用户，或利用 reward model 的盲点。

Reference constraint 和其他 regularization 可以限制优化移动的幅度，但不能把 proxy 变成真理。Preference optimization 可以提高平均的主观评分，同时仍在训练比较未覆盖的区域引入系统性偏差。

## 可验证奖励与 RLVR

有些训练任务可以直接计算 reward。精确答案可以与已知结果比较，证明可以被检查，程序可以针对测试运行，游戏也可以返回分数。另一些质量——例如解释是否有帮助、语气是否合适——则更依赖主观判断。

Reinforcement learning with verifiable rewards 通常简称 RLVR，它使用这种可检查的结果作为 reinforcement signal。Karpathy 区分了可验证领域中的 reinforcement learning 与基于不可验证偏好的 reinforcement learning ([Deep Dive, around 02:51:33](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10293s))。对于适用的任务，可验证信号比 preference score 更容易大规模使用，也更少依赖主观判断。

验证仍然只覆盖 checker 实际测量的范围。通过 checker 并不能证明回答具备所有理想性质；在可验证任务上的提升，也不一定会均匀迁移到缺少同类反馈的任务。RLVR 可以强化得到可检查结果的问题求解行为，但不能证明生成的推理忠实或普遍可靠。[第 8 章](./08-prompting-and-in-context-learning.md)会讨论 inference 时的推理行为。

## 行为不等于能力

Post-training 会改变可观察行为，也可能改善、压制或重定向任务表现。因此，区分 behavior 和 capability 很有用，但 capability 并不是一个可以直接观察、固定不变的量。模型产生什么，取决于输入、学得的回答倾向、decoding 和具体任务。

一次拒绝表明，模型在该 context 中产生了学得的 refusal behavior；它本身并不能证明模型在其他所有 context 下都没有能力生成所请求的内容。反过来，一次成功回答不能证明能力足够稳健，自信的回答也不能证明底层主张为真。

同样的限制也适用于 safety behavior。Post-training 可以降低不理想输出的概率，但学得的 refusal policy 并不是硬性保证。[第 10 章](./10-knowledge-hallucination-uncertainty.md)会讨论不确定性、幻觉和 refusal behavior，[第 12 章](./12-reasoning-tools-and-agents.md)会区分模型生成的动作与动作执行。模型外的正式控制属于配套教材 [Agent Harness](../agent-harness-zh/README.md)。

## Full Fine-Tuning 与 Parameter-Efficient Fine-Tuning

训练目标和选择哪些参数参与训练，是两个相互独立的决定。Full fine-tuning 会更新 base model 的全部或几乎全部参数，并生成一个反映这些更新的新 checkpoint。由于知识和行为分布在许多参数中，针对一个任务的更新也可能改变模型在其他任务上的表现。

Parameter-efficient fine-tuning（PEFT）会冻结大部分 base 参数，只训练一小部分参数。LoRA 是常见的 PEFT 方法，它学习选定权重矩阵的 low-rank update。其他方法会添加 adapter，或训练少量类似 prompt 的参数。这些方法减少了可训练参数的数量，也可以把 task-specific change 与 base checkpoint 分开存储，但其质量和 runtime 特性取决于具体方法与任务。

Full fine-tuning 和 PEFT 都通过训练数据与优化目标改变学得的行为。两者都不会把模型参数变成 live database，也不能提供持续更新且带有来源归属的事实。[第 11 章](./11-embeddings-and-retrieval.md)介绍如何从外部集合中检索信息，[第 14 章](./14-operational-mental-model.md)总结模型属性与外围系统之间的边界。

## 要点

- Post-training 通过额外优化，让 base model 更可能表现得像 assistant。
- SFT 数据可以由人工编写、合成或混合而成；它既教任务回答，也教序列化的交互约定。
- RLHF、DPO 和 AI-feedback 方法通过偏好引导行为，但其目标仍是 proxy，而不是真理。
- RLVR 为结果可验证的任务提供可检查 reward，但其信号只覆盖实际被验证的部分。
- 拒绝和成功回答都是对行为的观察，而不是关于能力、真实性或安全性的完整证明。
- Full fine-tuning 更新大部分或全部参数；LoRA 等 PEFT 方法只训练较小的参数集合。
