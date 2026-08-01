# 第 14 章：操作性心智模型

## 全书归纳

LLM 是一个具有广泛习得能力的条件 token 生成器。给定编码后的 context，它会产生下一个 token 的概率分布；反复选择 token，最终形成文本或结构化提议。训练塑造模型参数，prompting 为某次推理提供条件，decoding 则决定如何选择续写。这些机制都不会让模型变成数据库、持久状态存储、外部事实的权威来源，或现实世界动作的执行者。

前面的章节逐步建立了这幅图景。[第 1–7 章](./01-llm-as-token-machine.md)解释模型的核心机制，从 token 和 next-token prediction 一直讲到 attention、训练、推理与 post-training。[第 8–13 章](./08-prompting-and-in-context-learning.md)讨论 prompting、context、知识、检索、工具调用和评估，同时标出模型行为在哪里结束、系统责任从哪里开始。本章最后把这些边界归纳成一套操作性心智模型。

## 模型—系统责任边界

六类模型属性决定了边界应该画在哪里：

| 模型属性 | 模型能做什么 | 外部系统必须做什么 |
|---|---|---|
| 生成只以编码后的当前 context 为条件。 | 解释和转换当前 context 中提供的 representation。 | 选择、组装并序列化模型收到的 context。 |
| Context 有限，而且模型自身没有持久状态。 | 使用当前调用中表示出来的信息。 | 在模型外持久化状态，并决定之后把什么重新引入 context。 |
| 参数化知识不完整，而且可能过时。 | 回忆习得的模式，并基于所提供的 evidence 推理。 | 从外部来源取得权威或当前事实。 |
| 能力分布参差不齐，而且生成具有概率性。 | 在广泛任务上产生有用的候选答案。 | 对要求精确或可靠的部分做验证；用评估测量行为，而不是假定评估本身会提高可靠性。 |
| 工具调用只是一种输出，不是外部效果。 | 提议动作或输出结构化参数。 | 授权、校验并执行动作，同时承担其后果。 |
| 模型可能混淆数据与指令。 | 遵循习得的指令和安全行为，降低——但无法消除——产生不安全提议的概率。 | 在模型外建立信任边界，并控制权限和现实世界效果。 |

这条边界并不是对模型是否“智能”的判断。它直接来自模型执行什么计算，以及它无法控制什么。

## 能力是参差不齐的

模型能力是参差不齐的，不是一个统一的旋钮。一个模型可能解出困难的多步证明，却数错单词里的字母；也可能写出合理的数据库 schema，却算错简单算术。这种 “jagged”（参差）或 Swiss-cheese（瑞士奶酪）式能力分布意味着，在一个任务上成功，并不能证明它在邻近任务上也可靠。

Tokenization 可以解释一部分字符级弱点（见[第 2 章](./02-tokenization.md)），训练覆盖的不均匀可以解释一部分知识缺口（见[第 5 章](./05-training-data-and-scaling.md)）。但更广泛的操作性结论是：能力判断需要具有代表性、可重复的证据，详见[第 13 章](./13-evaluation-for-llm-behavior.md)；精确要求仍需要模型外部的验证。

## 从 Foundations 到 Agent Harness

本书解释这些外部责任为什么存在。配套教材 [《Agent Harness：实践者教材》](../agent-harness-zh/README.md)解释系统可以如何实现它们：

- Context 选择与持久状态：[《上下文是一种有限资源》](../agent-harness-zh/03-context-as-finite-resource.md)、[《压缩、记忆与上下文交接》](../agent-harness-zh/05-compaction-memory-context-handoffs.md)和[《状态、事件历史与生产要素》](../agent-harness-zh/10-state-event-history-production-factors.md)。
- 动作与外部效果：[《工具与调用生命周期》](../agent-harness-zh/06-tools-invocation-lifecycle.md)。
- 信任、权限与隔离：[《沙箱、护栏与运行时执行》](../agent-harness-zh/07-sandboxing-runtime-enforcement.md)。
- 可靠性测量：[《评估》](../agent-harness-zh/11-evaluation.md)。
- 模型选择、路由、成本与运维：[《模型选择、路由与推理预算》](../agent-harness-zh/08-model-selection-routing-reasoning.md)和[《AgentOps：成本、隐私与生产运维》](../agent-harness-zh/18-agentops.md)。

同一条边界也适用于多模态系统：模型接收的是文本、图片、音频或视频的编码 representation，而不是世界本身；representation 选择见[《Computer-Use 与多模态 Agent》](../agent-harness-zh/15-computer-use-multimodal-agents.md)，其中的信任问题见[《沙箱、护栏与运行时执行》](../agent-harness-zh/07-sandboxing-runtime-enforcement.md)。

## 最该记住的一句话

Karpathy 在 deep dive 结尾给出了一条务实提醒：把这些系统当作工具使用，但不要完全信任它们（[Deep Dive, around 03:09:24](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11364s)，[03:30:42](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=12642s)）。正确态度既不是否定，也不是崇拜，而是在利用模型广泛能力的同时，把权威性、持久性、验证和后果交给真正能够提供它们的系统。

如果只记住一句话，记住这一句：

**模型预测 token；harness 负责 context、状态、工具、权限、验证和后果。**

## 要点

- 把责任分配到模型—系统边界的正确一侧。
- 根据模型属性推导边界，而不是根据输出是否流畅来判断。
- 不要把一次有能力的模型回答误当成一个可靠的系统。
