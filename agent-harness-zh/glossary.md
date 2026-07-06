# 术语表

本书所用术语的简明定义。括注的章节是该术语被深入讨论的位置;某条定义的来源,可顺着对应章节的行内引用和 [参考文献](./references.md) 查找。

---

## 核心概念

**Agent(代理)** — 语言模型,加上让它能真正做事的那套系统:浏览代码库、运行代码、调用工具、从错误中恢复、支撑多步骤任务。由公式 *Agent = Model + Harness* 概括(第 1 章)。

**Agent harness** — 围绕模型工程化出来的一切:系统提示、工具及其描述、内置基础设施、子代理编排、控制流、hooks/中间件,以及评估基础设施(第 1 章)。

**Agent loop(agent 循环)** — 核心执行循环:组装上下文 → 模型发出工具调用或最终答案 → harness 执行调用 → 把结果追加进上下文 → 重复直到完成(第 1 章)。

**Augmented LLM(增强型 LLM)** — 配备了检索、工具和记忆的模型,能生成自己的查询、选择工具、决定保留什么。是 agent 的基本构件(第 1、6 章)。

**ACI(agent-computer interface,代理-计算机接口)** — agent 与其工具之间的设计界面,类比 HCI:agent 如何使用工具,值得投入与"人类如何使用界面"同等的工程(第 4 章)。

**Builder harness** — AI 实验室作为 coding agent 产品一部分而提供的系统提示和工具;harness 三层同心圆中的中间层(第 1 章)。

**User harness** — 团队为适配自己代码库而在 coding agent 之上添加的 AGENTS.md、hooks、skills 和 review agents;最外层(第 1 章)。

**Harness engineering** — 迭代模型周边的整个系统(而不只是单个提示),让每个观察到的失败被永久工程化掉(第 1 章)。

**Binding-constraint thesis(约束瓶颈命题)** — 对长周期 agent 来说,可靠性常常受 harness 层限制,包括 execution、tools、context、lifecycle、observability、verification 和 governance,而不只是受模型能力限制(第 1、11 章)。

**ETCLOVG** — Agent harness engineering 的七层分类:Execution environment、Tool interface、Context、Lifecycle、Observability、Verification、Governance(第 1 章)。

**Context engineering(上下文工程)** — 在推理时策划上下文窗口中最小的一组高信号 token;比 harness engineering 低一层的实践(第 1、2 章)。

**MCP(Model Context Protocol,模型上下文协议)** — 一个开放的客户端-服务器标准,用于把工具、资源和提示暴露给 agent,使任何兼容客户端都能发现并调用它们,无需定制集成(第 4 章)。

**A2A(Agent-to-Agent protocol)** — 用于不透明 agentic applications 之间委托的协议边界;它与主要向单个 agent runtime 暴露工具和上下文的 MCP 互补(第 4 章)。

**Protocol boundary(协议边界)** — 工具或 agent 标准跨越的集成线:model-to-function、agent-to-external-capability、agent-to-agent、agent-to-repo/environment(第 4 章)。

**Tool call(工具调用)** — 模型发出的结构化输出(通常是 JSON),指明工具名和参数。由确定性的 harness 代码决定如何处理(见《LLM Foundations》第 12 章)(第 4、8 章)。

**结构化输出(structured output)** — 被约束成机器可读形状的模型输出,通常是 JSON 或 XML,便于软件可靠解析。工具调用是它在 agent 系统中的典型形式(见《LLM Foundations》第 12 章)(第 1、4、8 章)。

---

## 上下文与记忆

**Context window(上下文窗口)** — 模型在一次推理调用中能关注的有限 token 跨度(见《LLM Foundations》第 9 章)。在 harness 中,它是每个系统提示、工具结果和历史轮次都要争抢的预算(第 2 章)。

**Context rot** — 随着上下文变长,模型准确回忆和使用信息的能力下降(见《LLM Foundations》第 9 章)。其 harness 视角:它是首要的运行约束,在本书中以 attention budget 来刻画(第 2 章)。

