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

**Context engineering(上下文工程)** — 在推理时策划上下文窗口中最小的一组高信号 token;比 harness engineering 低一层的实践(第 1、2 章)。

**MCP(Model Context Protocol,模型上下文协议)** — 一个开放的客户端-服务器标准,用于把工具、资源和提示暴露给 agent,使任何兼容客户端都能发现并调用它们,无需定制集成(第 4 章)。

**Tool call(工具调用)** — 模型发出的结构化输出(通常是 JSON),指明工具名和参数。由确定性的 harness 代码决定如何处理(第 4、8 章)。

---

## 上下文与记忆

**Context window(上下文窗口)** — 模型在一次推理调用中能关注的有限 token 跨度(第 2 章)。

**Context rot** — 随着上下文变长,模型准确回忆和使用信息的能力下降(第 2 章)。

**Attention budget(注意力预算)** — 把上下文视为有限资源、每个新增 token 都在花费它的视角(第 2 章)。

**KV-cache** — 对已处理 token 的 key/value 张量的缓存。相同的上下文前缀可由它服务,把首 token 延迟和成本降低约十倍(第 2 章)。

**Prefill / decode(预填充/解码)** — prefill 是处理输入提示,decode 是生成输出 token。Agentic 工作负载严重偏向 prefill(输入输出比约 100:1)(第 2 章)。

**Lost-in-the-middle** — 模型对长上下文中段信息的关注,不如对开头和结尾可靠的倾向(第 2、3 章)。

**Compaction(压缩)** — 在对话接近上下文上限时将其总结,并用该总结重新开启一个新窗口。有损(第 3 章)。

**Context reset(上下文重置)** — 完全清空上下文,用结构化 handoff 启动一个全新 agent——区别于原地压缩(第 7 章)。

**Just-in-time retrieval(即时检索)** — 通过轻量引用(文件路径、查询、链接)按需把数据加载进上下文,而不是预先 embed 一切(第 2 章)。

**Recitation(反复复述)** — 反复把目标或 todo list 重写到上下文尾部,使其留在模型最近的注意范围内(第 3 章)。

**结构化笔记(agentic memory)** — 让 agent 把进度笔记写到磁盘,以便上下文重置后重新加载(第 3 章)。

---

## 子代理与工作流

**Sub-agent(子代理)** — 在自己的上下文窗口内处理聚焦任务、只向父代理返回浓缩摘要的专门 agent(第 3 章)。

**Context firewall(上下文防火墙)** — 子代理模式的一个性质:父代理永远看不到子代理的中间噪声,只接收其浓缩结果(第 3 章)。

**Orchestrator-workers** — 一种工作流:中心 LLM 动态分解任务、委托给 worker LLM,并综合结果(第 6 章)。

**Evaluator-optimizer** — 一种工作流:一个 LLM 生成、另一个 LLM 批评,循环往复直到满足评价标准(第 6 章)。

**Micro-agent(小代理)** — 嵌入在确定性工作流中的小而聚焦的 agent(约 3-20 步),而非开放式"loop until done"的 agent(第 6、8 章)。

---

## 工具与沙箱

**Namespacing(命名空间)** — 把相关工具放在共同前缀下(`asana_*`、`browser_*`),防止命名冲突并支持按组 masking(第 4 章)。

**Action masking(动作掩码)** — 在上下文中保持完整工具集稳定,同时根据当前状态约束哪些动作可被选择(第 2 章)。

**Progressive disclosure(渐进披露)** — 只在需要时加载工具定义、文件或指令,而不是一次性全部前置(第 4 章)。

**Skill** — 由文件支撑的可复用能力(通常是一个 `SKILL.md` 加上配套代码),agent 可按需加载(第 4 章)。

**代码执行(作为元工具)** — 把工具呈现为 agent 通过写代码来调用的代码 API,而不是直接调用——大幅降低 token 成本(第 4 章)。

**Sandbox(沙箱)** — 带有文件系统和网络边界的隔离环境,agent 可在其中自由行动而无需逐动作审批(第 5 章)。

**Hook / middleware(中间件)** — 由 harness 在生命周期事件(启动、工具调用后、停止)自动执行的脚本或检查点,确定性地强制规则(第 5 章)。

**Feedforward / feedback(前馈/反馈)** — 前馈控制(guides)在 agent 行动前引导它;反馈控制(sensors)在它行动后观察并帮助自我修正(第 5 章)。

**Computational / inferential control(计算型/推断型控制)** — 计算型控制(linter、类型检查器)确定且快;推断型控制(AI review、LLM-as-judge)能处理细微判断,但更慢、非确定(第 5 章)。

**Ambient affordances(环境可供性)** — 环境本身的属性(强类型、清晰模块边界、有立场的框架),使代码库对 agent 更易理解和处理(第 5 章)。

**Prompt injection(提示注入)** — 一种攻击:藏在 agent 所读内容(网页、文件、工具结果)中的指令被模型当作命令执行(第 5 章)。

**Lethal trifecta(致命三要素)** — 同一 agent 同时具备:访问私有数据、接触不可信内容、向外通信能力——这三者的危险组合(第 5 章)。

---

## 评估

**Eval harness(评估 harness)** — 端到端运行评估的基础设施;区别于被评估的 agent harness(第 9 章)。

**Task / trial(任务/试验)** — *task* 有定义好的输入和成功标准;*trial* 是对它的一次尝试(第 9 章)。

**Grader** — 为试验某个方面评分的组件:code-based、model-based 或 human(第 9 章)。

**Transcript(trace、trajectory)** — 一次试验的完整记录:每条消息、工具调用和结果(第 9、11 章)。

**Outcome(结果状态)** — 试验结束时的最终环境状态,区别于 agent 的文本回应(第 9 章)。

**Capability eval / regression eval** — capability eval 衡量 agent 新近能做什么(通过率低、正在爬升);regression eval 保护它已能可靠做到的事(接近 100%)(第 9 章)。

**pass@k / pass^k** — pass@k 是 k 次尝试中至少一次成功的概率(随 k 上升);pass^k 是 k 次试验*全部*成功的概率(随 k 下降)(第 9 章)。

**Infrastructure noise(基础设施噪声)** — 由运行时资源配置(而非模型能力)造成的 benchmark 分数波动(第 10 章)。

---

## 长运行代理与领域

**交接班问题(shift-change problem)** — 由于上下文窗口有限,后续 agent session 到来时对之前的 session 毫无记忆这一挑战(第 7 章)。

**Initializer agent** — 只运行一次、为后续 coding agent session 搭好项目(init 脚本、进度日志、feature list)的 agent(第 7 章)。

**Sprint contract** — generator 与 evaluator 两个 agent 之间基于文件的约定,在每个构建 sprint 前敲定要构建什么、如何验证成功(第 7 章)。

**Stateless reducer(无状态归约器)** — 把 agent 建模为对 event log 的纯 fold,使其可序列化、可重放、可测试(第 8 章)。

**Model-harness co-evolution(模型与 harness 共同演化)** — frontier 模型在其 harness 一起参与的情况下 post-train 所形成的耦合,因此改变任一侧都可能损害性能(第 11 章)。

**Ralph Wiggum loop** — 一个 hook,拦截 agent 的退出尝试,并在干净的上下文窗口中重新注入原始 prompt,迫使它继续对照目标工作(第 7 章)。
