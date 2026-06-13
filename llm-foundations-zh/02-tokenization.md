# 第 2 章：Tokenization

模型处理文本之前，文本必须先转换成 token。Token 可能是完整单词、词片段、标点、空白模式、byte，或其他 subword 单元。模型并不是以人类句子的形式接收 `hello world`，而是接收一串 token ID，每个 ID 指向词表里的一个条目。

Karpathy 在 deep dive 里花了不少时间演示 tokenizer，因为它解释了很多工程里的意外现象：空格会影响 token ID，大小写会影响切分，罕见字符串可能被拆成很多片段 ([Deep Dive, around 00:12:07](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=727s))。对 harness 来说，tokenization 不是冷知识。它决定成本、延迟、context 容量，有时还会影响模型行为。

## 为什么需要 Subword Token

如果词表只包含完整单词，系统会很脆弱。新人名、代码标识符、URL、化学字符串、emoji、多语言文本都会不断落到词表之外。如果只用字符，序列又会变得太长。

Subword tokenization 是折中方案。Byte Pair Encoding 及相关方法会把高频字符串表示成较大的 token，把罕见字符串表示成较小 token 的组合。Sennrich、Haddow 和 Birch 在神经机器翻译中使用 subword units 来处理稀有词和未见词 ([Neural Machine Translation of Rare Words with Subword Units](https://arxiv.org/abs/1508.07909))。

BPE 构建词表的方式，是从单个 byte 或字符出发，反复把出现频率最高的相邻对合并成一个新 token，每次合并让词表增长一点。由于基础单元是原始 byte，任何输入都总能被编码成某种 token 序列，所以不存在 out-of-vocabulary 的情况；陌生字符串只是回退成更小的片段。这也是本章后面大多数“意外现象”有同一个根源的原因：边界就是这些学到的合并恰好产生的结果。

现代 LLM tokenizer 在巨大规模上使用类似思想，词表规模通常从数万到约 10 万甚至更多 token。不同模型家族的 tokenizer 不同，所以同一段文本在不同系统中的 token 数可能不同。

## Token 预算不是单词预算

Harness 经常以“文档”“消息”“段落”为单位思考，但模型真正受 token 限制。英文散文通常几个字符对应一个 token，但代码、表格、JSON、base64、日志、CJK 文本和 URL 的 token 行为都可能完全不同。

这带来几条实际规则：

- 发送大上下文前先数 token，可以用 tokenizer 库或供应商的 token-count 接口。要用和目标模型匹配的 tokenizer 来计数，因为不同模型家族的 token 数不同。
- 按语义单元截断，而不是按字符粗暴截断。
- 不要把日志、表格、压缩 JSON 直接倒进 prompt。
- 优先设计能先搜索、过滤、总结再返回结果的工具。
- 多语言输入和代码输入要单独测试。

只按文件数或字符数管理上下文的 harness，迟早会溢出窗口或浪费预算。

## 空白和格式会影响模型输入

Tokenizer 往往会把前导空格编码进 token。这就是为什么 `"world"` 和 `" world"` 可能是不同 token。普通 prose 里这通常不显眼，但在代码里，缩进、换行和标点会形成模型从训练数据中学到的模式。

这也解释了为什么模型对 prompt 格式敏感。一个干净的 Markdown 任务和示例，可能 token 化成模型很熟悉的模式。一个塞满转义字符的 JSON 文本块也许仍可解析，但它更远离模型自然学会遵循指令的分布。

这对工具设计很重要。如果模型必须输出结构化数据，应选择既能被机器解析、又对模型自然的格式。字段清晰的小 schema，比深度嵌套在 JSON 字符串里的转义代码容易得多。

Karpathy 用 tokenizer 示例演示了这一点：大小写、前导空格、标点变化都可能产生不同的 token 序列 ([Deep Dive, around 00:12:33](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=753s))。具体 token ID 不重要，重要的是：模型输入是一条离散编码流，小的文本变化也可能改变这条流。

因此 prompt template 应该被当成代码。看似只是 Markdown 美化的修改，也可能改变 token 边界、把关键指令推远，或改变模型需要继续的模式。

## 对话也会被 Tokenize

Chat model 接收的不是某种神秘的“对话对象”。对话会被序列化成 token。system、user、assistant、tool 这些角色，最终都要通过 chat template 变成具体 token 序列。Karpathy 在 deep dive 后面专门回到 conversation tokenization，说明不仅普通字符串会被 tokenize，对话本身也会被 tokenize ([Deep Dive, around 01:05:03](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3903s))。

这对 harness 设计很重要：

- 模型在 [post-training](./07-post-training.md) 中学习的是供应商的 chat 格式。
- 构造 prompt 时必须保留 role 边界。
- 工具结果应该和用户指令清楚分隔。
- 作为 assistant message 插入的摘要，和作为 system/developer context 插入的摘要，模型可能会以不同方式理解。
- [Prompt injection](./08-prompting-and-in-context-learning.md) 经常就是把类似指令的文本塞进 data 位置。

如果 harness 手工拼 conversation string，就必须理解目标模型期望的模板。否则可能制造 distribution shift：模型看到的序列不像它被训练去遵循的对话。

## Special Token 和工具协议

现代 assistant 通常会用 special token 或结构化模板来表达工具调用、拒绝行为和多模态输入。即使 API 隐藏这些细节，模型仍然会接收某种编码表示。工具调用可能被表示成 JSON-like 文本、特殊消息元数据，或供应商内部格式。

这意味着 harness 不是简单地把字送给模型，而是在构造一种编码协议。这个协议必须表达：

- 谁说了什么；
- 哪些数据来自工具；
- 期望什么输出形状；
- 有哪些动作可用；
- 哪些历史消息仍然相关；
- 哪些内容不可信。

序列化做得不好，会抹掉这些边界。

## 多模态 Tokenization

同一个 token-machine 框架也能扩展到文本之外。Deep dive 结尾，Karpathy 讲到音频和图片也可以被 tokenized，或表示成类似 token 的单元：音频可以被切成表示片段，图片可以用 patch 表示 ([Deep Dive, around 03:09:57](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11397s))。不同模型的实现会不同，但对 harness 的结论是稳定的：多模态输入同样消耗预算，也同样需要边界。

例如一个能看图的 assistant 可能同时接收截图的视觉 token 和用户文本指令。harness 不应假设模型像人一样“看见”。它接收的是有分辨率限制、有编码取舍、可能有盲点的表示。对 computer-use agent 来说，截图、DOM 文本、accessibility tree 和 OCR 是环境的不同编码方式，每一种都会改变模型能注意到什么。

## Tokenization 的常见失败模式

常见失败包括：

- 字符数看起来能放下，token 数却超限。
- 检索到的代码块比预期消耗更多上下文。
- 非英文文档比英文文档更早被截断。
- JSON 工具结果包含大量转义文本，既贵又难读。
- 摘要删除了 role 边界，导致模型把 data 当成 instruction。
- 截图被缩小或编码后，小但关键的 UI 文本不可见。

这些大多是表示和预算层面的失败，而不是推理失败：模型本身有能力，只是编码掩盖或扭曲了它需要的信息。下一节讲的是另一类问题，那里 tokenization 会直接削弱某种能力。

## Tokenization 导致的能力盲区

有些弱点和预算完全无关。由于字符被打包进 token，模型从来看不到干净的字母流或数字流，于是凡是按单个字符操作的任务都会系统性地变难。拼写、数字符（经典的“strawberry 里有几个 r”）、反转字符串，以及数字被切到不同 token 边界从而影响算术，都是常见例子。Karpathy 在 deep dive 里回到这一点，指出模型在拼写上表现差正是这个原因 ([Deep Dive, around 02:01:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7271s))。

对 harness 的启示是：把这类任务交给工具，而不是让模型靠直接观察去完成。code interpreter 可以精确地计数、反转或计算，模型再读回结果。把字符级操作和精确算术当成 tool call，而不是模型应该“在脑子里”可靠完成的事。

## Tokenization 与 Context Engineering

每一个工具结果都在和系统指令、示例、检索文档、历史对话和中间推理争夺 token 预算。Tokenization 把 context engineering 变成了预算管理问题。

好的 harness 应该让 token 成本可见：

- 记录每一步输入和输出 token。
- 追踪哪些工具产生最大上下文负载。
- 提供 concise 和 detailed 两种响应模式。
- 对大型对象使用 ID 和 handle，而不是反复粘贴全文。
- 把源文本留在文件或数据库里，需要时检索切片。

Tokenization 是 context 不能被当成无限草稿纸的第一个原因。

## 要点

- 模型处理 token ID，而不是人类意义上的原始文字。
- Subword tokenization 让模型能处理罕见字符串，但也带来意外 token 数。
- 格式、空格、代码和多语言文本都会显著影响 token 使用。
- Harness 应该在 token 层面计数、预算、截断和检索。