**Attention budget(注意力预算)** — 把上下文视为有限资源、每个新增 token 都在花费它的视角(第 2 章)。

**KV-cache** — 对已处理 token 的 key/value 张量的缓存(见《LLM Foundations》第 9 章)。相同的上下文前缀可由它服务,把首 token 延迟和成本降低约十倍;在 harness 中,前缀稳定性成为一个生产成本杠杆(第 2 章)。

**Prefill / decode(预填充/解码)** — prefill 是处理输入提示,decode 是生成输出 token(见《LLM Foundations》第 9 章)。Agentic 工作负载严重偏向 prefill(输入输出比约 100:1)(第 2 章)。

**Lost-in-the-middle** — 模型对长上下文中段信息的关注,不如对开头和结尾可靠的倾向(见《LLM Foundations》第 9 章)(第 2、3 章)。

**Compaction(压缩)** — 在对话接近上下文上限时将其总结,并用该总结重新开启一个新窗口。有损(见《LLM Foundations》第 9 章)(第 3 章)。

**Context reset(上下文重置)** — 完全清空上下文,用结构化 handoff 启动一个全新 agent——区别于原地压缩(第 7 章)。

**Just-in-time retrieval(即时检索)** — 通过轻量引用(文件路径、查询、链接)按需把数据加载进上下文,而不是预先 embed 一切(第 2 章)。

**Recitation(反复复述)** — 反复把目标或 todo list 重写到上下文尾部,使其留在模型最近的注意范围内(第 3 章)。

**结构化笔记(agentic memory)** — 让 agent 把进度笔记写到磁盘,以便上下文重置后重新加载(第 3 章)。

**MemGPT** — 一种记忆架构,把上下文窗口当作 OS 式的“主存”、把外部存储当作“磁盘”,让模型通过函数调用把信息换入换出(虚拟上下文管理)(第 3 章)。

**Mem0** — 一层记忆:跨会话动态抽取、整合并检索显著事实,并有可选的图变体捕获实体关系(第 3 章)。

**Sleep-time compute(睡眠期计算)** — 在请求之间离线处理上下文——预判可能查询并预计算推断——以削减后续查询所需的计算(第 3 章)。

---

## 子代理与工作流

**Sub-agent(子代理)** — 在自己的上下文窗口内处理聚焦任务、只向父代理返回浓缩摘要的专门 agent(第 3 章)。

**Context firewall(上下文防火墙)** — 子代理模式的一个性质:父代理永远看不到子代理的中间噪声,只接收其浓缩结果(第 3 章)。

**Orchestrator-workers** — 一种工作流:中心 LLM 动态分解任务、委托给 worker LLM,并综合结果(第 6 章)。

**Evaluator-optimizer** — 一种工作流:一个 LLM 生成、另一个 LLM 批评,循环往复直到满足评价标准(第 6 章)。

**Micro-agent(小代理)** — 嵌入在确定性工作流中的小而聚焦的 agent(约 3-20 步),而非开放式"loop until done"的 agent(第 6、8 章)。

**Multi-agent topology(多代理拓扑)** — 多代理系统的协调形态:orchestrator–worker、hierarchical、blackboard/shared-memory,或 debate/voting(第 3、6 章)。

**MAST(多代理系统失败分类法)** — 一套经验性的多代理失败分类,含 14 种失败模式,分三大类:规格问题、代理间错位、任务验证(第 3 章)。

**推理 / 自我纠错模式** — 单个 agent 用 token 换可靠性的思考模式:Reflexion(自我批评记忆)、Self-Refine(批评并修订)、CRITIC(工具落地的批评)、Tree of Thoughts 与 LATS(分支搜索)、ReWOO(先规划再执行)(第 6 章)。

---

## 工具与沙箱

