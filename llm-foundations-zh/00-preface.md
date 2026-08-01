# 前言

## 为什么需要这本书

通过 API 调用大语言模型并不难，但聊天界面会隐藏那些塑造模型行为的机制。Tokenization 会改变模型实际接收到的内容；训练决定哪些模式被写入参数；有限的 context 会限制哪些信息能够影响回答；decoding 则把 next-token probability 转化为生成文本。如果缺少对这些机制的理解，人们很容易把流畅的输出误认为最新知识、可靠推理或已经核实的事实。

本书解释这些机制以及它们形成的边界。它的目的不是让模型的每一次回答都变得可预测，而是让模型行为不再那么神秘，并为读者提供一套精确的分析语言。

## 目标与读者

本书面向使用大语言模型的软件工程师和技术读者，并沿着一条面向工程实践的 LLM 基础路线展开：token、next-token prediction、Transformer attention、训练数据与 scaling、inference 与 decoding、post-training、prompting、context、知识边界、检索、工具调用和评估。

读完本书后，读者应该能够从 token、训练、context、decoding 和外部证据这些角度解释模型行为，也应该能够区分哪些性质属于模型本身，哪些性质属于围绕模型构建的应用。

## 素材来源

本书主要整理自 Andrej Karpathy 的 [Intro to Large Language Models](https://www.youtube.com/watch?v=zjkBMFhNj_g) 和 [Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI)。第一期讲座用两个组成部分来理解 LLM：参数，以及运行这些参数的代码。第二期讲座进一步展开数据、tokenization、训练、inference、post-training 和实用的心智模型。本书把这些讲座整理成一条书面学习路线，并在基础论文能够为具体概念提供依据时补充相应引用。

## 先修要求与非目标

读者应该熟悉 API、测试和日志等基本软件工程概念，不需要预先掌握深度学习数学。在数学有助于理解时，本书只引入理解相关机制及其后果所需的内容。

本书不教读者如何训练 frontier model，不比较当前所有模型供应商，也不完整综述每一种 alignment 方法。这些目标要么变化很快，要么需要更深入的篇幅。本书关注的是一套稳定的基础，用来理解工程师和技术读者在实践中遇到的模型。

## 稳定的模型性质

接下来的章节围绕几项模型侧的事实展开：

- 语言模型接收和生成的是 token，而不是直接接收和生成词语或意义。
- 模型的 context 有限，而且不是持久记忆。
- 训练期间学到的知识分布在参数中；这些参数不是实时、权威的数据库。
- Decoding 规则从 next-token probability 中选择 token，因此生成方式的配置也是最终行为的一部分。

后续章节会进一步细化这些表述，说明这些简化说法的边界，并解释外部证据如何进入模型的 context，而不会因此变成存储在模型参数中的知识。

## 配套教材

配套教材 [Agent Harness：实践者教材](../agent-harness-zh/) 介绍围绕模型构建的系统，包括 context 管理、工具、沙箱、工作流模式和评估。本书则建立这些系统设计必须考虑的模型机制与行为边界。两本书都可以独立阅读；当主题跨越这条边界时，读者可以沿配套链接继续了解。

本书的章节地图和推荐阅读顺序见 [README](./README.md)。
