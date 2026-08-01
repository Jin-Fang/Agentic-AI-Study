# Foundations → Harness 知识衔接表

本表说明 *LLM Foundations* 中的模型侧概念，在本书中会转化成哪项工程责任。“交接”并不表示 harness 改变了模型机制，而是标出在真实系统中使用该机制时，周边系统必须承担的控制。

| Foundations 概念 | 模型侧边界 | Harness 工程责任 | 继续阅读 |
|---|---|---|---|
| [Token 与模型输出](../llm-foundations-zh/01-llm-as-token-machine.md) | 模型生成 token 概率与结构化输出；它不会直接造成外部效果。 | 解析提议、保存 correlation ID、授权 dispatch、执行并验证 outcome。 | [第 1 章](./01-what-is-an-agent-harness.md)、[第 6 章](./06-tools-invocation-lifecycle.md) |
| [Tokenization](../llm-foundations-zh/02-tokenization.md) | 文本与多模态输入消耗 model-specific budget；可见字符数或图片尺寸不是可移植的 token 估算。 | 按所选 provider/model 契约计量，并执行 context 与视觉输入预算。 | [第 3 章](./03-context-as-finite-resource.md)、[第 15 章](./15-computer-use-multimodal-agents.md) |
| [Next-token prediction](../llm-foundations-zh/03-next-token-prediction.md) | 流畅续写不能证明事实、授权、执行或任务完成。 | 把 proposal 与 effect 分开，按 evidence 或 environment state 评分，而不是按措辞自信度评分。 | [第 1 章](./01-what-is-an-agent-harness.md)、[第 11 章](./11-evaluation.md) |
| [Attention](../llm-foundations-zh/04-transformer-attention.md) | Attention 只作用于当前模型输入，不会形成持久记忆。 | 选择、排序、压缩、检索 context 并追踪 provenance；在模型外保存持久状态。 | [第 3 章](./03-context-as-finite-resource.md)、[第 5 章](./05-compaction-memory-context-handoffs.md)、[第 10 章](./10-state-event-history-production-factors.md) |
| [数据与 Scaling](../llm-foundations-zh/05-training-data-and-scaling.md) | 训练覆盖与 scale 影响能力，但不能建立具体任务的 readiness。 | 在有代表性的任务与风险 slice 上评估精确的 model-plus-harness release。 | [第 11 章](./11-evaluation.md)、[第 18 章](./18-agentops.md) |
| [推理与采样](../llm-foundations-zh/06-inference-and-sampling.md) | Sampling 使不同 attempt 具有变异；constrained decoding 可以约束形状，但不能保证语义有效或获得权限。 | 运行重复 trial、验证语义，并在输出语法之外独立 gate 副作用。 | [第 6 章](./06-tools-invocation-lifecycle.md)、[第 11 章](./11-evaluation.md) |
| [Post-training](../llm-foundations-zh/07-post-training.md) | 学得的交互惯例与 instruction following 属于行为属性，不是 access-control 保证。 | 在 context 中表达 instruction priority，但通过 runtime policy 与 PEP 执行受保护 action。 | [第 2 章](./02-system-prompts-instructions-policy.md)、[第 7 章](./07-sandboxing-runtime-enforcement.md) |
| [Prompting 与 In-context Learning](../llm-foundations-zh/08-prompting-and-in-context-learning.md) | Prompt 结构可以引导行为；不可信文本仍可能通过 prompt injection 操纵模型。 | 追踪 assembly provenance，把检索内容与工具结果视为不可信输入，缩小权限，并在 prompt 外执行策略。 | [第 2 章](./02-system-prompts-instructions-policy.md)、[第 4 章](./04-production-retrieval-grounding.md)、[第 7 章](./07-sandboxing-runtime-enforcement.md) |
| [Context Window 与缓存](../llm-foundations-zh/09-context-window-and-kv-cache.md) | Context 有限；单次请求内的 KV state 不等于 provider 跨请求 prompt cache 的契约。OpenAI 与 Anthropic 都分别规定了 provider-specific eligibility 和 retention 行为（[OpenAI](https://developers.openai.com/api/docs/guides/prompt-caching)、[Anthropic](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)）。 | 预算并转换 context，在有益时保留 cache-compatible prefix，并分别限定 response/semantic cache 的 scope 与失效条件。 | [第 3 章](./03-context-as-finite-resource.md)、[第 5 章](./05-compaction-memory-context-handoffs.md)、[第 18 章](./18-agentops.md) |
| [知识、幻觉与不确定性](../llm-foundations-zh/10-knowledge-hallucination-uncertainty.md) | 看似可信的回答、citation-shaped string 或口头不确定性都不是经过验证的 evidence。 | 检索有权限的 evidence，把 citation 绑定 source version，支持 abstain，并分别评估 grounding 与 outcome。 | [第 4 章](./04-production-retrieval-grounding.md)、[第 11 章](./11-evaluation.md)、[第 13 章](./13-loop-engineering.md) |
| [Embedding 与检索](../llm-foundations-zh/11-embeddings-and-retrieval.md) | Embedding similarity 与最小 RAG 不负责 ingestion、ACL、freshness、deletion 或 provenance。 | 负责生产检索数据路径，并把 retrieval、grounding、citation 与 task outcome 分层评估。 | [第 4 章](./04-production-retrieval-grounding.md) |
| [推理、工具与 Agent](../llm-foundations-zh/12-reasoning-tools-and-agents.md) | 模型可以提出结构化 tool/computer action；application 执行后把结果返回模型（[Anthropic tool-use protocol](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works)）。 | 完成调用生命周期、执行权限、控制 retry 与副作用，并确认最终 environment state。 | [第 6 章](./06-tools-invocation-lifecycle.md)、[第 7 章](./07-sandboxing-runtime-enforcement.md)、[第 15 章](./15-computer-use-multimodal-agents.md) |
| [评估模型行为](../llm-foundations-zh/13-evaluation-for-llm-behavior.md) | 模型级 task、trial、grader 与 pass metric 本身不能测量工具执行、环境状态或运营可靠性。 | 建设 evaluation harness：调用生产 agent harness、记录 transcript/outcome、隔离环境并报告系统级 slice。 | [第 11 章](./11-evaluation.md)、[第 16 章](./16-infrastructure-noise.md)、[第 17 章](./17-trace-driven-iteration.md) |
| [运行时心智模型](../llm-foundations-zh/14-operational-mental-model.md) | 模型负责预测；它不拥有 context selection、持久状态、权限、真实工具效果或后果。 | 在 harness、runtime、product、control plane、enforcement point 与 evaluation harness 之间明确分配这些责任。 | [第 1 章](./01-what-is-an-agent-harness.md)、[第 19 章](./19-agent-fleets-control-plane.md)、[第 20 章](./20-outlook.md) |

## 如何理解边界

三条规则可以避免大多数类别错误：

1. **Model output** 可以提出 action；**execution result** 表示 executor 返回了什么；经过验证的 **outcome** 表示环境实际发生了什么变化。
2. **Context** 是当前 call 的输入；**memory** 是供未来检索的信息产品；**execution state** 与 **event history** 支撑 workflow progress 与 recovery。
3. 模型可见的 instruction 可以降低不良行为概率；只有不可绕过的 runtime control 才能提供执行保证。

双语版本采用的规范定义见[术语表](./glossary.md)。
