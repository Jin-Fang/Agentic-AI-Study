# Agent Harness：实践者教材

*这是一份基于事实的 agent harness 工程教材。关键事实的引用放在正文对应位置，而不只集中在参考文献中。*

English version: [Agent Harness: A Practitioner's Textbook](../agent-harness/)

---

## 引言

本书讨论如何把模型输出变成受控工作的周边系统。Foundations 有意把 *harness* 用作模型外部责任的粗粒度简称；本卷进一步把周边系统拆成 **agent harness**、**runtime**、**product/application**、**platform/control plane** 和 **evaluation harness**。这一区分很重要：组装 prompt 的组件未必负责持久状态、动作执行、策略落实或结果评分。Anthropic 也明确区分被测的 agent harness，以及负责构造任务、运行 trial 和调用 grader 的 evaluation harness（[Anthropic - Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)）。

两卷共同采用一条责任边界：模型提出 token 或结构化 action；外部系统负责授权、执行、状态、验证与后果。因此，结构化 tool call 在 harness 完成验证、并由获授权的 runtime 执行之前，只是一项提议（[Anthropic - How Tool Use Works](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works)）。

---

## 如何阅读本书

这是两卷本系列的第二卷。它假定读者已经掌握 [*LLM 基础：面向 Harness Engineering 的实践者教材*](../llm-foundations-zh/) 中的模型侧机制：token、attention 与单次请求内的 KV state、context 限制、采样、post-training、检索原理、结构化 tool-call 生成、prompt injection 和模型行为评估。本卷从上一卷交接处开始，讨论生产 context assembly、检索数据路径、持久状态、工具派发、策略执行、结果验证、运维与 fleet。

如需完整建立依赖关系，请顺序阅读；也可按主题跳转：

- **核心循环与边界：**第 1–3、6–7 章
- **检索、记忆与长运行状态：**第 4–5、10、12 章
- **路由、工作流与验证：**第 8–9、11、13 章
- **人机与 computer-use 交互：**第 14–15 章
- **生产测量与运维：**第 16–19 章
- **跨书查询：**[知识衔接表](./source-map.md)与[术语表](./glossary.md)

Provider 价格、缓存行为、产品功能、benchmark 结果等时变案例都会注明 provider、适用范围与日期。它们是经过核验的案例，不是永久定义。

---

## 章节

| 章节 | 标题 | 简介 |
|------|------|------|
| [前言](./00-preface.md) | 前言 | 前置知识与 model/harness 责任边界 |
| [第 1 章](./01-what-is-an-agent-harness.md) | 什么是 Agent Harness？ | 系统分层、从提议到 outcome 的循环、责任归属 |
| [第 2 章](./02-system-prompts-instructions-policy.md) | System Prompt、指令与策略边界 | 指令优先级、prompt assembly provenance 与可执行策略 |
| [第 3 章](./03-context-as-finite-resource.md) | 上下文是一种有限资源 | Context 变换、缓存边界与工具目录策略 |
| [第 4 章](./04-production-retrieval-grounding.md) | 生产检索与 Grounding | 数据摄取、索引、ACL、检索、grounding、provenance 与评估 |
| [第 5 章](./05-compaction-memory-context-handoffs.md) | 压缩、记忆与上下文交接 | 感知损失的 compaction、scoped memory、artifact 与证据交接 |
| [第 6 章](./06-tools-invocation-lifecycle.md) | 工具与调用生命周期 | 提议、验证、授权、执行、结果规范化与 outcome 检查 |
| [第 7 章](./07-sandboxing-runtime-enforcement.md) | 沙箱、护栏与运行时执行 | Sandbox、PDP/PEP、强制审批、hook 与运营安全 |
| [第 8 章](./08-model-selection-routing-reasoning.md) | 模型选择、路由与推理预算 | 路由模式、兼容性 gate、fallback 与 reasoning control |
| [第 9 章](./09-agentic-workflow-patterns.md) | Agentic 工作流模式 | 确定性 workflow、模型驱动循环与 hybrid pattern |
| [第 10 章](./10-state-event-history-production-factors.md) | 状态、事件历史与生产要素 | Execution state、event history、checkpoint、replay、ID 与恢复 |
| [第 11 章](./11-evaluation.md) | 评估 | Task、trial、grader、transcript、outcome、可靠性与发布证据 |
| [第 12 章](./12-long-running-agents.md) | 长运行 Agent 与多上下文任务 | Milestone、artifact 交接、context reset、resume 与收尾 |
| [第 13 章](./13-loop-engineering.md) | Loop Engineering 与 Verifier 层级 | Trigger、verifier 选择、stop rule 与有界自治 |
| [第 14 章](./14-human-agent-interaction.md) | 人–Agent 交互 | 主动咨询、强制审批、review surface、steering 与 cancellation |
| [第 15 章](./15-computer-use-multimodal-agents.md) | Computer-Use 与多模态 Agent | 结构化 computer-tool loop、视觉 observation、竞态、安全与 eval |
| [第 16 章](./16-infrastructure-noise.md) | Agent Eval 中的基础设施噪声 | 资源 confound、配对实验、不确定性与报告 |
| [第 17 章](./17-trace-driven-iteration.md) | 基于 Trace 的迭代 | Trace 语义、regression 提取与受控 harness 改进 |
| [第 18 章](./18-agentops.md) | AgentOps：成本、隐私与生产运维 | 预算、缓存、隐私、监控、发布单元与治理 |
| [第 19 章](./19-agent-fleets-control-plane.md) | Agent Fleet、身份与控制平面 | Identity chain、delegated authority、分布式执行、lineage 与生命周期 |
| [第 20 章](./20-outlook.md) | 展望 | 长期原则、开放问题与跨书导航 |
| [知识衔接表](./source-map.md) | Foundations → Harness 知识衔接表 | 从模型概念映射到工程责任与章节 |
| [参考文献](./references.md) | 参考文献 | 完整书目 |
| [术语表](./glossary.md) | 术语表 | 全书采用的规范定义 |

---

*这个领域及 provider 契约变化很快；请沿正文引用核对每项事实的适用范围与日期。*
