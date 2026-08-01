# 第 1 章：把 LLM 看成 Token 机器

最有用的第一近似很简单：大语言模型接收一串 token，并为下一个可能出现的 token 计算概率。它并不直接看见单词、文件、网页或用户，而是接收表示当前上下文的 token ID 序列。

## Token 输入，概率输出

对于给定的 token 上下文，模型会为词表中的每个 token 计算一个分数。运行时将这些分数转换成下一个 token 的概率分布。从这个意义上说，LLM 是一个从 token 序列映射到下一个 token 概率的参数化函数。

Karpathy 在短讲座中使用了一个刻意去神秘化的框架：一个训练好的模型可以粗略理解为两个文件，一个保存参数，另一个保存知道如何运行这些参数的代码（[Intro to LLMs, around 00:00:24](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=24s)）。真实实现包含更多机制，但这一近似揭示了基本接口：输入 token 上下文，输出下一个 token 的概率分布。

## 序列如何生成

一次计算通常不会直接产生完整回答。生成过程会重复以下基本操作：

1. 计算当前 token 上下文。
2. 产生下一个 token 的概率分布。
3. 按照某种解码规则选择一个 token。
4. 将这个 token 追加到上下文。
5. 重复以上步骤，直到满足停止条件。

这里使用“选择”一词很重要。贪心解码选择概率最高的 token，随机解码则从概率分布中采样。两者都是解码规则，但贪心选择不属于采样。[Inference 和 sampling](./06-inference-and-sampling.md) 会详细说明这个循环及其停止条件。

## 架构、参数、运行时与应用层

四个层次经常被混在一起：

- **架构**定义计算的形状，例如 decoder-only Transformer。
- **参数**是通过学习得到、使架构具备具体特性的数值。
- **运行时**加载参数、计算模型，并应用解码规则。
- **应用层**准备输入、调用运行时，并解释或呈现输出。

两个模型可能共享同一种架构，但包含不同的参数。反过来，两个应用也可能调用同一个 checkpoint，却因为准备了不同的上下文，或以不同方式解释返回的 token，而呈现不同的用户体验。

Karpathy 把参数描述为可以复制、下载并由运行时代码加载的普通文件，使这个概念变得具体（[Intro to LLMs, around 00:01:35](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=95s)）。参数文件的存储大小大致取决于参数数量和数值精度。一个 700 亿参数的模型，如果每个参数用 2 bytes 存储，仅参数本身就需要约 140 GB，尚未计入运行时开销。

## 参数从哪里来

参数由训练产生，而不是由 inference 循环产生。预训练期间，优化过程反复修改参数，以降低模型在大规模 token 序列集合上的下一个 token 预测误差。创建大型 checkpoint 可能需要大量数据、算力和时间，而运行已有 checkpoint 则是更常规的操作（[Intro to LLMs, around 00:03:59](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=239s)、[00:05:16](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=316s)）。

[Post-training](./07-post-training.md) 从预训练 checkpoint 开始，进一步修改已经学得的参数，或加入学得的 adapter 参数，从而塑造遵循指令、答案格式和拒答等倾向。其结果是更新后的 checkpoint 或另一组新增的学得权重，而不是让原始参数文件保持不变。

大多数模型使用者不会自己创建 base checkpoint，而是通过 API、inference provider 或本地运行时调用已有 checkpoint。无论 inference 在哪里运行，这一区分都成立：训练产生学得的参数，运行时使用这些参数计算下一个 token 的概率。

## 参数不是数据库

参数编码的是分布式统计结构和学得的行为。它们不是可以按键查询、作为精确记录检查或逐条更新事实的数据库行。模型可以复现训练中学到的事实和模式，但参数文件并不是权威数据库，也不会为每个生成的断言附带内置来源。

这一区分说的是表示方式，而不是模型能否回答事实问题。模型可以从学得的参数中流畅地回忆信息，但这不会让参数变成记录存储系统。

## Token 不会产生外部副作用

模型的直接输出是 token。生成的后续文本可能描述读取文件、发送消息或采取其他动作，但生成这段描述并不会让动作真正发生。外部软件必须解释输出并执行相应操作。

[推理、工具与 agent](./12-reasoning-tools-and-agents.md) 会再次讨论这条边界：模型可以生成一个拟议调用，外部系统执行它，并可能返回 observation。动作提议和外部效果始终是两个不同的事件。

## 一次模型调用不等于完整应用

Karpathy 的 deep dive 一开始就问：文本框背后是什么，生成出来的词又从哪里来（[Deep Dive, around 00:00:28](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=28s)）？在模型边界上，答案是 token 生成循环；在应用边界上，还包括构造输入、调用运行时和处理输出的软件。

讨论 *模型行为* 仍然是有意义的：这个说法可以指特定条件下学得的倾向、概率分布或生成序列。但可观察到的应用行为还可能包含界面呈现、存储状态和外部效果。这些额外结果并不是一次模型调用单独产生的。

接下来的章节会进一步展开模型侧图景：[Tokenization](./02-tokenization.md) 解释文本如何变成 token ID，[下一个 token 预测](./03-next-token-prediction.md) 解释训练目标，[Transformer attention](./04-transformer-attention.md) 解释核心架构，[inference 和 sampling](./06-inference-and-sampling.md) 解释解码。模型边界之外的系统设计属于配套教材 [Agent Harness](../agent-harness-zh/README.md)，尤其是其中关于 [harness 边界](../agent-harness-zh/01-what-is-an-agent-harness.md)、[状态与事件历史](../agent-harness-zh/10-state-event-history-production-factors.md)、[权限与副作用](../agent-harness-zh/07-sandboxing-runtime-enforcement.md)和[评估](../agent-harness-zh/11-evaluation.md)的章节。

## 要点

- LLM 将 token 上下文映射为下一个 token 的概率。
- 序列生成会重复下一个 token 预测和 token 选择，直到满足停止条件。
- 架构、参数、运行时与应用层是彼此不同的层次。
- 预训练和 post-training 产生学得的参数；inference 使用这些参数。
- 参数是分布式的学得表示，而不是可查询数据库。
- 模型生成的 token 本身不会引发外部动作。
