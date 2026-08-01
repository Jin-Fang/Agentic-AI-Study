# 第 2 章：Tokenization

语言模型处理文本之前，tokenizer 会先把文本转换成一串整数 token ID。一个 token 可能对应完整单词、单词的一部分、标点、空白与相邻字符的组合、一个 byte，或其他学到的单元。Token 边界是特定 tokenizer 的属性，并不是通用的语言学边界。

Karpathy 花时间演示 tokenizer，是因为这些例子能解释一些看似意外的行为：前导空格可能改变 token ID，大小写可能改变切分，罕见字符串可能展开成许多片段 ([Deep Dive, around 00:12:07](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=727s))。Tokenization 的直接结果是序列长度。序列长度进而影响一个 context window 能容纳多少文本；具体到某个模型和服务时，它还可能影响计算量、延迟或计费用量。

## 从文本到 Token ID

从高层看，输入路径是：

```text
文本 → token 片段 → token ID → embedding 向量
```

Tokenizer 完成前两个转换。它按照固定词表和编码规则切分文本，再查出每个片段对应的整数 ID。模型用这些 ID 从学得的 embedding table 中选择对应行。模型实际操作的是得到的向量，而不是原始字符。

解码使用反向映射：把 token ID 映射回片段，再将它们拼接成文本。但这不意味着每一种 tokenizer 都能让所有输入原样往返。可选的 normalization 可能在切分前改变文本，解码时也可能省略控制 token。如果 byte-level tokenizer 的 byte 映射和解码规则始终一致，通常可以精确保留普通输入文本。

Tokenizer 是模型规格的一部分。两个模型可以把同一个字符串切成不同片段、分配不同 ID，并得到不同的序列长度。因此 token ID 只有和匹配的 tokenizer 及词表一起使用时才有意义。

## 为什么需要 Subword Token

只包含完整单词的词表很脆弱。人名、词形变化、代码标识符、URL、科学记数法、emoji 和多语言文本都会不断产生未见过的词。只使用字符的词表可以表示这些输入，但通常会形成长得多的序列，也让模型失去把高频多字符模式作为单一单元复用的机会。