**Namespacing(命名空间)** — 把相关工具放在共同前缀下(`asana_*`、`browser_*`),防止命名冲突并支持按组 masking(第 4 章)。

**Action masking(动作掩码)** — 在上下文中保持完整工具集稳定,同时根据当前状态约束哪些动作可被选择(第 2 章)。

**Progressive disclosure(渐进披露)** — 只在需要时加载工具定义、文件或指令,而不是一次性全部前置(第 4 章)。

**Skill** — 由文件支撑的可复用能力(通常是一个 `SKILL.md` 加上配套代码),agent 可按需加载(第 4 章)。

**代码执行(作为元工具)** — 把工具呈现为 agent 通过写代码来调用的代码 API,而不是直接调用——大幅降低 token 成本(第 4 章)。

**Shell** — Bash、zsh 这类命令行接口。在 agent 系统中,shell 访问很强大,因为它让 agent 可以运行测试、检查文件、安装包,并临时组合工具(第 1、4、5 章)。

**文件系统(filesystem)** — agent 可以读写的目录和文件。它既是工作区,也是持久记忆,还是 agent 与人类协作的界面(第 1、2、5 章)。

**Sandbox(沙箱)** — 带有文件系统和网络边界的隔离环境,agent 可在其中自由行动而无需逐动作审批(第 5 章)。

**Sandbox liveness(沙箱活性)** — 沙箱作为授权区域的作用:agent 可在配置边界内行动而无需逐动作审批(第 5 章)。

**Governance(治理)** — 管理身份、权限策略、scoped credentials、人类审批、审计日志和跨层安全问责的 harness 机制(第 5、17 章)。

**Delegated auth(委托授权)** — Agent 通过 scoped credentials 或 proxy-authorized identity 行动,而不是继承用户完整环境权限的模式(第 5 章)。

**Supply-chain provenance(供应链来源证据)** — 关于 agent 所依赖的 tools、packages、datasets、MCP servers 和 retrieval sources 的来源与完整性证据(第 5、17 章)。

**Hook / middleware(中间件)** — 由 harness 在生命周期事件(启动、工具调用后、停止)自动执行的脚本或检查点,确定性地强制规则(第 5 章)。

**Feedforward / feedback(前馈/反馈)** — 前馈控制(guides)在 agent 行动前引导它;反馈控制(sensors)在它行动后观察并帮助自我修正(第 5 章)。

**Computational / inferential control(计算型/推断型控制)** — 计算型控制(linter、类型检查器)确定且快;推断型控制(AI review、LLM-as-judge)能处理细微判断,但更慢、非确定(第 5 章)。

**Ambient affordances(环境可供性)** — 环境本身的属性(强类型、清晰模块边界、有立场的框架),使代码库对 agent 更易理解和处理(第 5 章)。

**CI(持续集成)** — 围绕代码变更自动运行的检查,通常包括测试、linter、构建和部署关卡。在 harness 设计中,这类检查会成为反馈型 sensor(第 5、9 章)。

**Linter / type checker(linter / 类型检查器)** — 在运行前发现风格、语法、结构或类型错误的确定性工具。它们是外层 harness 中常见的计算型 sensor(第 5 章)。

**Prompt injection(提示注入)** — 一种攻击:藏在 agent 所读内容(网页、文件、工具结果)中的指令被模型当作命令执行(见《LLM Foundations》第 8、12 章)(第 5 章)。

**Lethal trifecta(致命三要素)** — 同一 agent 同时具备:访问私有数据、接触不可信内容、向外通信能力——这三者的危险组合(第 5 章)。

**Circuit breaker(熔断器)** — 一个可靠性包装:在失败达到阈值后跳闸,让后续对失败工具、服务或子代理的调用快速失败,而不是挂起或重试成风暴(第 5 章)。

**Kill switch(终止开关)** — 由人或策略触发的停止,立即且独立于 agent 自身控制流地终止一个 agent 或 fleet;它存在于 harness 中,因为被操纵的 agent 不能被指望停下自己(第 5 章)。

