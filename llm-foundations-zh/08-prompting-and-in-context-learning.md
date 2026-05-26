# 第 8 章：Prompting 与 In-Context Learning

Prompting 是构造模型上下文，让期望的 continuation 更可能发生。In-context learning 则是模型在不改变参数的情况下，根据 prompt 里的指令和示例调整行为的能力。GPT-3 论文通过 zero-shot、one-shot、few-shot 实验让这个能力成为核心话题 ([Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165))。

对 harness engineer 来说，prompting 不是小技巧，而是在概率接口上做运行时编程。

## 指令、数据和示例

好的 prompt 会把不同职责分清：

- **指令**说明要做什么；
- **数据**提供证据或输入；
- **示例**展示期望模式；
- **约束**定义不要做什么；
- **输出合同**定义回答形状。

这些内容混在一起时，模型必须自己推断哪段文本更有权威。当上下文里包含检索网页、用户上传文档、日志或工具结果时，这种混杂尤其危险。

Harness 应该清楚标记边界。检索到的邮件是数据，不是指令。用户消息的优先级低于系统策略。工具结果可能包含恶意文本，不应该覆盖 harness 的行为规则。

Deep dive 的 conversation tokenization 进一步说明：role 不是漂浮在模型之上的抽象概念，它会变成序列化 prompt 中的 token ([Deep Dive, around 01:05:03](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3903s))。如果 harness 把所有内容压成一个无差别的文本块，就等于放弃了 chat model 用来理解优先级和作者身份的重要信号。

实用边界包括：

- 给检索文档使用 XML-like tag；
- 使用明确 source ID；
- 工具结果放在单独 message；
- 系统级规则不要放在用户可编辑字段里；
- 明确区分 task 和 evidence；
- 输出 schema 和示例分开。

重点不是让模型像编译器一样解析 XML，而是用清晰结构让期望的 continuation 更容易出现。

## Few-Shot Learning

Few-shot 示例之所以有效，是因为模型擅长继续模式。如果上下文里有多个 input-to-output 映射，模型通常能把同样的映射应用到新输入。这对格式、分类、抽取和领域风格尤其有用。

示例消耗 token，所以要谨慎选择。Harness 可以按任务类型或 failure mode 动态检索示例。当主要问题是输出格式时，也可以用验证过的结构化 schema 替代大量示例。

Few-shot prompting 特别适合规则难以完全写清楚的任务：

- 把 support ticket 分到公司内部类别；
- 把粗糙笔记改写成特定内部语气；
- 从凌乱文档中抽取字段；
- 把自然语言请求映射到工具调用；
- 展示如何处理“证据不足”。

但示例也会让上下文过拟合。如果所有示例都是正例，模型可能默认新案例也是正例。如果示例使用过期政策，模型可能继续过期政策。如果示例有偶然格式瑕疵，模型也可能复制。

示例应被当成数据依赖：版本化、review、测试。

## Chain-of-Thought 和推理 Prompt

Chain-of-thought prompting 说明，大模型在生成中间推理步骤时，可以在某些多步推理任务上表现更好 ([Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://arxiv.org/abs/2201.11903))。Harness 层面的结论不只是“让模型一步一步想”。更深的结论是：任务分解有帮助。

限制同样重要。Chain-of-thought 的收益取决于模型规模、任务类型、prompt 设计和 decoding。较小或 post-training 较弱的模型未必受益。可见的 reasoning text 也不保证真实反映模型内部计算；它只是一个输出产物，可能有帮助，也可能误导或事后合理化。

相关技术之一是 self-consistency：采样多个 reasoning path，再选择最一致的答案，而不是相信第一个 greedy path ([Self-Consistency Improves Chain of Thought Reasoning in Language Models](https://arxiv.org/abs/2203.11171))。它能提高一些 reasoning benchmark 的表现，但会成倍增加成本，而且仍然需要可靠地选择或验证答案。

在生产系统中，可见推理可能不合适、太冗长，或根本不可用。Harness 仍然可以通过其他方式支持分解：

- planning field；
- 对最终用户隐藏的 scratchpad；
- tool loop；
- checklist；
- 分派给更小调用的子任务；
- verification pass。

重点是给系统中间工作空间，同时不要把中间文本和最终输出混淆。

## 为工具使用写 Prompt

工具使用 prompt 不同于普通问答。模型必须判断是否需要外部信息，选择工具，填写参数，解释 observation，然后继续。Karpathy 的 intro 用浏览器和图像生成例子说明，现代 assistant 经常依赖工具，而不只是“在头脑里思考” ([Intro to LLMs, around 00:28:20](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1700s), [00:32:06](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1926s))。

工具 prompt 应说明：

- 什么时候用工具；
- 什么时候不要用；
- 每个参数是什么意思；
- 工具不能做什么；
- 工具失败时怎么办；
- 如何报告结果。

模型不应该只从函数名里猜这些规则。

## Prompt Injection 是上下文边界失败

Prompt injection 并不神秘。它是上下文边界失败。不可信内容里包含看起来像指令的文本，而模型又被要求基于这段文本生成。如果 harness 不保留优先级和边界，模型可能遵循错误文本。

例子包括：

- 检索网页说“忽略之前所有指令”；
- 用户上传文档里藏着面向 assistant 的命令；
- 工具结果包含看起来像 system message 的文本；
- 图片里有 adversarial text，被 OCR 或 vision 模型读到。

缓解手段不只是“写更强 system prompt”。Harness 应限制工具、分隔不可信内容、验证动作，并避免让不可信文本直接控制副作用。

## Prompt 的限制

Prompt 不是持久记忆。它只是每次调用时的 context。如果某条指令没有出现在后续调用里，模型可能就不会遵守。如果摘要压缩掉了约束，约束就消失了。如果旧上下文和新指令矛盾，行为可能退化。

所以长运行 agent 需要 prompt 外部的显式状态：文件、数据库、任务计划、trace 和 memory store。Prompt 可以把相关状态切片呈现给模型，但不应该是状态唯一存在的地方。

## 要点

- Prompting 塑造模型最可能产生的 continuation。
- In-context learning 让示例在不改权重的情况下影响行为。
- Chain-of-thought 展示了中间分解的价值，但 harness 应控制推理如何表示。
- Prompt 是运行时上下文，不是持久状态。