Subword tokenization 是一种折中。高频字符串可以拥有自己的 token，低频字符串则由更小的片段组合而成。Sennrich、Haddow 和 Birch 说明了如何在开放词表神经机器翻译中用 subword unit 分解罕见词和未见词 ([Neural Machine Translation of Rare Words with Subword Units](https://arxiv.org/abs/1508.07909))。

Byte Pair Encoding（BPE）、WordPiece 和 Unigram 都属于相关的 subword 方法，但它们学习和切分文本的方式并不完全相同。BPE 训练通常从一套基础单元开始，反复为选中的相邻单元对加入新 token。基础单元取决于具体 tokenizer：经典形式可能从字符或符号开始，而 **byte-level BPE** 从 byte 的某种表示开始。

这个区别很重要。如果一个 byte-level BPE tokenizer 保留完整的 byte alphabet，它就能通过 UTF-8 byte 编码任意 Unicode 文本；当没有更大的已学片段匹配时，就回退到更小的 byte 单元。不能因此声称所有 BPE tokenizer 都从原始 byte 开始，也不能声称所有 subword tokenizer 都必然不存在 unknown token。其他 tokenizer 可能使用 unknown token、字符覆盖规则，或单独的 byte-fallback 机制。

## Tokenizer 如何训练和使用

Tokenizer training 发生在 tokenizer 被用来编码模型输入之前。训练者先收集有代表性的文本语料，并决定 normalization、空白处理、pre-tokenization、基础 alphabet、special token 和词表大小。训练算法随后学习词表，以及特定方法所需的 merge rule 或 token score。模型训练一旦开始，这个 tokenizer 通常就会固定下来，使每个 token ID 始终对应同一个 embedding 行。

训练 BPE 时，算法统计相邻单元，并反复加入选定的 merge，直到达到目标词表大小或其他停止条件。Unigram tokenization 则从大量候选片段开始，学习它们的概率，在保留高概率切分的同时逐步裁剪词表。这两种过程都能产生 subword 词表，但得到的边界不必相同。

编码时，tokenizer 通常会执行以下步骤的某种组合：

1. 如果 tokenizer 定义了 normalization 规则，就先对文本进行 normalization。
2. 按照空白和 pre-tokenization 规则切分或标记输入。
3. 使用学到的词表和算法进行 segmentation。
4. 把每个片段替换成它在词表中的 ID。
5. 加入模型输入格式要求的 special token。

不同实现可能合并或省略其中一些步骤，因此应以 tokenizer 本身为准。解释生成出的 token ID 时，也必须使用它对应的 decoder。

## 如何阅读 Tokenization 示例

必须用一个具体 tokenizer 才能确定 token 边界。下表展示的是可能的切分，不代表每个模型都会如此切分：

| 文本 | 一种可能的切分 | 说明 |
|---|---|---|
| `world` 与 ` world` | 两种形式使用不同片段 | 前导空格可能和相邻文本一起编码。 |
| `unhappiness` | `un` + `happi` + `ness` | 熟悉的 subword 片段可以组合成低频词。 |
| `HTTPResponse2` | 较大片段与较小片段的组合 | 大小写、标识符和数字会改变边界。 |
| `你好` | 一个片段、多个字符片段，或 byte fallback | 语言覆盖程度和 tokenizer 的基础单元都会产生影响。 |

Karpathy 用大小写、前导空格和细小标点变化演示了同一个原理 ([Deep Dive, around 00:12:33](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=753s))。换行和缩进也可能改变代码的 token 序列。调试工具有时会用人为标记表示空格或 byte；这些标记描述的是 tokenizer 的内部表示，不一定是输入中的字面字符。

因此，小的格式变化可能产生不同的 token 序列。它们不保证一定带来明显的行为变化，但模型接收到的确实已经是另一串 ID。

## Token 数不是单词数

模型的序列限制以 token 计量，而不是以单词、文件、消息或字符计量。在熟悉的英文 prose 中，每 token 对应多少字符的粗略估算可以用于快速预判，但不能当成可靠的换算规则。

代码、表格、数字、URL、重复空白、罕见符号和不同书写系统的切分方式都可能不同。结果还取决于 tokenizer 训练时对某种语言或文本风格的覆盖程度。因此，字符数或词数相同的两段文本不一定会占用相同数量的 token。

要得到精确数量，应使用目标模型的 tokenizer 编码实际文本，再统计返回的 ID。Context window 通常必须同时容纳输入和生成的 continuation；[第 9 章](./09-context-window-and-kv-cache.md) 会详细解释这个共享的序列限制。计算量和计价策略是模型及供应商针对这些计数定义的结果，并不是 tokenization 本身的属性。

文本 token 数也不能用来估算图片、音频或其他多模态输入。这些输入使用模型特定的 encoder 和计量规则。

## Special Token 和 Chat Template

Special token 是为结构或控制用途保留的词表条目。它们可能标记序列开始或结束、分隔文档，或划分消息与角色，具体取决于模型。它们仍然是 token ID，但其含义来自模型训练时使用的格式，而不是普通书面语言。

Chat API 可能接收消息列表，但模型最终得到的仍是一段编码后的序列。**Chat template** 会把消息角色和内容渲染成模型预期的格式，通常还会插入 special token 和固定分隔符。Assistant model 在 [post-training](./07-post-training.md) 中学习这些约定。

Karpathy 在 deep dive 后面再次讲到 tokenization，说明对话和其他模型输入一样，也必须表示成 token ([Deep Dive, around 01:05:03](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3903s))。渲染后的 template 会产生消息正文中看不见的 token 开销。因此，即使用了正确的文本 tokenizer，只统计 `content` 字段也可能低估请求长度。精确计量必须同时使用目标模型的 chat template 和 tokenizer；不同模型家族或版本的格式与开销可能不同。

## 字符级能力缺口

对多数文本而言，tokenization 并不会为每个字符提供一个模型位置。一个词可能占一个 token，也可能占多个 subword token，还可能回退成字符或 byte 序列。因此，需要稳定访问单个字符的操作——例如数字母、反转陌生字符串或追踪精确拼写——可能会比表面上更困难。

这是一种倾向，不是绝对的能力缺失。模型可以学习拼写模式、推断 token 内部包含的字符，有时也能正确完成这些任务。不过，tokenization 仍然是表示方式与逐字符操作难以对齐的一个原因。Karpathy 用拼写和字母计数示例说明了这种错位 ([Deep Dive, around 02:01:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7271s))。

数字也可能被切成长度不一的片段，但 token 边界不能完整解释算术错误。训练数据、next-token objective、学得算法的局限，以及保存中间状态的难度都可能造成影响。

## 常见 Token 计量陷阱

模型特定的编码方式会带来几种反复出现的错误：

- 根据单词数或字符数估算，并把估算值当成精确上限。
- 使用另一个模型家族或 tokenizer 版本来计数。
- 只统计消息正文，没有应用 chat template 及其 special token。
- 只计量 prompt，却忽略生成 token 也会占用可用序列。
- 假设 prose、源代码、URL 和多语言文本具有相同 token 密度。
- 把文本 token 估算方式用于图片、音频或其他多模态输入。

截断还会带来一个相关问题。按字符截取不一定符合目标 token 预算，按 token 截取则可能在解码后切断句子或其他有意义的单元。Token 数决定序列能否放得下，却不能决定哪些内容在语义上可以安全删除。

## 要点

- Tokenizer 把文本映射成模型特定的 token ID；embedding lookup 再把 ID 转成模型处理的向量。
- Subword 方法在复用高频片段和组合陌生字符串之间取得平衡。
- BPE 是一类方法，只有 byte-level 变体才必然从 byte 表示开始。
- 序列长度取决于具体 tokenizer、文本、special token 和 chat template，而不是单词数。
- Tokenization 会让字符级操作变得不自然，但并非所有拼写或算术错误的唯一原因。
