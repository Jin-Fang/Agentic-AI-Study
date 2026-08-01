# 第 3 章：Next-Token Prediction

自回归语言模型的预训练目标非常简单：给定前面的 token，预测下一个 token。在每个位置，模型会为词表里的每个 token 分配概率；训练会奖励模型给真实后续 token 分配更高的概率。Karpathy 用从大数据集中抽取 token window、反复预测接下来会出现什么的方式演示了这个过程 ([Deep Dive, around 00:15:36](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=936s))。

这个目标为预训练提供学习信号。它本身不会赋予模型权威的事实存储、意图或 assistant 人设。

## Next-Token 目标

假设一个训练序列以这句话开头：

```text
The capital of France is Paris.
```

它提供了一系列预测目标：

```text
The                         -> capital
The capital                 -> of
The capital of              -> France
The capital of France       -> is
The capital of France is    -> Paris
```

实际单位是 token 而不是单词，因此真实边界可能和这个简化展示不同。同一个目标适用于 prose、代码、对话、数学推导、表格和 Markdown。无论文本采用什么形式，训练目标都表示成 continuation token，而不是单独编写的符号规则。

## 训练文本变成 Token 序列

训练开始前，源文本会经过过滤、转换，再由 tokenizer 编码。得到的 token ID 会被组织成模型能够处理的长度有限的序列。每个序列都会为训练提供许多 prefix-target 关系。

在 Karpathy 的小型演示中，清洗后的数据集被表示成一条很长的 token 数组，训练窗口从中采样 ([Deep Dive, around 00:14:34](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=874s))。这是一种有用的教学方式，并不是对生产训练的普遍描述。生产 pipeline 可能保留文档边界、插入 boundary token、拆分长文档，或把多个文档片段打包成固定长度的序列。具体构造方式决定模型会遇到哪些跨片段 transition。

不变的核心是：训练在带有 next-token target 的 token 序列上进行。它不要求把整个语料库变成一条语义上毫无边界的长流。

## Loss 和 Gradient 更新

对一个 target token 而言，loss 是模型为它分配的概率取负对数。正确 token 的概率高，loss 就低；概率低，loss 就高。对所有预测位置的这个数值取平均，就得到 cross-entropy loss；在这里它也称为 negative log-likelihood。

使用自然对数时，perplexity 是平均 cross-entropy 的指数。它把 loss 放到“有效选择数”的尺度上：perplexity 为 10，对应的平均不确定程度等同于从 10 个选项中均匀选择。Karpathy 把 loss 描述为训练过程试图降低的单一数字 ([Deep Dive, around 00:35:58](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=2158s))。

训练循环是：

1. 构造一批 token 序列及其 next-token target。
2. 运行模型，在每个预测位置产生 probability distribution。
3. 计算 target token 的平均 loss。
4. 在模型中反向传播 gradient。
5. 使用 optimizer 更新参数。
6. 在许多 batch 上重复。

没有人会为每种语法模式、事实或代码惯例分别编写规则。Gradient update 会改变许多参数，让类似训练分布的 continuation 变得更可能。

## 记忆与泛化

这个目标不会强迫模型在记忆和泛化之间二选一。模型可以记住一些完全相同或近似相同的序列，尤其是重复出现或特征鲜明的序列。它也可以学习许多样本共享的规律，再把这些规律应用到训练时没有见过的序列上。后一种行为就是泛化。

Karpathy 使用 compression 作为直觉：一个能很好预测文本的模型，捕捉了数据中的结构 ([Deep Dive, around 00:50:22](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3022s))。这个类比是有损的，而不是像 zip 一样的无损压缩。参数可以编码广泛模式、关联和一些精确字符串，却不会把每个来源都保存成可恢复的记录。

这也解释了为什么参数化知识并不是权威或自动保持最新的信息源。它反映训练分布及其时间覆盖范围，可能混合相互冲突的模式，而且不会天然保留生成结论的来源。一个看似合理的 continuation 并不等于经过验证的事实。

## 为什么预测会产生广泛能力

为了改进在网页、书籍、代码、论文和对话上的 next-token prediction，模型需要形成对许多潜在规律的表示。语法有助于预测句子，事实关联有助于预测百科式段落，程序结构有助于预测代码，对话惯例有助于预测 conversation，算术和推理模式则有助于预测带步骤的示例。

GPT-3 论文表明，足够大的自回归模型可以根据 context 中的指令或示例适配许多任务，而不需要针对任务更新参数 ([Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165))。这就是 in-context learning，第 [8 章](./08-prompting-and-in-context-learning.md) 会进一步讨论。

这些结果并不能证明模型在所有意义上都具有人类式理解，也不意味着每种能力都会同等或可靠地出现。它们说明，同一个预测目标可以产生支持许多下游行为的内部表示。

## 有能力不等于有意图

预训练通过改变参数来降低 prediction loss。它不会让模型内在地承诺做到 helpful、truthful 或 safe。Base model 学到的是有帮助的回答、有害段落、正确解释、错误以及许多其他文本的统计模式。模型会继续哪种模式，取决于它学到的分布和收到的 prefix，而不是独立形成的意图。

因此，改变 prefix 可以改变可能 continuation 的分布。这是 prompting 和 in-context learning 的基础，但通过 prefix 进行 conditioning 并不会安装新的训练目标或持久意图。

## Base Model 与 Assistant Model

Next-token pretraining 的直接结果是 base model。它可以补全文本、模仿格式、回答一些问题并复现许多学到的模式，但不一定经过优化，能始终以 helpful conversational assistant 的方式回应。

[Post-training](./07-post-training.md) 会进一步改变模型的输出分布，提高 instruction following、conversational helpfulness 和 learned refusal 等行为的概率。这些 assistant 行为是学到的 response tendency，不是存在内在意图的证据，也不能保证真实性或安全性。

## 要点

- 自回归语言模型通过预训练，根据前面的 token 预测每一个 next token。
- 训练使用长度有限的 token 序列；把整个数据集表示成一条长流是说明性实现，不是普遍要求。
- Cross-entropy loss 和 gradient update 会同时产生记忆与泛化。
- 广泛的预测能力不会创造内在意图或权威知识。
- Base model 来自预训练；assistant 行为则由 post-training 进一步塑造。
