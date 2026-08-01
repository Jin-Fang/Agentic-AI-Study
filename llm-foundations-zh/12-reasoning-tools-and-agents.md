# 第 12 章：推理、工具与 Agent

LLM 可以生成类似推理的文本，但一次模型调用只能使用它收到的输入，也不能独自在现实世界中产生效果。工具跨越了这条边界：模型输出所请求操作的表示，外部系统执行该操作，再把结果作为后续模型调用的新输入。

Karpathy 的 intro 把 tool use 和 retrieval 作为超越纯文本生成、扩展模型能力的方式来讨论 ([Intro to LLMs, around 00:41:33](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2493s))。ReAct 这类研究系统展示了语言模型如何在 reasoning、action 和 observation 之间交替 ([ReAct](https://arxiv.org/abs/2210.03629))。Toolformer 则探索模型如何学习何时调用 API、如何调用 API ([Toolformer](https://arxiv.org/abs/2302.04761))。

## 工具调用是模型输出

工具使用不会改变模型作为 token generator 的基本性质。在描述了可用操作及其参数的 context 下，模型可以生成普通文本，也可以生成结构化的调用表示。即使 constrained decoding 保证了某种结构，生成过程产生的仍是一个拟议调用，而不是操作执行本身。

所以“模型能浏览”只是简写。模型不会独立打开页面。外部 runtime 提供 browser-like operation，执行被选中的调用，再把得到的页面内容编码进后续 context。

## 最小 Call/Result 协议

这套逻辑协议需要 call identifier、operation name、arguments，以及用同一 identifier 配对的 result。例如：

```yaml
assistant_call:
  id: c1
  name: get_weather
  arguments:
    city: Paris
```

外部系统执行操作后，可以返回：

```yaml
tool_result:
  call_id: c1
  content:
    temp_c: 17
    sky: clear
```

这是对协议外部表示的 vendor-neutral 记法，并不是每种 API 的字面 wire format。Provider 可能把 call 和 result 序列化为 typed message、JSON object、special-token sequence 或其他 model-specific structure。模型在 post-training 中学习相应的调用模式；见[第 7 章](./07-post-training.md)。

流式输出中尚未完成的表示还不是完整调用。表示完成后，syntax validity、schema conformance、semantic correctness 和 authorization 仍是不同问题。合法 JSON 可能包含错误字段；符合 schema 的参数仍可能写错城市；合理的请求也仍可能被禁止。只有外部系统能决定是否以及如何执行。

## 最小 Agent Loop

工具型 agent 可以归结为一个很短的循环：

1. 外部 runtime 把任务 context 和可用操作的描述交给模型。
2. 模型生成回复或结构化调用。
3. 如果输出是调用，runtime 决定是否执行。
4. Runtime 把结果作为 observation 放进新的 context。
5. 模型继续生成，直到产出 final response 或 runtime 停止循环。

Observation 不会更新模型参数。它之所以能改变后续生成，是因为它被加入了输入 context。因此，一连串模型调用加上外部执行可以表现得像 agent，尽管每次单独的模型调用仍然只是条件生成。

## 工具增加了什么

不同操作沿不同轴扩展模型：

- **外部知识**操作可以提供检索到的或当前的信息；
- **精确计算**操作可以完成计算或可重复的转换；
- **环境交互**操作可以读取文件、打开页面或检查其他 live state；
- **外部状态**操作可以在模型之外创建、更新或发送内容；
- **生成式操作**可以产出其他模态的 artifact。

原生多模态本身不是 vision tool。多模态模型可以把编码后的图像直接作为输入的一部分，而外部 vision 或 OCR tool 会执行一次独立操作，再返回文本或结构化 observation。无论哪种情况，模型接收的都是一种表示，而不是对现实世界的直接访问。

## 推理与行动

推理和行动扮演不同角色。类似推理的计算可以帮助模型利用当前 context 选择或排列步骤。行动可以获得该 context 中原本没有的信息，或请求改变外部状态。ReAct 强调的正是这种反馈模式：reasoning 指导 action，返回的 observation 再影响下一步。

这套协议不应被误认为忠实的 chain-of-thought 记录。有些系统暴露 reasoning-like text，有些把中间推理隐藏起来，还有些返回简短 summary 或 plan。这些是不同的 artifact；可见 plan 不一定是产生 action 的计算过程实录。能够可靠观察的协议边界是拟议 action 及其返回的 observation。记录这两者有助于区分不良调用与误导性或失败的结果，而无须声称能够访问模型的完整推理过程。

Reasoning model 可能会在回复或行动前使用更多 test-time compute。这可以改善模型对现有 context 的利用，却不会创造新证据、执行操作，也不会在调用之间提供持久状态。

## 模型边界

从这个 loop 可以直接得到几个限制：

- 输出 call 不代表操作已经运行或成功；
- 一次模型调用不会自然地为下一次调用保留任务状态；连续性来自再次提供的 context，或来自外部保存的状态；
- Tool result 会变成输入 context，它可能不完整、错误或带有对抗性。模型无法在数据与指令之间提供可靠的 trust boundary；见[第 8 章](./08-prompting-and-in-context-learning.md)；
- Authorization 和外部副作用属于执行调用的系统，而不是提出调用的模型。

这些事实构成了从模型基础到系统设计的桥梁。配套教材 *Agent Harness* 详细介绍[工具接口与调用生命周期](../agent-harness-zh/06-tools-invocation-lifecycle.md)、[权限与 runtime enforcement](../agent-harness-zh/07-sandboxing-runtime-enforcement.md)、[持久状态](../agent-harness-zh/10-state-event-history-production-factors.md)、[人工监督](../agent-harness-zh/14-human-agent-interaction.md)，以及 [computer use 与多模态 agent](../agent-harness-zh/15-computer-use-multimodal-agents.md)。

## 要点

- 工具调用是结构化模型输出，不是已执行的动作。
- 最小 agent loop 在模型生成、外部执行调用和返回 observation 之间交替。
- 推理可以塑造行动，而行动可以增加证据或改变外部状态。
- 执行、授权、持久状态和监督都存在于模型之外。
