# Agent Harness 与 LLM Foundations 衔接：事实核验与完整改动计划

状态：**已完成事实核验、正文改写、双语集成与构建验收。**

实施约束补充：事实性主张的来源必须放在正文相邻位置；章末书目用于汇总，不能代替 inline citation。英文与中文章节使用相同的事实来源，并在逐章验收时比较 URL 集合。

范围：

- 英文版：`agent-harness/`
- 中文版：`agent-harness-zh/`
- 对照基线：`llm-foundations/` 与 `llm-foundations-zh/` 当前版本
- 本轮先形成 decision-complete plan，再由一个 chapter agent 同时负责一章的英文和中文；最终已完成全书双语整合，避免版本漂移。

## 1. 核验方法与判定标准

本次没有把所有不顺畅之处都归类为“事实错误”，而是分成四类：

1. **事实或协议边界错误**：与规范、官方文档或原始论文直接冲突，必须修改。
2. **定义过宽或缺少前提**：来源中的说法在特定系统或实验里成立，但正文把它写成了普遍规律；必须收窄适用范围。
3. **教材衔接缺口**：单句未必错误，但 Foundations 已明确把某项工程责任交给 Harness，而 Harness 没有接住；需要补章或补节。
4. **编辑性问题**：章节顺序、术语一致性、交叉引用或中英文同步问题；不属于事实错误，但会破坏全书逻辑。

资料优先级：

1. 协议规范、标准和官方产品文档；
2. 原始论文与实验报告；
3. 官方工程文章；
4. 仅在解释行业术语或实践谱系时使用二手文章，并明确其不是标准。

## 2. 核验后的结论矩阵

### 2.1 必须按事实纠正