**Canary token(金丝雀令牌)** — 一份被种下的假机密(未使用的 key、诱饵文件、陷阱 URL),其被访问或外泄会触发高信号警报,表明 agent 已被操纵——对 lethal-trifecta 外泄路径的检测(第 5 章)。

**Action budget(动作预算)** — 对工具调用、token、墙钟时间或花费设的硬性上限,达到后循环停止并上报,而非失控奔跑(第 5、8、17 章)。

---

## 评估

**Eval harness(评估 harness)** — 端到端运行评估的基础设施;区别于被评估的 agent harness(第 10 章)。

**Readiness validation(就绪验证)** — 验证某个具体 model + harness 配置是否适合特定任务分布、环境、预算和治理规则(第 10 章)。

**Failure attribution(失败归因)** — 在选择修复方式前,先把 agent 失败标注到最可能的问题层:execution、tool interface、context、lifecycle、observability、verification 或 governance(第 9、11 章)。

**Task / trial(任务/试验)** — *task* 有定义好的输入和成功标准;*trial* 是对它的一次尝试(第 10 章)。

**Grader** — 为试验某个方面评分的组件:code-based、model-based 或 human(第 10 章)。

**Transcript(trace、trajectory)** — 一次试验的完整记录:每条消息、工具调用和结果(第 9、11 章)。

**Outcome(结果状态)** — 试验结束时的最终环境状态,区别于 agent 的文本回应(第 10 章)。

**Capability eval / regression eval** — capability eval 衡量 agent 新近能做什么(通过率低、正在爬升);regression eval 保护它已能可靠做到的事(接近 100%)(第 10 章)。

**pass@k / pass^k** — pass@k 是 k 次尝试中至少一次成功的概率(随 k 上升);pass^k 是 k 次试验*全部*成功的概率(随 k 下降)(见《LLM Foundations》第 13 章)(第 10 章)。

**Infrastructure noise(基础设施噪声)** — 由运行时资源配置(而非模型能力)造成的 benchmark 分数波动(第 11 章)。

---

## 长运行代理与领域

**交接班问题(shift-change problem)** — 由于上下文窗口有限,后续 agent session 到来时对之前的 session 毫无记忆这一挑战(第 7 章)。

**Initializer agent** — 只运行一次、为后续 coding agent session 搭好项目(init 脚本、进度日志、feature list)的 agent(第 7 章)。

**Managed agent** — 平台管理的 agent 架构,把模型侧 brain、执行侧 hands 和持久 session/event log 分开,使它们能独立失败、重置或迁移(第 7 章)。

**Brain / hands split** — Managed-agent 中决策上下文(brain)与可替换执行环境(hands)的分离(第 7 章)。

**Sprint contract** — generator 与 evaluator 两个 agent 之间基于文件的约定,在每个构建 sprint 前敲定要构建什么、如何验证成功(第 7 章)。

**Event log(事件日志)** — 对消息、工具调用、结果、审批和错误的追加式记录。执行状态可以从中推导出来,因此 agent 更容易重放和调试(第 9 章)。

**Agent platform** — 超出本地 framework 的基础设施:跨多次运行和多用户的 durable workspaces、managed sandboxes、identity、billing、observability、evaluation、governance 和 human handoff(第 8、17 章)。

**Checkpoint / resume(检查点/恢复)** — 一种可靠性模式:agent 定期保存足够状态,以便在失败或上下文重置后继续工作而不丢进度(第 7、8 章)。

**Durable execution(持久化执行)** — 一种基础设施保证:把每个工作流步骤持久化,使崩溃或被中断的 agent 从最后记录的一步恢复;非确定的模型/工具调用被记录并重放,而非重算(第 7 章)。

**Time horizon(时间视野)** — METR 的能力指标:模型以 50% 可靠性能完成的人类任务长度;前沿值大约每七个月翻一番(第 7、18 章)。

