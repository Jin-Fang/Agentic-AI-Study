# 术语表

本书采用的规范词汇。章节链接会指向完整论证及其正文引用；关键协议与标准定义也在此处直接给出来源。

---

## 系统边界

**模型（Model）** — 接收当前输入 representation、生成 token 或结构化输出的概率组件。它负责提出，不拥有持久状态、credential、外部执行或后果（[第 1 章](./01-what-is-an-agent-harness.md)）。

**Agent** — 模型参与的一种目标导向循环；周边软件负责组装 context、使用工具、维护状态并检查 outcome。

**Agent harness** — 紧邻模型、负责组装输入、解析模型输出并驱动一个或多个 agent loop 的系统。它的范围小于整个 product、runtime 或 fleet platform（[第 1 章](./01-what-is-an-agent-harness.md)）。

**运行时（Runtime）** — 提供 scheduling、queue、durable step、checkpoint、sandbox process、cancellation 与 retry semantics 的执行底座（[第 10 章](./10-state-event-history-production-factors.md)）。

**产品 / 应用（Product / application）** — Agent 工作获得业务意义的用户 workflow、domain logic、review surface 与 business state。

**平台 / 控制平面（Platform / control plane）** — 为 registry、identity、policy administration/decision、lifecycle 与多租户治理提供的 fleet 共享基础设施。执行仍需要在每条受保护数据路径上或附近部署不可绕过的 PEP（[第 19 章](./19-agent-fleets-control-plane.md)）。

**评估 Harness（Evaluation harness）** — 创建任务环境、调用 agent harness 运行 trial、收集完整评分证据、执行 grader 并汇总结果的测试系统。它不同于被评估的生产 agent harness（[Anthropic - Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)）。

**Harness engineering** — 把 prompt、context policy、tool、runtime control、state、verification 与 operations 当作一个系统迭代，而不是孤立优化某个 prompt。

**上下文工程（Context engineering）** — 选择、排序、转换模型调用所需 representation，并追踪其 provenance（[第 3 章](./03-context-as-finite-resource.md)）。

**ETCLOVG** — 一种综述分类：Execution、Tools、Context、Lifecycle、Observability、Verification、Governance。本书把它用作组织视角，而不是行业标准（[第 1 章](./01-what-is-an-agent-harness.md)）。

---

## Context、检索、状态与证据

**上下文（Context）** — 单次模型调用可见的 token 或多模态 representation。它是有限的，也不是持久 workflow state。

**上下文窗口（Context window）** — 一次调用的 model/provider-specific 最大输入加输出跨度；实际可靠性可能在硬上限之前下降（[Foundations 第 9 章](../llm-foundations-zh/09-context-window-and-kv-cache.md)）。

**单次请求 KV 缓存（Per-request KV cache）** — 一次 generation 内为已经处理的 token 复用 key/value state。模型机制见 [Foundations 第 9 章](../llm-foundations-zh/09-context-window-and-kv-cache.md)。