| ID | 当前说法或缺口 | 核验结论 | 依据 | 改动决定 |
|---|---|---|---|---|
| F1 | 第 2、3、13 章及术语表把跨请求的 provider prompt caching 统称为 KV-cache | **定义混用。** 单次推理中的 KV cache 是已处理 token 的 K/V 状态；跨独立请求是否复用、如何匹配、保留多久、如何计费，是 provider 暴露的 prompt-caching 契约。后者内部可以复用 KV-derived state，但教材不能因此把两个生命周期写成同一个概念。 | [OpenAI Prompt Caching](https://developers.openai.com/api/docs/guides/prompt-caching)、[Anthropic Prompt Caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) | 全书统一成 “per-request KV cache” 与 “cross-request provider prompt cache”；价格、TTL、匹配规则都写成带日期的 provider-specific 示例。 |
| F2 | 第 13 章把 instruction hierarchy、system 位置和 “hard rules” 写成安全执行边界 | **事实边界错误。** Instruction hierarchy 描述模型应如何处理冲突指令，是经过训练的行为偏好；实验仍观察到不同程度的优先级冲突失败。它不能替代权限检查、沙箱、allowlist 或审批门。 | [The Instruction Hierarchy](https://arxiv.org/abs/2404.13208)、[IHEval](https://arxiv.org/abs/2502.08745)；Foundations 第 8、14 章 | 将 “authority enforced by position” 改为 “intended priority represented in the model input”；所有不可绕过的规则落到确定性的 harness/runtime enforcement。 |
| F3 | 第 16 章说 computer use 的 observation 是 image “而不是 tool result”，action 是 UI gesture “而不是 function call” | **抽象层级错误。** Computer-use 仍是工具调用循环：模型提出结构化 action，应用或 harness 执行，截图或执行结果作为 tool result/observation 回传。区别在 payload、grounding、动作粒度和环境不确定性，而不是脱离 tool-call protocol。 | [OpenAI Computer Use](https://developers.openai.com/api/docs/guides/tools-computer-use)、[Anthropic Computer Use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)、[Anthropic Tool Use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works) | 重写第 16 章开场、主循环和图；明确截图是 observation payload，click/type 等是 structured computer-tool actions。 |
| F4 | 第 16 章写 “images ultimately become tokens”，并用 “一张高分辨率截图约等于一页文字” 估算 | **过度概括且缺少可移植事实依据。** 不同模型使用不同视觉编码、缩放和计费方法，视觉输入可能以 patch/token 等方式核算；固定的“页文本等价”不可跨模型成立。 | [Anthropic Vision](https://platform.claude.com/docs/en/build-with-claude/vision)；Foundations 第 2 章 | 改成 model/provider-specific accounting；示例必须标模型、分辨率、日期和计费规则，不保留通用页数换算。 |
| F5 | 第 17 章的图和正文写 “trace = cost ledger + audit log” | **定义错误。** Trace 是 observability signal，由 spans、events、attributes、status 等组成，并可能被采样；durable event history 用于恢复工作流状态；audit record 还需要完整性、身份、时间、保护、保留、访问和审查等属性。Trace 可以成为 audit evidence 的来源，但不是天然的 audit log。 | [OpenTelemetry Trace API](https://opentelemetry.io/docs/specs/otel/trace/api/)、[Temporal History Service](https://github.com/temporalio/temporal/blob/main/docs/architecture/history-service.md)、[NIST SP 800-53 Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)、[NIST Audit Glossary](https://csrc.nist.gov/glossary/term/audit) | 建立 trace / event history / audit record 三分法；修改第 17、18 章图和术语表。 |
| F6 | 第 4 章说 MCP “connects downward to tools/resources that it controls and can inspect” | **定义过强。** MCP 规定 server 暴露 tools/resources，client 发现并调用；并不保证某个 server 对全部资源拥有控制权或可检查性。规范还允许工具列表动态变化。 | [MCP Tools Specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) | 改为 “MCP server exposes capabilities under its implementation and access controls”；不再用 “controls and can inspect” 描述协议本身。 |
| F7 | 第 10 章说 Foundations 第 13 章已经介绍 traces | **明确的跨书引用错误。** 当前 Foundations 第 13 章讲 model-behavior eval，并明确把完整 agent trace、environment-state grading 和 operational reliability 交给 Harness。 | Foundations 第 13 章当前正文 | 改为：Foundations 提供 grader、trial、pass@k/pass^k 等基础；Harness 第 11 章引入 agent transcript/trace、outcome 和 system-level eval。 |
| F8 | 术语表说 compaction “see Foundations ch 9” | **引用范围错误。** Foundations 第 9 章解释有限 context、per-request KV cache 和 provider prompt caching，不负责 compaction 算法。 | Foundations 第 9 章当前正文 | 删除“Foundations 已讲 compaction”的暗示；只把 context-window 机制指回 Foundations，把 compaction 指向 Harness 的相应章及来源。 |
| F9 | 第 17 章写 p50/p95/p99 “as in Ch 6” | **交叉引用错误。** 当前第 6 章没有定义这些延迟分位数。 | 本地全文检索 | 在 AgentOps 章本地定义，或指向 observability 章；移除错误引用。 |

### 2.2 必须收窄定义，而不是删除

| ID | 当前说法 | 核验结论 | 依据 | 改动决定 |
|---|---|---|---|---|
| N1 | 第 1、2 章把 context/history 描述成每步单调增长 | 只对 naive append-only transcript 成立；本书后面自己介绍 compaction、reset、editing、offloading 和 retrieval。 | 本书第 3、7 章；Foundations 第 9 章 | 改为“朴素循环默认增长”；紧接着给出 harness 可进行的几类受控变换，并说明 provenance 与 correctness 条件。 |
| N2 | 第 2 章沿用 Manus 的 “mask, don’t remove” 作为稳定工具定义的设计原则 | 这是 Manus 在其 provider/workload 下的经验，不是通用协议约束。MCP 支持 tool-list changes，Anthropic 也支持 deferred tool loading 并说明如何保留 prompt-cache prefix。 | [MCP Tools Specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)、[Anthropic Tool Reference](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-reference) | 保留为一种策略，与 deferred loading/tool search、stable meta-tool 三种方案并列；选择由模型、provider、catalog 大小、权限和 eval 决定。 |
| N3 | 第 8 章写 “maker must not be checker” | 独立 checker 能降低利益冲突，但不是每个步骤都必须由另一 agent 检查。确定性测试、环境反馈、同一 agent 的局部自检和选择性 evaluator 各有适用范围。 | [Anthropic Harness Design for Long-Running Apps](https://www.anthropic.com/engineering/harness-design-long-running-apps)、[Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) | 改成 verifier hierarchy；独立 evaluator 用于接近能力边界、主观判断或高风险任务，不写成普遍定律。 |
| N4 | 第 11 章说低于 3 percentage points 的差异要怀疑 | 这句话确实来自 Anthropic 的实验，不是凭空错误；但它针对资源配置未对齐的 agentic coding eval，不能当作通用显著性阈值。 | [Anthropic Infrastructure Noise](https://www.anthropic.com/engineering/infrastructure-noise) | 保留为具名 case study；标题、引言和 takeaway 都写清实验范围。通用章节讲 effect size、uncertainty、trial count、paired setup 和 environment pinning。 |
| N5 | 第 18 章把 control plane 写成既做全局管理又直接“enforces”所有 data-plane work | Control plane / data plane 是有用的架构约定，但 policy administration、policy decision 和 policy enforcement 不是同一位置。PEP 必须位于或邻近请求数据路径且不可绕过；gateway 只是可能的 PEP 之一。 | [Kubernetes Components](https://kubernetes.io/docs/concepts/overview/components/)、[NIST Zero Trust Glossary](https://pages.nist.gov/zero-trust-architecture/glossary.html)、[NIST IR 7987](https://nvlpubs.nist.gov/nistpubs/ir/2014/NIST.IR.7987.pdf) | 保留 control-plane 章，但明确 PDP/PEP、central administration/distributed enforcement；不把 audit、lineage 和所有 enforcement 都定义成“控制平面天然属性”。 |
| N6 | 第 15 章把 human approval 表示成 agent 可主动调用的工具 | 把等待人类输入建模为 durable tool/event 是有效的 orchestration pattern，但高风险 action 的审批不能依赖模型“自愿调用”该工具。 | MCP 的 human-in-the-loop 要求；第 5 章 threat model；NIST PEP 定义 | 区分 model-requested consultation 与 policy-mandated approval gate；后者由 runtime 在 action dispatch 前强制插入，模型不可绕过。 |
| N7 | 第 14 章把 timeout、rate limit、error 后切换模型写成直接 fallback | Fallback 只有在输入、tool schema、modalities、context、reasoning state、输出契约和 side-effect semantics 兼容时才安全。 | 各 provider tool/computer-use contracts；Foundations 第 12、14 章的责任边界 | 增加 compatibility gate 和 idempotency要求；区分 reliability fallback、quality cascade 和 human escalation。 |
| N8 | 第 17 章的 semantic cache 主要按相似度阈值讨论 correctness | 相似度只是一个风险轴；授权响应还必须按 tenant/user/auth scope 等隔离，并随 prompt、model、tool、retrieval、policy 版本失效。 | [Azure Semantic Caching](https://learn.microsoft.com/en-us/azure/api-management/azure-openai-enable-semantic-caching)、[Azure Cache Lookup Policy](https://learn.microsoft.com/en-us/azure/api-management/cache-lookup-policy) | 增加 cache-key scope、authorization vary、TTL/invalidation、provenance 和默认禁用场景；敏感、个性化或高影响回答不默认做 semantic cache。 |
| N9 | 第 1 章一方面说 “everything outside the model is the harness”，另一方面又把 framework、runtime、product、platform 分层 | 两句话使用了不同粒度，并非一定互相排斥，但当前没有说明粒度切换。 | [Anthropic Demystifying Evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) 对 agent harness/evaluation harness 的区分；本书现有章节 | 第 1 章先声明 Foundations 把 “harness” 当作外部系统总称，本书再细分 agent harness、runtime、product/application、platform/control plane、evaluation harness。 |

### 2.3 已验证的教材衔接缺口

| ID | Foundations 的交接点 | Harness 当前状态 | 改动决定 |
|---|---|---|---|
| G1 | Foundations 第 11 章解释 embedding、retrieval、reranking 的模型侧基础，并明确把生产索引维护和 workflow integration 交给 Harness | Harness 第 2 章只有很短的 JIT retrieval 段落 | 新增完整的 “Production Retrieval and Grounding” 章，覆盖 ingest、index、ACL、freshness、hybrid retrieval、reranking、provenance、injection handling、eval、cost/latency。 |
| G2 | Foundations 第 12 章说明 model 只提出 structured tool call，把执行与后果交给 Harness | Harness 第 4 章强调 tool design/MCP，但没有完整 dispatch lifecycle | 在工具章加入 call ID、stream completion、parse、schema validation、semantic validation、authorization、approval、idempotency/dedup、execution、timeout/retry、result normalization、observation、outcome confirmation。 |
| G3 | Foundations 第 13 章把完整 agent trace、environment-state grading、operational reliability 和 release gate 交给 Harness | Harness Eval 章开场反而声称 Foundations 已经覆盖 trace；trace/event history/audit 还散落在多章 | 重写 Eval 章开场与术语；在 State、Trace、AgentOps、Fleet 四章建立唯一的数据产品边界。 |
| G4 | Foundations 第 14 章给出最终责任边界：model predicts；harness owns context/state/tools/permissions/verification/consequences | Harness 的 system-prompt 章和 approval 章仍把部分 enforcement 放回模型行为 | 第 2、7、14、19 章分别落地 instruction、sandbox/PEP、human approval 和 fleet enforcement，所有“硬保证”都由外部系统承担。 |

## 3. 全书采用的规范定义

后续 chapter agents 必须使用以下词义；如来源使用别的词，应在首次出现时说明映射。

### 3.1 系统层级

| 层级 | 本书中的定义 | 不应包含的含义 |
|---|---|---|
| Model | 接收当前输入并生成 token/structured output 的概率模型 | 不执行真实工具，不持有最终权限，不保证副作用 |
| Agent harness | 组装模型输入、解析输出、驱动单个或一组 agent loop 的模型邻近系统 | 不自动等于整个产品或 fleet platform |
| Runtime | 提供 durable execution、scheduling、queues、checkpoint、sandbox process 和 retry semantics | 不自动决定产品 UX 或组织治理 |
| Product / application | 面向用户的 workflow、domain logic、review surface 和业务状态 | 不等同于 model prompt |
| Platform / control plane | 管理多租户、多版本、多 agent 的 registry、identity、policy administration/decision 和 lifecycle | enforcement point 仍需在数据路径上明确部署 |
| Evaluation harness | 创建任务环境、运行 trials、调用 agent harness、收集 transcript/outcome 并执行 graders 的测试系统 | 不等同于生产 agent harness |

### 3.2 状态与证据

| 术语 | 规范定义 |
|---|---|
| Context | 单次模型调用可见的 token/multimodal representation；有限且不是持久状态。 |
| Memory | 为未来调用检索或注入的信息产品；必须有 scope、provenance、权限、更新和遗忘规则。 |
| Execution state | 当前 workflow 的结构化业务状态，例如 step、pending action、budget、approval status。 |
| Event history | 为 durable recovery 记录的有序事件；如果宣称 replay，model/tool outputs 应记录后复用，而不是重新调用。 |
| Checkpoint | 某时点可恢复状态及恢复所需引用；不是完整因果历史的同义词。 |
| Artifact | 文件、diff、报告、dataset、build 等可寻址工作产物。 |
| Trace | 用 spans/events/attributes 表示一次执行路径的 observability 数据；可能被采样。 |
| Eval transcript / trajectory | 某次 trial 中供 graders 检查的步骤与 observation 记录；可以由 trace 派生，但用途不同。 |
| Audit record | 为问责或合规保存的受保护记录，需要规定 completeness、identity、integrity、timestamp、retention 和 access。 |
| Lineage | 把 identity、version、input、artifact、policy decision、approval、action 和 outcome 串起来的 provenance graph。 |

### 3.3 缓存

| 术语 | 规范定义 |
|---|---|
| Per-request KV cache | 一次 generation 内对已处理 token 的 key/value state 复用。 |
| Provider prompt cache | provider 在独立请求之间提供的前缀复用契约；匹配、TTL、计费、eligibility 和 data controls 均为 provider-specific。 |
| Application response cache | 对完全相同且 scope-compatible 的请求复用最终响应。 |
| Semantic cache | 对语义相似请求复用响应；必须同时满足 similarity、authorization、tenant、version、freshness 和 risk 条件。 |

### 3.4 安全决策

| 术语 | 规范定义 |
|---|---|
| Instruction priority | 模型应遵循的行为优先级；是 defense-in-depth 的一层，不是执行权限。 |
| Policy decision point (PDP) | 根据 identity、resource、action、purpose、environment 和 policy 计算决策。 |
| Policy enforcement point (PEP) | 在动作路径上不可绕过地执行 allow/deny/redact/approve/sandbox 等决策。 |
| Approval request | 模型或 workflow 可以提出的人工咨询。 |
| Mandatory approval gate | 由 policy/runtime 在高风险 dispatch 前强制执行的 gate，与模型是否主动请求无关。 |

## 4. 推荐的目标目录

本计划建议做一次结构调整，而不是只修补句子。原因是 system instructions 目前到第 13 章才出现，state/event log 到第 9 章才正式定义，evaluation 又晚于大量 verifier 论述；这会让前面的章节依赖尚未建立的概念。

| 新章 | 目标标题 | 来源 | 结构目的 |
|---|---|---|---|
| Preface | Preface | 现前言 | 准确说明 Foundations 前置知识与两卷责任边界 |
| 1 | What Is an Agent Harness? | 现第 1 章 | 建立系统层级、最小循环和全书责任边界 |
| 2 | System Prompts, Instructions, and Policy Boundaries | 现第 13 章 | 先讲模型可见的 instruction，再明确其不是 hard enforcement |
| 3 | Context as a Finite Resource | 现第 2 章 | 接 Foundation 第 9 章，统一 cache 定义 |
| 4 | Production Retrieval and Grounding | **新增** | 接 Foundation 第 11 章留下的生产工程责任 |
| 5 | Compaction, Memory, and Context Handoffs | 现第 3 章 | 区分 context transformation、memory 和 delegation |
| 6 | Tools and the Invocation Lifecycle | 现第 4 章 | 接 Foundation 第 12 章的 model-side tool proposal |
| 7 | Sandboxing, Guardrails, and Runtime Enforcement | 现第 5 章 | 在所有 orchestration 之前建立不可绕过的边界 |
| 8 | Model Selection, Routing, and Reasoning Budgets | 现第 14 章 | 将 per-call routing 放到 workflow 组合之前 |
| 9 | Agentic Workflow Patterns | 现第 6 章 | 组合已经定义好的 model、context、tools 和 controls |
| 10 | State, Event Histories, and Production Factors | 现第 9 章 + 现第 7 章 durable-execution 内容 | 在 long-running 之前定义 state/recovery |
| 11 | Evaluation | 现第 10 章 | 在 verifier-heavy 章节之前定义 trial、grader、outcome 和 eval harness |
| 12 | Long-Running Agents and Multi-Context Tasks | 现第 7 章 | 使用已经定义的 event history、checkpoint 和 eval |
| 13 | Loop Engineering and Verifier Hierarchies | 现第 8 章 | 把 maker-checker 从口号改成有条件的 verifier 设计 |
| 14 | Human–Agent Interaction | 现第 15 章 | 区分主动咨询与 mandatory approval gate |
| 15 | Computer-Use and Multimodal Agents | 现第 16 章 | 作为工具循环的高不确定性特例 |
| 16 | Infrastructure Noise in Agent Evals | 现第 11 章 | 将 3-point 结论锁定到原实验语境 |
| 17 | Trace-Driven Iteration | 现第 12 章 | 在 eval 和 state 定义之后讲 observability feedback |
| 18 | AgentOps: Cost, Privacy, and Production Operations | 现第 17 章 | 统一成本、缓存、租户、发布和监控 |
| 19 | Agent Fleets, Identity, and the Control Plane | 现第 18 章 | 精确定义 PDP/PEP、identity、lineage 和 audit |
| 20 | Outlook | 现第 19 章 | 汇总不变责任边界与开放问题 |

建议的最终文件映射：

```text
00-preface.md                                  -> 00-preface.md
01-what-is-an-agent-harness.md                 -> 01-what-is-an-agent-harness.md
13-system-prompts-and-instructions.md          -> 02-system-prompts-instructions-policy.md
02-context-as-finite-resource.md               -> 03-context-as-finite-resource.md
(new)                                          -> 04-production-retrieval-grounding.md
03-compaction-memory-subagent.md               -> 05-compaction-memory-context-handoffs.md
04-tools-agent-computer-interface.md           -> 06-tools-invocation-lifecycle.md
05-sandboxing-guardrails.md                    -> 07-sandboxing-runtime-enforcement.md
14-model-selection-routing-reasoning.md        -> 08-model-selection-routing-reasoning.md
06-agentic-workflow-patterns.md                -> 09-agentic-workflow-patterns.md
09-twelve-factors.md                           -> 10-state-event-history-production-factors.md
10-evaluation.md                               -> 11-evaluation.md
07-long-running-agents.md                      -> 12-long-running-agents.md
08-loop-engineering.md                         -> 13-loop-engineering.md
15-human-agent-interaction.md                  -> 14-human-agent-interaction.md
16-computer-use-and-multimodal-agents.md       -> 15-computer-use-multimodal-agents.md
11-infrastructure-noise.md                     -> 16-infrastructure-noise.md
12-trace-driven-iteration.md                   -> 17-trace-driven-iteration.md
17-cost-privacy-and-operations.md              -> 18-agentops.md
18-agent-fleets-identity-control-plane.md      -> 19-agent-fleets-control-plane.md
19-outlook.md                                  -> 20-outlook.md
```

英文和中文目录采用完全相同的 basename。

## 5. 逐章改动清单

优先级：

- **P0**：事实、定义、安全边界或跨书责任错误；
- **P1**：为逻辑闭环必须补齐的工程内容；
- **P2**：例子、结构、来源和可读性完善。

### Preface 与 README

- **P0**：把 “Foundations 已经讲过 tool-call protocol” 收窄为 “Foundations 讲 model-side proposal 与最小 loop；Harness 讲 dispatch、authorization、execution 和 consequence”。
- **P0**：更新两卷责任表：model behavior 在 Foundations；context selection、state、tool execution、permissions、verification 和 consequences 在 Harness。
- **P1**：按新目录重写阅读路线，不再把现第 9 章称为统一 production checklist。
- **P2**：说明 provider-specific 数字带发布日期；快速变化的价格/产品 feature 不是永久定义。

### Chapter 1 — What Is an Agent Harness?

- **P0**：加入第 3.1 节的六层系统定义，解释 “everything outside the model” 是 Foundations 的粗粒度 shorthand，本书会进一步分层。
- **P0**：最小循环明确为：assemble context → model proposes → harness validates/authorizes → runtime executes → result/outcome returns。
- **P0**：把 “context grows monotonically” 改成 naive append-only loop 的特性。
- **P1**：增加责任边界表：context、state、tools、permissions、verification、consequences 分别由哪一层负责。
- **P1**：明确 agent harness 与 evaluation harness 不同。
- **P2**：保留 ETCLOVG 作为 survey taxonomy，但标记它是组织框架，不是行业标准。

### Chapter 2 — System Prompts, Instructions, and Policy Boundaries

- **P0**：删除 “hard rules are enforced by position”“authority comes from placement” 等安全保证。
- **P0**：用 intended priority / behavioral defense 描述 system、developer、user、tool/retrieved content。
- **P0**：增加 “model-visible policy vs executable policy” 双栏；后者链接第 7、14、19 章。
- **P0**：把动态 system prompt 的缓存段改成 provider prompt cache，注明 exact-prefix、TTL、billing 均依 provider。
- **P1**：增加 prompt assembly 的 provenance：每段 instruction 的 source、version、scope、timestamp、tenant 和 policy reference。
- **P1**：说明 delimiter、XML tag 和 instruction hierarchy 能降低混淆，但不是 authorization。
- **P2**：把 “show planning steps” 类用语限制为可展示的 plan/status/rationale/evidence，不承诺暴露隐藏 chain-of-thought。

### Chapter 3 — Context as a Finite Resource

- **P0**：分开 context、per-request KV cache 和 provider prompt cache。
- **P0**：把 Sonnet `$0.30/$3` 与 10x 差异改成 Manus 当时引用的具名历史 case，不当成当前或跨 provider 定价。
- **P0**：把 100:1 input/output ratio 明确成 Manus workload observation。
- **P1**：把 context growth 改成 append-only baseline，并列出 trim、offload、compaction、reset、retrieval 和 deferred tools。
- **P1**：把 “mask, don’t remove” 改为三种 tool-catalog 策略的比较，而不是全书定律。
- **P1**：JIT retrieval 只保留 context-selection 角度，生产 retrieval pipeline 指向第 4 章。
- **P2**：增加 cache-debugging checklist：prefix boundary、dynamic fields、tool definitions、cache breakpoint、provider metrics。

### Chapter 4 — Production Retrieval and Grounding（新增）

- **P0**：开场明确承接 Foundations 第 11 章：不重复 embedding 数学，而是讲生产数据路径。
- **P1**：完整 pipeline：source ingestion → parse/chunk → metadata/ACL → index version → query formulation → dense/sparse retrieval → fusion/reranking → context assembly → citation/provenance → outcome eval。
- **P1**：覆盖 freshness、deletion、re-index、schema migration、dedup、tenant isolation 和 permission-at-retrieval。
- **P1**：说明 retrieval result 是 untrusted content；把 injection defense 与第 2、7 章连接。
- **P1**：区分 retrieval correctness、grounding/citation correctness 和最终 task outcome。
- **P1**：加入 no-answer/abstain、top-k、reranker threshold、latency/cost tradeoff 的 eval 设计。
- **P2**：以 [Anthropic Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval) 作为 hybrid retrieval/reranking 的 case study，不把其具体收益数字泛化到所有 corpus。

### Chapter 5 — Compaction, Memory, and Context Handoffs

- **P0**：所有跨请求缓存改称 provider prompt cache。
- **P0**：把 context、memory、execution state、artifact 和 event history 分开；本章只深入 context transformation 与 memory。
- **P1**：compaction 输出至少保存 decisions、open tasks、constraints、artifact pointers、provenance 和 unresolved uncertainty。
- **P1**：解释 compaction、context reset、retrieval、recitation、tool-result clearing 的不同损失模型。
- **P1**：保留 sub-agent/context firewall，但要求结果带 evidence、identity/scope 和可恢复 artifact；高权限 parent 不因摘要自动提升信任。
- **P2**：把 “leave useful errors in context” 改成有生命周期的策略：近期可操作错误保留，重复噪声 compact，原始 artifact 可追溯。

### Chapter 6 — Tools and the Invocation Lifecycle

- **P0**：加入完整 lifecycle，并为每个阶段说明谁负责、失败如何表示、是否可 retry。
- **P0**：区分 syntax/schema validity、semantic validity、authorization、approval 和 outcome confirmation；schema valid 绝不等于 action allowed。
- **P0**：精确重写 MCP/A2A 对比；MCP server “exposes” capability，不声称它天然控制或检查所有资源。
- **P1**：加入 call ID、streamed arguments completion、idempotency key、dedup、timeout、cancellation、partial failure 和 result normalization。
- **P1**：加入 three catalog patterns：stable catalog + masking、deferred loading/tool search、stable meta-tool/code surface。
- **P1**：说明 dynamic tool-list change 必须重新做 capability/authorization checks。
- **P2**：增加一个 tool call 从 model proposal 到 verified external outcome 的时序图。

### Chapter 7 — Sandboxing, Guardrails, and Runtime Enforcement

- **P0**：保持 “model is not a trusted component” 为全章前提。
- **P0**：把 instruction defense 与 runtime control 分层；所有 hard guarantee 映射到 sandbox、PEP、credential proxy、network/file policy 或 approval gate。
- **P0**：明确 mandatory approval gate 由 dispatcher/PEP 触发，不能只靠 agent 自己调用审批工具。
- **P1**：补充 capability grant、resource scope、egress、secret injection、revocation 和 TOCTOU 处理。
- **P1**：说明 retry 不得绕过先前 deny/approval，policy version 变化时需重新授权。
- **P1**：把 hooks 分成 advisory hook 和 blocking enforcement；若可被 agent 绕过就不能称为 guardrail guarantee。
- **P2**：威胁模型中的实践性术语保留来源，不把 “lethal trifecta” 写成正式安全标准。

### Chapter 8 — Model Selection, Routing, and Reasoning Budgets

- **P0**：增加 fallback compatibility matrix：modalities、context limit、tool protocol/schema、structured-output contract、reasoning/continuation state、safety behavior、latency、data region。
- **P0**：在任何可能重复 side effect 的 fallback/retry 前要求 idempotency 或 outcome check。
- **P1**：区分 router、quality cascade、reliability fallback、hedging 和 human escalation。
- **P1**：说明 provider-specific reasoning controls 与 token accounting，不把内部 reasoning 表述成可移植结构。
- **P1**：路由策略加入 eval slice、cost、latency、failure class 和 policy/data residency。
- **P2**：AI gateway 只作为实现位置之一，不自动等于 control plane 或 PEP。

### Chapter 9 — Agentic Workflow Patterns

- **P0**：所有 pattern 都使用 Chapter 1/6 的统一动作语义：model proposes，harness/runtime executes。
- **P1**：区分 deterministic workflow、model-directed loop 和混合 pattern；不要把所有有 LLM 的流程都叫 autonomous agent。
- **P1**：每种 pattern 增加适用条件、state ownership、stop condition、failure propagation 和 eval unit。
- **P1**：Reflexion/ToT/LATS/ReWOO 作为研究或设计谱系，不暗示同等生产成熟度。
- **P2**：把 verifier 细节交给第 11、13 章，避免提前给出绝对 maker-checker 规则。

### Chapter 10 — State, Event Histories, and Production Factors

- **P0**：在本章首次规范定义 execution state、event history、checkpoint、artifact、trace 和 audit record。
- **P0**：把现第 7 章 durable-execution/replay 的核心内容移入本章；声明 model/tool outputs 要记录后复用，不能在 replay 时重新生成。
- **P1**：说明 reducer、event sourcing、snapshot/checkpoint 和 workflow engine 是相关但不同的实现。
- **P1**：给出 run/session/attempt/step/action/call 的 ID 层级。
- **P1**：把 HumanLayer twelve factors 作为具名 manifesto 评析，不当成正式标准；逐项标出普适原则与 implementation choice。
- **P1**：恢复流程覆盖 crash、timeout、duplicate delivery、approval wait、worker replacement 和 cancellation。
- **P2**：把 framework-to-platform shift 留作本章结尾，并链接 AgentOps/Fleet，而不是提前混入 control-plane 定义。

### Chapter 11 — Evaluation

- **P0**：修正对 Foundations 第 13 章的引用。
- **P0**：采用 task、trial、grader、transcript/trajectory、outcome、evaluation harness、agent harness 的清晰定义。
- **P1**：区分 process/trace grading、artifact grading、environment-state grading 和 user/business outcome。
- **P1**：要求多 trial、隔离环境、可恢复 baseline、版本固定和 per-slice reporting。
- **P1**：解释 pass@k、pass^k、variance/uncertainty 的使用条件，不用单次成功代替可靠性。
- **P1**：建立 grader calibration、false positive/negative、abstain、conflict resolution 和 human adjudication。
- **P1**：把 verifier hierarchy 的测量基础放在本章，loop 中只做选择。
- **P2**：参考 [Anthropic Demystifying Evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)，但把产品示例与通用定义分开。

### Chapter 12 — Long-Running Agents and Multi-Context Tasks

- **P0**：删除与新第 10 章重复的 durable-execution 定义，改成引用。
- **P1**：主线改为 horizon extension：initializer、milestones、artifact-based handoff、context reset、progress state、resume 和 finalization。
- **P1**：每次 handoff 包含 completed work、verified evidence、open risks、next action、artifact pointers 和 permission context。
- **P1**：把 self-verification 定位为 action-local feedback；独立 evaluator 的使用由第 11、13 章条件决定。
- **P1**：明确“任务完成”由 outcome/environment state 判定，不由 agent 自述或 checklist 勾选独立决定。
- **P2**：METR time horizon 等时变 benchmark 数字标日期、任务分布和测量方法。

### Chapter 13 — Loop Engineering and Verifier Hierarchies

- **P0**：删除 “maker must not be checker” 的无条件表述及术语表中的固定定义。
- **P0**：加入 verifier hierarchy：schema checks → deterministic tests/linters → environment outcome checks → same-agent critique → independent model grader → human review。
- **P1**：选择 verifier 时按 consequence、task ambiguity、model capability boundary、latency/cost 和 correlated failure。
- **P1**：stop rule 必须包含 success、budget exhausted、no progress、repeated failure、policy deny、human cancel 和 environment terminal state。
- **P1**：Ralph/loop engineering 标为 practitioner lineage，不写成公认标准范式。
- **P2**：把 maturity ladder 改成能力/控制维度，不暗示所有产品都必须演化到最大自治。

### Chapter 14 — Human–Agent Interaction

- **P0**：把 “approval as tool call” 拆成两个 pattern：agent-requested consultation 与 runtime-mandated approval gate。
- **P0**：mandatory gate 记录 proposed action、normalized arguments、resource、identity、policy/version、risk、expiry；批准后若参数发生 material change 必须重新批准。
- **P0**：审批记录进入 event history；只有满足完整性、保留等要求后才可作为 audit evidence。
- **P1**：stake-proportionate matrix 加入 reversibility、blast radius、external communication、money、production 和 sensitive data。
- **P1**：review surface 显示 plan/status、tool actions、diff/artifact、test/evidence、uncertainty 和 policy reason；不要求展示隐藏 chain-of-thought。
- **P1**：steering 与 cancellation 必须有事件语义，说明何时生效以及如何处理已派发动作。
- **P2**：fleet review queue 继续按 risk/evidence 排序，但来源与第 19 章一致。

### Chapter 15 — Computer-Use and Multimodal Agents

- **P0**：按结构化 computer-tool loop 重写开场、正文和图。
- **P0**：删除 image/tool-result、gesture/function-call 的错误二分。
- **P0**：删除跨模型“一页文字”等价估算；改成 provider/model-specific visual accounting。
- **P1**：区分 screenshot observation、accessibility/DOM state、coordinate grounding、action proposal、execution result 和 environment outcome。
- **P1**：说明 stale screenshot、layout shift、focus、scroll、modal、latency 和 partial execution 导致的 observation/action race。
- **P1**：高风险 UI action 使用 allowlist、sandbox、domain/origin checks、mandatory approval 和 post-action verification。
- **P1**：instruction hierarchy 只作为行为防御，不能替代上述控制。
- **P2**：environment eval 按最终 UI/后台状态评分，不只看动作轨迹。

### Chapter 16 — Infrastructure Noise in Agent Evals

- **P0**：将 3 percentage-point 结论完整限定到 Anthropic 的资源配置实验。
- **P0**：不把固定阈值写成普遍统计显著性规则。
- **P1**：通用方法覆盖 hardware/resources、disk/network、container image、dependency versions、rate limits、warm caches、parallelism 和 timeouts。
- **P1**：报告 raw trials、effect size、uncertainty、failure categories 和 configuration，而不只给 leaderboard point estimate。
- **P1**：能 paired 时使用同任务/同环境配对；不能 paired 时说明 confound。
- **P2**：把倍数或分数变化都写成 case-study result，并保留实验设置。

### Chapter 17 — Trace-Driven Iteration

- **P0**：按第 3.2 节定义 trace；明确 sampled trace 不能承担完整 event history 或 audit。
- **P0**：统一 run/session/attempt/step/action/call 与 trace/span correlation。
- **P1**：说明 span attributes、events、status、errors、links 和 sampling policy。
- **P1**：production failure 转 regression case 时执行 redaction、consent/licensing、dedup 和 distribution-shift review。
- **P1**：trace grader、outcome grader 和 incident investigation 分开。
- **P1**：所谓 self-improvement/meta-harness 必须经过 offline eval、approval、versioning、canary 和 rollback，不在生产流量中无界自改。
- **P2**：模型—harness co-evolution 写成依赖关系与测试责任，不写成必然历史趋势。

### Chapter 18 — AgentOps: Cost, Privacy, and Production Operations

- **P0**：删除 “trace is the audit log”；保留“完整且未丢失的 cost spans 可形成 cost ledger”，并说明 sampling 会破坏账本完整性。
- **P0**：修正 p50/p95/p99 交叉引用。
- **P0**：按第 3.3 节统一 prefix/prompt/response/semantic caches。
- **P0**：semantic cache 加入 tenant、user/auth scope、model、prompt、tool、retrieval、policy version、TTL、invalidation 和 provenance。
- **P1**：run budget 同时覆盖 tokens、dollars、tool calls、wall time、external spend 和 retry/fallback。
- **P1**：隐私覆盖 data minimization、redaction、retention、retrieval ACL、trace sampling/storage、egress 和 deletion。
- **P1**：监控明确区分 service health、agent outcome、safety/policy event、cost 和 human escalation。
- **P1**：发布单元包含 model、prompt、tool schema/implementation、retrieval index/config、memory policy、sandbox image、grader 和 budget。
- **P2**：法律/认证内容标 jurisdiction、effective date 和非法律建议；快速变化的 vendor AgentOps 产品只作案例。

### Chapter 19 — Agent Fleets, Identity, and the Control Plane

- **P0**：将 control plane 定义为本书采用的 distributed-systems architectural convention，不说成唯一行业标准。
- **P0**：把 policy administration、PDP 和 PEP 分开；gateway、sidecar、tool proxy、sandbox broker 都可能是 PEP。
- **P0**：PEP 必须在请求路径上不可绕过；model prompt 中的规则不计为 PEP。
- **P0**：trace、event history、audit record 和 lineage 按规范定义重写。
- **P1**：identity chain 覆盖 agent version、sponsor、delegator、tenant、purpose、runtime、credential audience、expiry 和 revocation。
- **P1**：delegation 只能收窄 authority；父 agent 接受子 agent 输出不构成权限转移。
- **P1**：kill switch 通过 credential revocation、gateway/PEP denial 和 run lifecycle 生效，不只发送自然语言 stop。
- **P1**：lineage 连接 immutable artifacts、policy decisions、approvals、actions 和 verified outcomes。
- **P2**：registry/vendor/标准现状都标 publication date 与 maturity，避免把预览产品写成稳定行业规范。

### Chapter 20 — Outlook

- **P0**：最终 standing principles 与 Foundations 第 14 章一致：model proposes/predicts；external system owns permissions、execution、verification 和 consequences。
- **P1**：开放问题按 context、state、tools, security、eval、operations、identity/standards 分类。
- **P1**：区分 durable design principles 与时变 product claims。
- **P2**：给出两卷的最终导航表，读者可从模型机制跳到对应 harness responsibility。

### Glossary、References 与 Source Map

- **P0**：按第 3 节重写 KV cache、provider prompt cache、trace、trajectory/transcript、event history、checkpoint、audit、lineage、instruction hierarchy、control plane、PDP、PEP、approval gate、verifier。
- **P0**：compaction 不再错误指向 Foundations 第 9 章。
- **P0**：删除 “verifier 必须是另一个 agent” 的定义。
- **P1**：同一概念只保留一个 canonical entry，其他词作为 alias，不互相循环定义。
- **P1**：references 补充本计划中使用的规范、官方文档和原始论文；动态 provider 页面加 access/verification date。
- **P1**：新增 cross-book source map：Foundation concept → Harness engineering responsibility → chapter。
- **P2**：中英文术语首次出现使用“中文解释（English canonical term）”，之后保持稳定，不逐句机械翻译专有名词。

## 6. 实施顺序与 agent 分配规则

### 6.1 共享工作区规则

1. **一个 chapter agent 只拥有一个章节的英文/中文文件对。**
2. Chapter agent 不修改 README、glossary、references、source map 或其他章节；需要的共享改动写在 handoff 中。
3. 一个独立 integration owner 负责文件 rename、全书编号、交叉链接和共享文件。
4. 每个 agent 在开始前读取本计划第 2、3、5 节；不能自行改写 canonical definitions。
5. 现有 worktree 已有未提交修改；机械 rename 和后续编辑必须保留这些修改，不能 reset/checkout 覆盖。

### 6.2 Phase 0 — 基线与机械重排

由 integration owner 串行完成：

1. 保存 `git status --short` 与现有 diff inventory；
2. 按第 4 节对英文/中文章节做成对 rename；
3. 新建第 4 章的英文/中文空骨架；
4. 只机械更新 heading number、README TOC 和相对链接，不做内容润色；
5. 跑一次本地链接检查，保证 chapter agents 接手的是可导航基线。

### 6.3 Phase 1 — 内容改写批次

每批最多并行三个 chapter agents，root/integration owner 保留一个并发槽用于检查与合并。每个 agent 完成英文和中文后交付事实来源、新增术语和跨章依赖。

| 批次 | 并行章节 | 为什么放在这一批 |
|---|---|---|
| A | Ch 1、Ch 2、Ch 3 | 先建立 scope、instruction boundary、cache/context 词义 |
| B | Ch 4、Ch 5、Ch 6 | 补 retrieval、memory/context handoff、tool lifecycle |
| C | Ch 7、Ch 8 | 建立 runtime enforcement 和 per-call routing |
| D | Ch 9、Ch 10、Ch 11 | 在前述 primitive 上组合 workflow，并定义 state 与 eval |
| E | Ch 12、Ch 13、Ch 14 | long-running、verifier 和 human interaction 都依赖 D 批次 |
| F | Ch 15、Ch 16、Ch 17 | computer use、eval noise 和 trace 已有 tool/eval/state 定义可依赖 |
| G | Ch 18 | AgentOps 依赖 Ch 17 的 trace 边界，单独验收 |
| H | Ch 19 | Fleet/control-plane 依赖 Ch 18 的 operations 与 audit 边界 |
| I | Ch 20 | 最后汇总已稳定的全书原则 |

若 chapter agent 发现 canonical definition 必须调整，不直接在自己的章节创造新定义；暂停该处并交给 integration owner 决定，以免并行分叉。

### 6.4 Phase 2 — 全书集成

由 integration owner 完成：

1. 合并 chapter handoff 中的 glossary/reference/source-map 请求；
2. 更新 Preface、README、Glossary、References、cross-book source map；
3. 全局修复新编号、section reference、diagram label 和相对链接；
4. 搜索并清除旧的绝对表述与旧术语；
5. 逐章检查英文/中文结构对齐。

### 6.5 Phase 3 — 独立事实复核与构建

不让原 chapter author 自己做最终事实验收。复核人按第 7 节的 checklist 检查：

- 引用是否真的支持紧邻论断；
- 是否把 provider case 泛化；
- 是否把模型行为写成安全保证；
- 是否把 trace/event history/audit 混用；
- 是否存在跨书责任重复或空档；
- 英文和中文是否表达同一事实强度。

通过后再构建 HTML/PDF；构建产物不应在 source review 之前作为验收依据。

## 7. 验收标准

### 7.1 事实与定义

- [x] 全书没有把跨请求 provider prompt caching 无条件称为 KV cache。
- [x] 所有价格、TTL、模型能力、benchmark 数字都有 provider/model/date/scope。
- [x] 没有把 prompt placement、delimiter、instruction hierarchy 或 model self-check 称为不可绕过的 security boundary。
- [x] 所有真实副作用都经过 validation、authorization/approval、execution 和 outcome confirmation 的外部路径。
- [x] Computer use 明确是 structured tool-call loop 的特例。
- [x] MCP 只承担规范实际定义的 exposure/discovery/invocation 语义。
- [x] Trace、eval transcript、event history、checkpoint、audit record 和 lineage 定义互不替代。
- [x] Control plane、PDP 和 PEP 的位置与职责明确。
- [x] Semantic cache 不会跨 tenant/auth/policy scope 复用。
- [x] “3 percentage points” 只以具名实验 case 出现。
- [x] Verifier 选择按风险和任务条件，不再有普遍 maker-must-not-checker 规则。

### 7.2 两卷衔接

- [x] Foundation 第 8 章 → Harness 第 2、7 章：behavioral prompt defense → runtime enforcement。
- [x] Foundation 第 9 章 → Harness 第 3、5 章：context/cache mechanism → context management/compaction。
- [x] Foundation 第 11 章 → Harness 第 4 章：retrieval basics → production pipeline。
- [x] Foundation 第 12 章 → Harness 第 6、15 章：model tool proposal → execution/computer use。
- [x] Foundation 第 13 章 → Harness 第 11、16、17 章：behavior eval basics → agent eval/noise/trace。
- [x] Foundation 第 14 章 → Harness 第 1、7、19、20 章：responsibility boundary → enforcement and operations。

### 7.3 编辑与构建

- [x] 英文/中文拥有相同章节数、basename、heading 层级、表格、图和链接目标。
- [x] README、Preface、Glossary、References、source map 与最终编号一致。
- [x] 所有相对 Markdown 链接可解析。
- [x] 没有旧章号或旧文件名残留。
- [x] `git diff --check` 通过。
- [x] HTML/PDF 构建通过，目录、页内链接、Mermaid/代码块无破损。
- [x] 现有未提交修改全部保留或被有意整合，没有被机械重排覆盖。

建议的全局残留搜索词：

```text
KV-cache hit
cached input tokens
authority enforced by position
hard rules
trace = audit
trace is the audit log
maker must not be checker
rather than a tool result
three percentage points
as in Ch 6
see Foundations ch 9
controls and can inspect
```

## 8. 不在本轮正文改写中做的事

- 不重新讲解 Foundations 已经充分覆盖的 transformer、sampling、embedding 数学或 pass@k 推导。
- 不把某个 vendor 的当前 API 设计写成 agent harness 的永久定义。
- 不因术语不成熟而删掉 practitioner material；保留时标成 pattern、case study 或 emerging convention。
- 不把所有生产平台能力都塞入 “agent harness” 一个词；使用第 3.1 节的层级。
- 不在 chapter agents 并行期间修改共享术语表或重新编号，以免相互覆盖。

## 9. 本次核验的核心一手资料

- OpenAI, [Prompt Caching](https://developers.openai.com/api/docs/guides/prompt-caching)
- Anthropic, [Prompt Caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- OpenAI, [Computer Use](https://developers.openai.com/api/docs/guides/tools-computer-use)
- Anthropic, [How Tool Use Works](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works)
- Anthropic, [Computer Use Tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)
- Anthropic, [Vision](https://platform.claude.com/docs/en/build-with-claude/vision)
- Model Context Protocol, [Tools Specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
- OpenTelemetry, [Trace API](https://opentelemetry.io/docs/specs/otel/trace/api/)
- Temporal, [History Service Architecture](https://github.com/temporalio/temporal/blob/main/docs/architecture/history-service.md)
- NIST, [SP 800-53 Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
- NIST, [Zero Trust Architecture Glossary](https://pages.nist.gov/zero-trust-architecture/glossary.html)
- NIST, [IR 7987](https://nvlpubs.nist.gov/nistpubs/ir/2014/NIST.IR.7987.pdf)
- Russinovich et al., [The Instruction Hierarchy](https://arxiv.org/abs/2404.13208)
- Wallace et al., [IHEval](https://arxiv.org/abs/2502.08745)
- Anthropic, [Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- Anthropic, [Quantifying Infrastructure Noise in Agentic Coding Evals](https://www.anthropic.com/engineering/infrastructure-noise)
- Anthropic, [Harness Design for Long-Running Application Development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- Anthropic, [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- Anthropic, [Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval)
- Microsoft Azure, [Semantic Caching](https://learn.microsoft.com/en-us/azure/api-management/azure-openai-enable-semantic-caching)
- Microsoft Azure, [Cache Lookup Policy](https://learn.microsoft.com/en-us/azure/api-management/cache-lookup-policy)
