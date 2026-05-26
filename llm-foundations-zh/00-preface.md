# 前言

大语言模型很容易上手，却很难可靠运行。聊天框背后藏着许多机制：tokenization、预训练、Transformer inference、采样、post-training、context window、检索和工具调用。对 harness engineer 来说，这些不是背景知识，而是会直接影响系统行为的工程接口。

这本书就是写给这个角色的。

本书的目标不是从数学上推导 Transformer，也不是教你训练 frontier model，而是建立一个能支持工程判断的心智模型。当 agent 忘记约束、编造引用、选错工具、被无关检索内容带偏，或者一次很小的 prompt 修改导致输出退化时，工程师应该能判断问题大致出在模型、上下文、检索、工具、采样、状态还是评估。

本书主要整理自 Andrej Karpathy 的 [Intro to Large Language Models](https://www.youtube.com/watch?v=zjkBMFhNj_g) 和 [Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI)。第一期讲座用“两个文件”拆解 LLM：参数文件，以及运行这些参数的代码。第二期讲座进一步展开数据、tokenization、训练、inference、post-training、工具和 agent。本书把这些内容组织成一条面向 harness engineering 的学习路线，并在必要处补充基础论文引用。

## 读者需要什么背景

你需要熟悉软件工程概念，比如 API、状态、测试、日志、缓存、权限和部署。你不需要先掌握深度学习数学。遇到数学概念时，本书优先解释它对工程设计的影响，而不是把公式本身当作重点。

## 本书不做什么

本书不教你训练前沿模型，不比较每一家模型供应商，也不完整综述所有 alignment 方法。这个领域变化太快，写成百科反而不实用。

本书关注的是对 harness 长期有用的稳定事实：

- 语言模型读写的是 token。
- Context window 有限、昂贵，而且不是长期记忆。
- 模型知识压缩在参数里，不应被当成数据库。
- Sampling 是行为的一部分，不是实现细节。
- 检索和工具调用属于 harness 的责任。
- 评估必须覆盖模型和 harness 组成的完整系统。

## 和 Agent Harness 教材的关系

配套教材 [Agent Harness：实践者教材](../agent-harness-zh/) 从模型外部开始：上下文管理、工具、沙箱、工作流模式和评估。本书从模型内部边界开始：harness 调用模型时，模型到底在做什么。

这两本书应该配合阅读。只有 harness engineering 而没有 LLM 基础，容易变成经验主义的 prompt 调参；只有 LLM 基础而没有 harness engineering，则会停留在一个能说话、但不能安全做事的模型上。
