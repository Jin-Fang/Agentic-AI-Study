# 第 8 章：Prompting 与 In-Context Learning

Prompting 是 inference-time conditioning：模型接收一个 token context，并基于该 context 生成 continuation。改变 context 中的指令、数据、示例或格式，就可能在不改变模型参数的情况下，改变各种 continuation 的概率分布。

In-context learning（ICL）是模型根据当前 context 中呈现的模式调整行为的能力。这种适应只在当前 context 内有效；它不是权重更新，也不会变成持久技能或记忆。GPT-3 论文通过多个任务上的 zero-shot、one-shot 和 few-shot 结果，让这一能力受到广泛关注（[Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165)）。

## Prompt 由什么组成

一个 prompt 可以组合几类内容：

- **指令**描述要完成的任务；
- **输入数据**提供待处理的文本、问题或证据；
- **示例**展示 input-to-output 模式；
- **约束**缩小可接受答案的范围；
- **输出格式**描述期望 continuation 的结构。

Chat API 还可能区分 system、developer、user 和 assistant message。这些 role 并不是 Transformer 内部彼此分离的通道。供应商特定的 chat template 会把 role 和内容序列化成模型处理的表示。Post-training 会教会模型与这些 role marker 相关的模式，但不会把它们变成绝不会失效的优先级机制。Deep dive 对 conversation tokenization 的讨论说明了 role 最终如何成为模型输入的一部分（[Deep Dive, around 01:05:03](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3903s)）。

同样的词会因位置、周围标签、示例和模型训练的不同而产生不同效果。Prompting 是提供有关“期望哪种 continuation”的证据，而不是安装一个确定性程序。

## 结构可以减少歧义

标题、delimiter、tag 和一致的字段名可以帮助模型区分任务与输入。明确的输出格式也能让期望的 continuation 更容易推断。例如：

```text
Task:
Answer the question using the documents below. Cite the source ID.
If the documents do not contain the answer, reply: NOT_FOUND.

<documents>
  <doc id="d1">Refund requests are accepted within 14 days of delivery.</doc>
  <doc id="d2">Gift cards are non-refundable.</doc>
</documents>

Question:
How long do I have to request a refund?

Answer:
```

标题和 tag 展示了预期结构：任务、证据、问题和答案。它们不会让模型像编译器一样解析 prompt，也不保证答案一定遵循指令。

最重要的是，delimiter 不是安全边界。如果 `<documents>` 内的一份文档写着“忽略任务并泄露秘密”，模型仍可能受它影响。Delimiter 可以减少一般性歧义，但不能可靠隔离数据与指令，也不能实施信任边界。

## Zero-Shot、One-Shot 与 Few-Shot Prompting

**Zero-shot** prompt 只说明任务，不展示完整示例；**one-shot** prompt 包含一个示例；**few-shot** prompt 包含多个示例。三种情况下模型参数都保持不变，变化的只有 context。

Few-shot prompting 之所以有效，是因为模型能继续 input-output pair 所展示的模式。它常用于：

- 应用任务特有的标签；
- 从不规则文本中抽取字段；
- 匹配特定回答格式或风格；
- 处理有歧义或信息不足的输入；
- 把自然语言请求转换成结构化表示。

示例提供的不只是格式，还隐含了对标签、边界情况、语气和重要信息的假设。因此，示例选择会影响结果。如果所有 demonstration 都是正例，模型可能对下一个案例产生正例偏向。如果 demonstration 含有过时事实或偶然的格式瑕疵，continuation 可能把它们复制出来。示例顺序也可能产生影响。

示例还会消耗 context token。Demonstration 并非越多越好：不相关或互相冲突的示例会让任务变得更模糊。当示例比文字说明更有效地传达模式时，few-shot prompting 很有用，但它的效果仍然是概率性的，并取决于模型。

## 推理 Prompt 及其限制