**Provider Prompt Cache** — Provider 跨独立请求复用合格 prompt prefix 的契约。匹配、TTL、billing 与 data control 都由 provider 决定（[OpenAI](https://developers.openai.com/api/docs/guides/prompt-caching)；[Anthropic](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)）。它不是 per-request KV cache 的同义词。

**应用响应缓存（Application response cache）** — 应用按照自己的 key 与 invalidation 规则，对完全相同且 scope-compatible 的请求复用最终响应。

**语义缓存（Semantic cache）** — 对语义相似请求复用响应。Similarity 只是一个 gate；tenant、user/auth scope、model、prompt、tool、retrieval、policy version、freshness 与 risk 也必须兼容（[Azure semantic caching](https://learn.microsoft.com/en-us/azure/api-management/azure-openai-enable-semantic-caching)；[Azure cache policy](https://learn.microsoft.com/en-us/azure/api-management/cache-lookup-policy)）。

**检索管线（Retrieval pipeline）** — Source ingestion → parse/chunk → metadata 与 ACL → versioned index → query → dense/lexical retrieval → fusion/reranking → context assembly → citation/provenance → outcome evaluation（[第 4 章](./04-production-retrieval-grounding.md)）。

**证据条目（Evidence item）** — 检索内容与 `source_id`、`source_version`、`chunk_id`、`content_hash`、`index_version`、`acl_scope` 等标识一起传递的单元，使 claim 可追溯、权限可复查。

**Grounding** — 回答或 action 与所提供 evidence 之间的关系。Retrieval correctness、grounding/citation correctness 与最终 task outcome 是不同测量层。

**压缩（Compaction）** — 有损 context transformation：把选定的 decision、constraint、open work、artifact pointer、provenance 与 uncertainty 保存在较小 representation 中（[第 5 章](./05-compaction-memory-context-handoffs.md)）。Foundations 第 9 章解释 context 为何有限，但不定义 compaction algorithm。

**记忆（Memory）** — 为未来调用可能使用而保存的信息产品。它需要 scope、provenance、authority、freshness、update、access 与 forgetting 规则。

**执行状态（Execution state）** — 当前 step、pending action、budget、lease、approval status 等权威结构化 workflow state（[第 10 章](./10-state-event-history-production-factors.md)）。

**事件历史（Event history）** — 在明确 replay contract 下，足以恢复 workflow 的有序持久 accepted-event 记录。Temporal 把 Event History 作为 workflow 的恢复记录（[Temporal](https://docs.temporal.io/workflow-execution/event)）。

**检查点（Checkpoint）** — 位于已知 history position 的可恢复状态，以及继续执行所需的引用、版本与 resume contract。它不是完整因果历史。

**产物（Artifact）** — 文件、diff、报告、dataset、build、screenshot 或 test result 等可寻址工作产物。

**Trace** — 由 span、event、attribute、status、link 与 timestamp 组成的 observability 数据；它可以被 sampling（[OpenTelemetry Trace API](https://opentelemetry.io/docs/specs/otel/trace/api/)）。Trace 不会自动成为 event history、eval trajectory、cost ledger 或 audit record。

**Eval Transcript / Trajectory** — 为一次 trial 评分而保存的完整 model、tool、observation、artifact 与 outcome 记录。只有 grader 所需证据完整时，才能由 tracing 派生（[第 11 章](./11-evaluation.md)）。

**审计记录（Audit record）** — 具有明确 content、identity、timestamp、integrity、access、review 与 retention 的受保护问责记录。NIST 把这些属性分别列为控制要求（[NIST SP 800-53 Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)）。

**血缘（Lineage）** — 连接 identity、version、input、artifact、policy decision、approval、action 与 verified outcome 的 provenance graph。

**上下文重置（Context reset）** — 从结构化 handoff 开始新的模型 context，而 durable execution state 与 artifact 仍保存在模型外。

**上下文防火墙（Context firewall）** — 把 worker 的中间 context 与 parent 隔离。它能减少 context pollution，但不会提高 worker 的信任或权限；返回 claim 仍需 evidence 与 verification。

---

## 工具、授权与运行时执行

**工具调用 / 动作提议（Tool call / action proposal）** — 指明工具与参数的结构化模型输出。Application code 决定是否以及如何执行（[Anthropic - How Tool Use Works](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works)）。

**调用生命周期（Invocation lifecycle）** — Proposal → stream completion → parse → schema validation → semantic validation → authorization → 必要时 mandatory approval → idempotency/dedup → execution → timeout/cancellation handling → result normalization → observation → outcome confirmation（[第 6 章](./06-tools-invocation-lifecycle.md)）。

**Schema validity** — Action 是否符合声明的 machine-readable shape。它不建立 semantic correctness、authorization 或安全后果。

**Semantic validity** — 规范化参数对当前 task、resource 与 state 是否合理。

**执行结果（Execution result）** — Executor 对 attempted action 返回的内容。即使 intended environment outcome 没有发生，它也可能返回成功；timeout 后也可能是 unknown。

**Outcome** — Action 或 trial 之后经过验证的 environment/business state；不同于模型自述与 executor 的即时响应。

**幂等键（Idempotency key）** — Caller 提供给兼容 service、用来 deduplicate 等价 mutation attempt 的标识。它可以减少重复 effect，但不能替代 outcome verification。

**MCP（Model Context Protocol）** — 一种 client/server protocol；server 在自身实现与 access control 下暴露 tool 等 capability。Tool list 可以变化，因此 discovery 不能替代 invocation-time authorization（[MCP Tools Specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)）。

**A2A（Agent-to-Agent protocol）** — Agentic application 之间进行 delegation 与 coordination 的协议边界；它不同于向单个 agent runtime 暴露 tool 的边界。

**沙箱（Sandbox）** — 具有明确 filesystem、network、credential、process 与 persistence 边界的隔离执行环境。它限制 blast radius，并建立允许已授权 action 运行的区域（[第 7 章](./07-sandboxing-runtime-enforcement.md)）。

**能力授予（Capability grant）** — 在给定 identity、purpose、environment、audience 与 expiry 条件下，对某项 resource operation 的 scoped authority。

**委托授权（Delegated authorization）** — 从 user/service 派生的短期、audience-bound、purpose-bound authority。继续 delegation 可以收窄，但不能静默扩大权限。

**指令优先级（Instruction priority）** — 模型可见 instruction 的预期行为顺序。它是 defense in depth，不是 authorization 或执行保证；hierarchy evaluation 研究仍会测量 conflict failure（[Instruction Hierarchy](https://arxiv.org/abs/2404.13208)；[IHEval](https://arxiv.org/abs/2502.08745)）。

**模型可见策略（Model-visible policy）** — 放入模型 context、用于引导行为并帮助模型提出合规 action 的 instruction 与 explanation。

**可执行策略（Executable policy）** — 由外部软件在受保护 action path 上计算并执行的规则。

**策略决策点（Policy decision point，PDP）** — 根据 subject、action、resource、purpose、environment 与 policy 计算决策的组件（[NIST Zero Trust Glossary](https://pages.nist.gov/zero-trust-architecture/glossary.html)）。

**策略执行点（Policy enforcement point，PEP）** — 对 protected-resource request 不可绕过地落实 policy decision 的组件。Prompt 不是 PEP（[NIST Zero Trust Glossary](https://pages.nist.gov/zero-trust-architecture/glossary.html)）。

**建议型 Hook（Advisory hook）** — 补充 context、告警或要求模型重新考虑，却不一定阻止 dispatch 的 lifecycle hook。

**阻断执行（Blocking enforcement）** — 每个相关 action 必经、deny 会阻止 dispatch、且没有替代路径可以绕过的 control。

**审批请求 / 咨询（Approval request / consultation）** — 模型或 workflow 提出的人类输入请求。它是有用的 orchestration，但本身不是硬安全 gate。

**强制审批门（Mandatory approval gate）** — Policy 通过 runtime/PEP 在 protected dispatch 前强制插入的 gate，与模型是否主动请求无关。Approval 绑定 reviewer 看到的 identity、resource、normalized arguments、policy version、constraint 与 expiry（[MCP Tools Specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)）。

**致命三要素（Lethal trifecta）** — Private-data access、untrusted content 与 external communication 三者组合的实践者术语。它是 threat-model heuristic，不是正式安全标准（[第 7 章](./07-sandboxing-runtime-enforcement.md)）。

---

## 路由与工作流控制

**路由器（Router）** — 在执行 target 前，按照声明的 quality、cost、latency、capability 与 governance feature 选择 route target 的 policy。

**路由目标（Route target）** — Model + adapter + tool contract + reasoning policy 的组合，而不只是 model name。

**质量级联（Quality cascade）** — 先尝试较低成本 target，评估结果后，在 acceptance signal 拒绝时升级到更强 target。

**可靠性回退（Reliability fallback）** — Timeout、rate limit、provider error 等 availability failure 后切换 target；切换前必须检查 compatibility 与 side effect。

**对冲（Hedging）** — 启动多个兼容 attempt 来降低 tail latency，并明确 winner、cancellation、cost 与 side-effect semantics。

**人工升级（Human escalation）** — 把 uncertainty、incompatibility、policy conflict 或高 consequence 交给人，而不是静默换模型。

**兼容性门（Compatibility gate）** — 检查 fallback target 的 modalities、context limit、tool protocol/schema、structured output、continuation state、safety policy、latency envelope 与 data region 是否兼容（[第 8 章](./08-model-selection-routing-reasoning.md)）。

**推理策略（Reasoning policy）** — 对 reasoning effort、continuation、token accounting 与 allowed disclosure 的 provider-specific control/budget。它不是 hidden reasoning 的可移植 representation。

**确定性工作流（Deterministic workflow）** — 外部 code 拥有 sequencing 与 state；model call 填充有界 step。

**模型驱动循环（Model-directed loop）** — 模型选择下一项 proposed action；harness 负责 state、authorization、execution、stop rule 与 outcome check。

**混合工作流（Hybrid workflow）** — 在确定性结构内部放置有边界的 model-selected branch 或 loop。

**Orchestrator–workers** — Orchestrator 提出分解并委托有边界工作；外部 state 与 handoff contract 保存 evidence 与 recovery 信息的模式（[第 9 章](./09-agentic-workflow-patterns.md)）。

---

## 评估与验证

**任务 / 试验（Task / trial）** — Task 定义 input、environment、constraint 与 success criteria；trial 是对该 task 的一次 attempt。

**评分器（Grader）** — 测量 trial 某一项声明属性的 code-based、model-based 或 human component。

**过程 / 轨迹评分（Process / trajectory grading）** — 检查 action、policy use、tool argument、budget 或 recovery behavior，不假定 final artifact 正确。

**产物评分（Artifact grading）** — 检查 code、report、dataset 等可寻址 output。

**环境状态评分（Environment-state grading）** — 检查执行后的实际外部状态，而不是相信 agent final message。

**用户 / 业务结果评分（User / business outcome grading）** — 测量对用户或组织真正重要、可能延迟出现的产品结果。

**pass@k / pass^k** — `pass@k` 测量 `k` 次 attempt 中至少一次成功的概率；`pass^k` 测量全部 `k` 次一致成功。应按 product contract 选择指标并报告 uncertainty（[Foundations 第 13 章](../llm-foundations-zh/13-evaluation-for-llm-behavior.md)；[第 11 章](./11-evaluation.md)）。

**验证器层级（Verifier hierarchy）** — Schema check → deterministic test/linter → environment outcome check → same-agent critique → independent model grader → human review。按 consequence、ambiguity、correlated failure、latency 与 cost 选择；并非所有任务都必须使用另一个 agent（[第 13 章](./13-loop-engineering.md)）。

**基础设施噪声（Infrastructure noise）** — Hardware、resource limit、disk/network behavior、image/dependency、cache、parallelism 或 timeout 导致的分数变化，而不是被测 agent change 的影响（[Anthropic - Infrastructure Noise](https://www.anthropic.com/engineering/infrastructure-noise)）。

**发布证据包（Release evidence packet）** — 用于 release decision 的 pinned model-plus-harness configuration、per-slice trial result、uncertainty、grader version/calibration、failure、policy check 与 approval。

---

## 长运行任务、人类交互与 Computer Use

**持久执行（Durable execution）** — 持久化 progress，使 run 能在 process、worker、network 或 infrastructure failure 后恢复。Replay 复用 recorded model/tool output，而不是重新生成（[第 10 章](./10-state-event-history-production-factors.md)）。

**交接（Handoff）** — 包含 completed work、verified evidence、open risk、next action、artifact pointer 与 permission context 的 transfer package。

**停止规则（Stop rule）** — 在 success、budget exhaustion、no progress、repeated failure、policy deny、human cancel 或 terminal environment state 时明确终止。

**动作预算（Action budget）** — 同时覆盖 token、dollar、tool call、wall time、external spend 与 retry/fallback 的硬限制。

**引导事件（Steering event）** — 在明确 acceptance point 后改变未来 planning 的 recorded instruction；它不会追溯取消已经 dispatch 的 action。

**取消事件（Cancellation event）** — 停止未来工作并取消 compatible in-flight operation 的 recorded request；已经 commit 的 effect 可能需要 compensation。

**Computer-use 工具循环（Computer-use tool loop）** — 模型提出 structured computer action；application 执行；screenshot 或其他 UI state 作为 tool result/observation 返回（[OpenAI](https://developers.openai.com/api/docs/guides/tools-computer-use)；[Anthropic](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)）。

**截图观察（Screenshot observation）** — 某一时点捕获的 pixel evidence。执行时它可能已经过期，也不能单独证明 post-action outcome。

**界面身份（Surface identity）** — Observation 与 proposed UI action 所绑定的 application、process、window/tab、frame、URL/origin、viewport、geometry 与 capture version。

**观察 / 动作竞态（Observation/action race）** — Interface 在 observation 之后、dispatch 之前或期间发生变化，使基于状态 `S0` grounding 的 action 针对状态 `S1` 执行。Freshness check 与 observation barrier 用于控制该竞态（[第 15 章](./15-computer-use-multimodal-agents.md)）。

**视觉 / 坐标 Grounding（Visual / coordinate grounding）** — 把 intended UI target 映射到当前 interface state 中的 coordinate、element 或 action。

**Accessibility tree** — UI role、label、state 与 relationship 的结构化视图；可用时很有帮助，但不保证覆盖全部可见或可执行状态。

---

## 运维、Fleet 与治理

**熔断器（Circuit breaker）** — 在 failure 达到阈值后使不健康 dependency 的后续 call 快速失败、避免 retry storm 的 runtime control。

**终止开关（Kill switch）** — 通过 run lifecycle、credential revocation 与 PEP denial 实现的人类或 policy stop，而不是只发送自然语言 instruction。

**Span telemetry** — Model call、tool call、retrieval、context assembly、policy、cost 与 outcome 的 trace span/attribute。

**Trace-to-eval loop** — 把经过 redaction、consent/licensing review 的 production failure 变成具有完整 outcome assertion 的可复现 regression task。

**成本账本（Cost ledger）** — 与 run、action、provider、tool 与 external spend 关联的完整、未 sampling cost event。Sampled trace 本身不能支撑完整 ledger。

**发布单元（Release unit）** — Model、prompt、tool schema/implementation、retrieval configuration/index、memory policy、sandbox image、policy、grader 与 budget 的版本化组合。

**Agent 身份链（Agent identity chain）** — 相互连接的 agent version、sponsor、delegator、tenant、purpose、runtime/workload identity、credential audience、expiry 与 revocation state。

**Agent Registry** — Agent definition、version、owner、capability、requested authority、attestation、dependency 与 deployment state 的受治理 source of truth。

**Agent Fleet** — Agent definition、release、run、runtime、identity、tool 与 owner 的受治理集合，而不是单一 local agent instance。

**AgentOps** — 围绕 service health、agent outcome、safety/policy event、cost、privacy、release、incident 与 human escalation 的运营 discipline（[第 18 章](./18-agentops.md)）。

**不可否认性（Non-repudiation）** — 把 request 或 authorization 归因到 workload/policy identity 的 integrity-protected evidence。它不证明人类理解了 approval，也不证明模型 rationale 真实。