**Stateless reducer(无状态归约器)** — 把 agent 建模为对 event log 的纯 fold,使其可序列化、可重放、可测试(第 9 章)。

**Model-harness co-evolution(模型与 harness 共同演化)** — frontier 模型在其 harness 一起参与的情况下 post-train 所形成的耦合,因此改变任一侧都可能损害性能(第 12 章)。

**Span telemetry** — 以 span tree 表示的结构化 trace 数据,覆盖 model calls、tool calls、retrieval、context assembly、permissions、costs 和 outcomes(第 12 章)。

**OpenTelemetry GenAI semantic conventions** — 一套新兴的、面向 LLM 与 agent 遥测的标准 span 与属性名 schema(`invoke_agent`、`chat`、`execute_tool` span),让 agent trace 加入普通可观测栈(第 12 章)。

**Trace-to-eval loop** — 把真实生产失败转换成脱敏、可复现、带 outcome assertion 的 regression case(第 12 章)。

**Meta-harness** — 把 harness 设计本身当作优化对象:用 eval feedback 消融或搜索 prompts、tools、retries、context policies、evaluators 和 control loops(第 12 章)。

**Cost-quality-speed trilemma(成本-质量-速度三难)** — 更强 execution environment、observability、verification 和 governance 会提高可靠性,但也增加成本和延迟(第 18 章)。

**Capability-control tradeoff(能力-控制权衡)** — 更多权限、工具、记忆和自治会提升能力,同时扩大控制、provenance 和审计问题(第 18 章)。

**Ralph Wiggum loop** — 一个 hook,拦截 agent 的退出尝试,并在干净的上下文窗口中重新注入原始 prompt,迫使它继续对照目标工作(第 7、8 章)。

**Loop engineering(循环工程)** — 把 agent loop 本身当作设计单元:规定环绕模型的 trigger、topology、verifier 和 stop rule,使它能无人值守地运行。这是外层控制循环的运维者视角(第 8 章)。

**Trigger(触发器 / heartbeat)** — 无需人类 prompt 就启动一趟 loop 的东西:一个 schedule、一个 webhook,或另一个 agent(第 8 章)。

**Verifier(验证器 / maker–checker)** — 决定“够好了”的固定标准,由一个不同于产出工作的 agent 来施加,使 maker 不能批改自己的作业;是 loop 设计的瓶颈(第 8 章)。

**Stop rule(停止规则)** — 结束一个 loop 的明确条件——success、no-op、ask-for-approval——外加兜住失控的三个硬停:最大迭代次数、无进展检测、预算上限(第 8 章)。

**Closed vs. open loop(闭环与开环)** — 闭环预先钉死硬的、可检查的验收标准,放着跑是安全的;开环朝模糊目标探索,需要一个更强的 verifier,否则会 ship 出自信的垃圾(第 8 章)。

---

## 指令与模型选择

**Instruction hierarchy(指令层级)** — 指令按来源带有不同权威——system 高于 developer 高于 user 高于工具/检索内容——使低优先级指令无法覆盖高优先级指令。Prompt injection 就是这一层级的失效(第 13 章)。

**Right altitude(合适的高度)** — System prompt 的目标具体程度:具体到能可靠引导行为,一般到能跨情况迁移,既不沦为脆弱的硬编码规则,也不流于含糊指引(第 13 章)。

**Model routing(模型路由)** — 给请求的难度分类,把简单的派给便宜的弱模型、把困难的派给昂贵的强模型。只有当路由决策远比它带来的节省更便宜时才划算(第 14 章)。

**LLM cascade(级联)** — 先试便宜模型,只在 verifier 否决便宜答案时才升级到更强的模型。升级信号可靠时,能以更低成本匹配强模型准确率(第 14 章)。

**Fallback(回退)** — 当主模型出错、超时或被限流时切换到备用模型,使 agent 优雅降级(第 14 章)。