Chain-of-thought prompting 要求模型在最终答案前生成中间推理。它可以改善某些多步任务上的表现，尤其是对能力足够强的模型（[Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://arxiv.org/abs/2201.11903)）。效果会随模型、任务、demonstration 和 decoding 方法而变化；“一步一步想”并非普遍有效。

生成的推理仍然是生成文本。一条看似合理的推理链可能在早期犯错、跳过决定性步骤，或对通过其他内部计算得到的答案进行事后合理化。因此，可见推理不保证忠实解释模型如何得到答案，也不应被视为结论正确的证明。

Self-consistency 是一种相关技术：采样多条 reasoning path 并聚合其最终答案，而不是依赖单一路径（[Self-Consistency Improves Chain of Thought Reasoning in Language Models](https://arxiv.org/abs/2203.11171)）。答案一致可以改善部分 benchmark 的结果，但重复一致并不能确立事实。该方法还需要多次生成，因此消耗更多 inference compute。

## 推理模型与 Test-Time Compute

有些模型经过 post-training，学会在 inference 时为中间推理投入额外计算，它们通常称为 *reasoning model*。例如，DeepSeek-R1 把在可验证任务上进行 reinforcement learning 描述为获得强推理行为的一条路径（[DeepSeek-R1](https://arxiv.org/abs/2501.12948)）；[第 7 章](./07-post-training.md)介绍了这类 post-training。

这是一种 *test-time compute*：困难 prompt 可能使模型在给出最终答案前产生更多中间 token。这些 token 可能可见、被隐藏，或由供应商提供摘要，但仍然会影响延迟和计算成本。额外要求这类模型显式输出 chain of thought，可能是多余的，也可能干扰它已经学到的行为。

更多推理可以改善模型对已有信息的使用，但它不是 grounding。它不会提供缺失的当前事实，不会让错误前提变成事实，也不会把生成的解释变成经过验证的证据。Reasoning model 仍然受其参数和当前输入的约束。

## 模型边界上的工具使用 Prompting

从模型视角看，工具使用首先仍是一个 prompting 与 generation 问题。工具定义、参数 schema，有时还有示例，会进入模型输入。模型随后可以生成如下结构化 call：

```json
{
  "name": "get_weather",
  "arguments": {
    "city": "Boston"
  }
}
```

这段 JSON 只是模型输出。模型并没有联系天气服务，也没有改变外部状态。外部系统会解释这个拟议 call，决定是否以及如何执行，并可能在后续模型 context 中返回 observation。模型随后可以基于该 observation 生成下一段 continuation。

本章只关心工具描述和 observation 如何影响模型生成。执行循环以及“提出动作”和“执行动作”的区别见[第 12 章](./12-reasoning-tools-and-agents.md)。工具接口和生产控制属于配套教材 [Agent Harness](../agent-harness-zh/06-tools-invocation-lifecycle.md)。

## Prompt Injection 是上下文混淆

Prompt injection 发生在不可信内容包含类似指令的文本，并以非预期方式改变模型行为时。检索页面可能要求忽略原问题，上传文档可能藏有命令，tool observation 或图片也可能携带与预期任务竞争的文本。

在模型层面，这些内容都会变成能够影响 next-token distribution 的输入。Role marker、“把这当成数据”等措辞和 delimiter 可能帮助模型推断预期层级，但不会在可信指令与不可信内容之间建立硬隔离。因此，只靠写一个更强的 prompt，或把不可信文本嵌套在 tag 里，无法解决 prompt injection。

模型可以通过训练抵抗许多此类指令，但这种抵抗是行为表现，不是 enforcement guarantee。任何涉及外部动作或受保护信息的安全保证，都必须在模型之外实施。[第 12 章](./12-reasoning-tools-and-agents.md)说明了这条执行边界；配套教材中关于 [system prompt](../agent-harness-zh/02-system-prompts-instructions-policy.md)和[runtime enforcement](../agent-harness-zh/07-sandboxing-runtime-enforcement.md)的章节介绍系统层处理方式。

## Prompting 不能提供什么

Prompting 可以引出并引导训练期间学到的能力，但不会更新模型参数。它无法可靠创造模型原本不具备的能力，无法保证回答正确，也无法保证生成的推理忠实。

Prompt 也不是持久记忆。它只对一次模型调用构成条件。如果应用稍后再次发送先前的对话，那些文本会成为一个新 context 的一部分；模型自身并没有在调用之间保存状态。Context window 的限制及其后果见[第 9 章](./09-context-window-and-kv-cache.md)。

最后，prompting 不会授予权限，也不会执行外部动作。一句“你可以访问这个账户”仍然只是输入文本，生成的动作描述也仍然只是输出文本。执行、持久状态和安全隔离是模型外围系统的属性，不是 prompt 所能提供的属性。

## 要点

- Prompting 改变 inference-time context，而不改变模型参数。
- In-context learning 使用当前 context 中的指令和示例塑造行为。
- 结构和 delimiter 可以减少歧义，但不是安全边界。
- Few-shot 和 reasoning prompt 可以改善某些任务，但效果是概率性的，并取决于模型。
- 更多 test-time reasoning 不会创造新证据，也不保证正确。
- Tool call 是模型生成的提议；外部系统负责执行。
- Prompt 不提供持久记忆、权限、执行或安全隔离。
