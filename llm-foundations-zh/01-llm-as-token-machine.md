# 第 1 章：把 LLM 看成 Token 机器

最有用的第一近似很简单：大语言模型接收一串 token，然后预测后续 token。它并不直接“看见”单词、文件、网页、测试套件、数据库或用户；它看到的是这些对象被编码后的 token 序列，并继续生成新的 token。

Karpathy 在短讲座一开始就刻意去神秘化：一个训练好的模型可以粗略理解为两个文件，一个保存参数，另一个知道如何运行这些参数 ([Intro to LLMs, around 00:00:24](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=24s))。这不是完整实现说明，但它是很好的纠偏：模型本身不是 agent。它更像一个函数式组件，把 token context 映射成下一个 token 的概率分布。

## 参数是压缩后的行为

参数文件里保存着数十亿到数万亿个学出来的数字。预训练阶段，这些数字被不断调整，使模型越来越擅长预测大规模文本中的下一个 token。经过 post-training 后，同一个参数文件还会编码 assistant 行为：遵循指令、拒绝某些请求、按指定格式输出，并偏向人类更喜欢的回答。

模型知识不是数据库里的行。它分布在权重中。这个区别对 harness 设计非常关键。如果系统需要当前政策、精确发票、用户私有文档或可审计引用，harness 应该检索或提供这些信息。模型可以基于给定材料推理，但不应该被当成可变事实或高风险事实的 source of truth。

Karpathy 用文件系统里的普通文件来说明参数：参数文件可以被复制、下载，也可以被运行时代码加载 ([Intro to LLMs, around 00:01:35](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=95s))。参数文件大小大致由参数数量和数值精度决定。一个 70B 参数模型，如果每个参数用 2 bytes 存储，仅参数文件就约 140 GB。这不是比喻，而是实实在在的工程对象。

这个框架能帮助我们拆开四件经常被混在一起的事：

- **模型架构**：计算结构，例如 Transformer。
- **参数**：让架构具备具体能力的学得数字。
- **运行时**：加载参数并执行 inference 的代码。
- **产品系统**：聊天 UI、工具系统、记忆层、安全层、部署层和评估层。

两个系统可能使用相同架构但参数不同。两个产品也可能使用同一个参数文件，但因为一个有工具、检索和记忆，另一个没有，最终能力完全不同。

## 模型本身没有副作用

原始语言模型不会执行代码、发送邮件、打开浏览器、修改仓库，也不会自动记住下一次对话。它只输出 token。副作用来自周围系统对这些 token 的解释和执行。这就是 model 和 harness 的核心边界。

例如模型可能输出：

```text
{"tool": "read_file", "path": "/repo/README.md"}
```

到这里为止，什么都还没有发生。harness 必须解析这个输出，判断调用是否被允许，执行文件读取，捕获结果，再把结果以某种形式送回模型。模型提出动作，harness 决定动作是否真的发生。

所以 harness engineering 不是 prompt engineering 的放大版。harness 负责执行、状态、权限、观察、重试、压缩、检索和评估。

## 训练产生参数

有了参数之后，运行时代码就可以执行 inference。但运行时代码并不能解释参数从哪里来。参数来自训练：这是一个在数据、算力和时间上都很昂贵的大规模优化过程。Karpathy 对比了“运行模型”这个相对普通的动作和“产生参数”这个昂贵动作，后者可能需要大规模 GPU 集群和长时间训练 ([Intro to LLMs, around 00:03:59](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=239s), [00:05:16](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=316s))。

这对 harness engineer 的实际意义是：大多数时候你不是在训练 base model，而是在使用一个已经训练好的模型产物。你的杠杆在别处：

- 选择模型和供应商。
- 设计 prompt 和 context。
- 提供工具和检索。
- 限制副作用。
- 评估行为。
- 判断模型升级是否可以上线。

Fine-tuning 位于 base-model training 和 harnessing 之间。它能改变参数，但它仍然不能替代外部状态、权限控制和验证。

## 文本界面，系统行为

用户看到的是一个文本框。Karpathy 的 deep dive 一开始问的就是：这个文本框背后是什么？生成出来的词到底是怎么来的？([Deep Dive, around 00:00:28](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=28s))。对 harness engineer 来说，答案是：一个被软件系统包起来的概率文本接口。

概率部分解释了为什么小的 prompt 改动会影响结果，为什么输出会有变化，为什么看似确定的行为在分布变化时仍会失败。软件外壳解释了为什么一些产品能浏览网页、引用来源、操作电脑、保存长期记忆或运行测试，而另一些使用类似基础模型的产品做不到。

同一个文本框背后可能是很不同的系统：

- 一个 raw completion model 接收普通前缀。
- 一个 chat model 接收带 system/user/assistant role 的序列化对话。
- 一个检索系统先注入文档，再调用模型。
- 一个 agent loop 允许模型调用工具并观察结果。
- 一个多模态模型把图片或音频转换成 token 或类似 token 的表示后再生成。

从外部看，它们都像是在“问模型”。从 harness 角度看，它们是不同的运行时系统，失败模式也不同。

## 模型输出不等于产品行为

最好把 *behavior* 留给整个系统。模型输出 token，产品决定这些 token 意味着什么。

例如模型输出一个 Markdown 链接。聊天应用可能渲染它；浏览器自动化 harness 可能点击它；安全层可能阻止它；eval harness 可能因为 URL 没有来源支持而判错。每一种产品级结果都依赖模型之外的代码。

这个区别可以避免两个常见错误。第一个错误是把浏览、记忆、执行等 harness 提供的能力都归功于模型。第二个错误是把工具设计糟糕、检索过期、指令模糊或缺少验证导致的问题全部归咎于模型。

## 对 Harness 的影响

应该把模型看成强大但有边界的组件：

- 权威状态放在模型外部。
- 工具副作用必须显式、可审计。
- 每一步只给模型需要的上下文。
- 需要为真的输出必须验证。
- 评估完整的 model-harness loop，而不是只评估单次回答。

后面的章节会逐步展开这个框架。[Tokenization](./02-tokenization.md) 解释模型输入到底是什么；[预训练](./03-next-token-prediction.md)解释广泛能力从哪里来；[inference 和 sampling](./06-inference-and-sampling.md) 解释行为为什么会变化；[post-training](./07-post-training.md) 解释 assistant model 为什么不只是 raw completion；[检索](./11-embeddings-and-retrieval.md)、[工具](./12-reasoning-tools-and-agents.md)和 [evals](./13-evaluation-for-llm-behavior.md) 则解释为什么严肃系统必须有 harness。

## 要点

- LLM 在操作上应被看作 token 输入、token 输出的组件。
- 参数编码的是压缩后的统计结构和行为，不是可查询数据库。
- 工具调用和真实世界效果由 harness 创建，不由模型单独创建。
- Harness engineering 从 token 输出变成系统动作的边界开始。