**AI gateway(AI 网关)** — 位于 harness 与各模型供应商之间的基础设施组件,对外呈现一个统一接口覆盖多个模型,并承载路由、fallback、预算、缓存和日志(如 LiteLLM、Portkey)(第 14、17 章)。

**Reasoning model(推理模型)** — 经过 post-training(通常是在可验证奖励上做 RL),学会在回答前生成很长内部推理、用 inference token 换困难任务上更好表现的模型(第 14 章;*LLM Foundations* 第 7–8 章)。

**Test-time compute** — 在回答时花更多 inference token、时间和金钱以在困难问题上做得更好——区别于更大模型或更多硬件的一条 scaling 轴(第 14 章)。

---

## 人类交互

**Permission fatigue(许可疲劳)** — 当 agent 过于频繁请求批准时监督的退化,把人训练成不读就盖橡皮图章(第 5、14 章)。

**Mixed-initiative(混合主动)** — 一种交互风格:系统逐动作决定是自主行动还是让步给人,并管理打断的代价(第 15 章)。

**Approval as a tool call(批准即工具调用)** — 把人类批准建模为 agent 调用的一个工具,使请求成为持久、可重放、可审计、并与挂起/恢复组合的事件(第 15 章)。

**Steering(引导)** — 把一条新指令注入正在运行的 agent,使其在下一回合被纳入,从而在不丢 session 状态的前提下重定向(第 15 章)。

**Calibrated trust(校准过的信任)** — 人接口的目标:人对 agent 的信任恰好等于它在给定任务上配得到的程度,通过透明和扎根于验证的不确定性、而非流畅度来实现(第 15 章)。

---

## Computer-Use Agent

**Computer-use agent** — 通过 GUI 操作软件的 agent——查看截图并发出光标、键盘和导航动作——而不是调用定义好的 API(第 16 章)。

**Visual grounding(视觉接地)** — 把意图(“点击 Submit”)翻译成具体动作(在特定坐标点击);一种在 API 工具里没有对应物的错误模式(第 16 章)。

**Set-of-Mark prompting** — 在候选可交互元素上叠加编号标记,让模型选择离散标签而不是产出裸坐标,提升 grounding 可靠性(第 16 章)。

**Accessibility tree(可达性树)** — UI 的结构化语义表示(role、label、state),为辅助技术构建;常比裸像素或 DOM 更紧凑、更精确的屏幕编码(第 16 章)。

---

## 成本与运维

**Per-task budget(每任务预算)** — 对单次 agent 运行的 token、工具调用或成本设的明确上限,超过后 agent 停下来问,而不是无限循环(第 17 章)。

**Cost attribution(成本归因)** — 给 trace 的每个 span 附上 token 和美元成本,把“agent 很贵”变成一个具体、可修的工程发现(第 17 章)。

**Multi-tenancy / 租户隔离** — 用一个平台服务许多用户或组织,同时防止状态串味(context/记忆/缓存跨租户泄露)和权限串味(用错误租户的凭据行事)(第 17 章)。

**Canary rollout(金丝雀放量)** — 把 harness 改动发布给一小部分流量,在全量部署前盯住生产 trace 和 outcome 指标,接住 eval 套件漏掉的案例(第 17 章)。

**Semantic cache(语义缓存)** — 一种缓存:通过嵌入查询、在相似度超过阈值时返回已存响应,来服务*相似*(而非仅相同)的请求;能省掉整次模型调用,但有错误命中的风险(第 17 章)。

**AI 管理体系(ISO/IEC 42001)** — 首个用于治理组织 AI 的可认证标准:如何建立、运行并持续改进一套 AI 管理体系——ISO 27001 的 AI 对应物(第 17 章)。

**欧盟 AI 法案(EU AI Act)** — Regulation (EU) 2024/1689,首部全面的 AI 法律;它按风险层级对系统分类,并对高风险用途施加有约束力的义务(第 17 章)。
