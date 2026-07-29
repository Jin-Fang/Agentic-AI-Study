# 第 15 章：人–Agent 交互

本书大部分内容都在讨论模型与外部世界之间的机制：context、工具、sandbox、状态和评估。然而，只要 agent 执行的是可能产生重要后果的工作，人也会成为 loop 的一部分。人可能需要批准动作、在执行过程中调整方向、review 结果，并判断应该在多大程度上信任输出。支持这些判断的接口，本身就是一个独立的 harness 层，正如[第 4 章](./04-tools-agent-computer-interface.md)讨论的 agent–computer interface 一样，需要经过有意识的工程设计。[第 5 章](./05-sandboxing-guardrails.md)已经介绍了其中一个问题——permission fatigue；本章将从整体上讨论人与 agent 之间的接口。

### 15.1 人在 loop 之内

讨论 agent–computer interface 时，我们强调：agent 如何使用工具，应当获得与传统用户界面同等的工程重视。人–agent 接口正好是它的镜像：人如何监督 agent，和 agent 如何行动同样值得重视。Anthropic 的实现原则也指向这一点：保持简单，*优先保证透明度并展示 agent 的规划步骤*，同时仔细设计接口 ([Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents))。透明度不只是改善 UX；缺少透明度，就不可能进行有意义的监督。

这个问题早在现代 agent 出现之前就已经存在。Horvitz 在 1999 年提出的 *mixed-initiative（混合主动）* 接口原则，已经明确了几个核心问题：代用户行事的系统何时应该自主执行，何时应该让用户决定？它应该如何衡量打断用户的成本？又该如何保留并利用交互 context ([Horvitz — Principles of Mixed-Initiative User Interfaces](https://www.microsoft.com/en-us/research/publication/principles-of-mixed-initiative-user-interfaces/))？当系统能够运行 shell 或执行其他可能产生重要后果的动作时，这些问题会变得更加迫切。

### 15.2 两个失败模式：permission fatigue 与盲目信任

人–agent 接口通常会以两种相反的方式失效，合理的设计必须同时避免它们：

- **Permission fatigue（许可疲劳）** 源于询问过于频繁。如果 agent 每执行一个动作都要请求批准，人会逐渐习惯这些提示，最后不再阅读就直接点击“allow”。这甚至可能比完全没有提示更糟，因为它只有监督的*表象*，却没有监督的实质 ([Anthropic — Beyond Permission Prompts](https://www.anthropic.com/engineering/claude-code-sandboxing)，第 5 章)。Sandbox 的作用之一，正是让边界内的低风险动作无需反复询问。
- **盲目信任** 源于询问过少。流畅、自信的输出很容易让人未经检查就直接批准。当 agent 给出一个貌似合理的错误——例如虚构引用，或进行了一次存在细微缺陷的重构——如果 review 界面没有展示支持结论的证据，人就更难发现问题。

这两种失败位于同一条调节轴的两端：提示太少容易造成盲目信任，提示太多又会引发许可疲劳。解决办法不是选择一个适用于所有动作的全局设置，而是采用*与风险相称*的交互方式：动作需要占用多少人工注意力，应当由它的可逆性和影响半径决定（§15.3）。

### 15.3 混合主动：何时问、何时做

这个核心问题需要针对每个动作分别回答：agent 应该直接执行，还是先征求批准？一个实用的默认原则，是根据动作可能造成的后果来决定人的参与程度：

- **静默执行**：对于读取文件、运行测试、修改 scratch 工作区等可逆且低风险的动作，可以在 sandbox 内直接执行（第 5 章）。如果连这些动作都要求批准，只会让人逐渐忽略提示。
- **执行并报告**：如果动作会产生一定后果，但结果可观察、动作也可逆，就不必阻塞等待批准；执行后留下清晰记录，供人事后 review 即可。
- **先问再执行**：对于删除数据、发送外部消息、花钱或修改生产环境等不可逆或高影响半径的动作，必须先获得批准。这也对应第 5 章的 *lethal trifecta* 边界：当 agent 即将把私有数据、不可信输入和外部触达能力结合起来时，人就应该参与决策。

这正是[第 18 章](./18-agent-fleets-identity-control-plane.md)再次讨论的 capability–control 权衡：更高的自治程度带来更强的能力，也带来更重的控制负担。接口把这种权衡落实到每一个具体动作上。

### 15.4 把批准建模为一次工具调用

HumanLayer 的十二要素宣言提出了一种清晰的结构：*通过工具调用联系人类*。不要把人的批准视为控制流中的特殊例外，而应把它建模为 agent 可以调用的普通工具——`request_human_approval(action, context)`。人的回应随后像其他 observation 一样返回 loop ([HumanLayer — 12-Factor Agents](https://www.humanlayer.dev/blog/12-factor-agents))。

这样一来，人与 agent 的交互就能纳入系统的整体架构。批准请求会成为 event log（第 9 章）中的一个事件，因此可以持久保存、重放和审计。它也能与[第 7 章](./07-long-running-agents.md)的长运行模式配合：agent 发出批准请求后可以挂起，数小时后收到回应再继续执行。因为状态保存在 log 中，系统不必一直维持一个打开的连接。人也因此成为 trace（[第 12 章](./12-trace-driven-iteration.md)）中的一等参与者，而不再是一次带外打断。

### 15.5 设计 review 界面

人的 review 质量取决于界面提供了哪些信息。只展示 agent 结论的界面容易诱发盲目信任；只有同时展示*结论背后的证据*，人才能作出有依据的判断。对于 coding agent，证据包括 diff、实际运行过的测试和执行过的命令，而不只是一句“done”。对于 research agent，证据包括摘要所依据的来源。

这些 review 证据可以来自调试所使用的同一套 span telemetry（第 12 章）：有用的 trace 同时也会是有用的 review 产物。人–AI 交互研究的原则在这里可以直接应用：界面应当说明系统能够做什么，展示这次任务完成得如何，并让人能够高效纠正或否决错误输出 ([Amershi et al. — Guidelines for Human-AI Interaction](https://www.microsoft.com/en-us/research/publication/guidelines-for-human-ai-interaction/))。只有当 agent 的工作易于验证，也能在必要时方便地否决，人类监督才具有可操作性。

### 15.6 引导与打断

监督不仅发生在执行前后，也发生在执行过程中。如果人发现 agent 正在沿错误方向推进，就需要在不终止 session、也不丢失状态的情况下重新引导它。因此，harness 必须提供 *steering*（引导）能力：把新指令注入正在运行的 agent，并让下一回合纳入这条指令。

实现方式与前面各章的机制直接相连。Agent loop 会在每一回合重新组装 context（第 1 章），所以 harness 只需把 steering 消息加入下一次迭代。按照[第 3 章](./03-compaction-memory-subagent.md)的 recitation 逻辑，把纠正指令放在 context 末尾附近，可以使其处于模型最可靠的 attention 范围内。Steering 还依赖完善的 checkpoint（第 7 章）：能够暂停和恢复的 agent 才能接受中途纠正；如果全部状态都封闭在一次不可中断的调用中，就无法进行引导。

### 15.7 校准信任：透明与不确定性

人–agent 接口的目标是建立*经过校准的信任*：针对当前任务和现有证据，人对 agent 的信任程度应当恰如其分。信任过度会让错误未经 review 就被接受；信任不足则会造成疲劳，浪费人的注意力。harness 可以通过两种机制来帮助校准信任：

- **透明度**——展示规划步骤、工具调用和证据——让人根据 agent 的实际工作过程建立信任，而不是被流畅的措辞说服 ([Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents))。
- **不确定性信号**——明确指出结果中仍有疑问的部分——把人的注意力引向真正需要检查的位置。但这种机制只有在信号可信时才有价值。姊妹卷指出，模型信心本身往往没有得到良好校准（*LLM Foundations*，第 10 章）。因此，harness 应优先用外部验证来说明不确定性，例如测试是否通过、引用来源是否存在，而不能只依赖模型自己含糊或保留的语气。

### 15.8 监督许多 agent

随着 agent 越来越普遍，人的角色会从亲自完成工作，转向监督完成工作的 agent，最终还要同时监督*许多* agent。这种转变会改变接口需求。一个人监督十个 agent 时，不可能逐条阅读所有 trace；界面必须主动标出需要关注的情况，例如哪些 agent 正在等待批准，哪些结果仍有不确定性，以及哪些输出没有通过验证。

当 agent 生成变更的速度超过人的检查速度时，code review 就会成为瓶颈。因此，review 队列应按**风险与证据**排序，而不是按到达时间或 trace 长度排序。确定性检查失败、高 blast radius 动作、安全敏感路径、新的工具用法、policy rule 命中、薄弱或相互冲突的 grader 证据，以及规模很大却缺少解释的 diff，都应当优先处理。对于验证充分的低风险变更，可以只展示摘要或进行抽样；可能产生重要后果的变更，则要保留完整 artifact。第 13.8 节介绍的 scoped review rule 可以进一步提高这种路由的精度。

到了这个规模，监督就成为[第 18 章](./18-agent-fleets-identity-control-plane.md)所讨论的 fleet 级控制平面问题。核心原则是让监督既*高效又有实质意义*：足够高效，一个人才不会在监督多个 agent 时被信息淹没；具有实质意义，监督才不会沦为走过场的批准。本章介绍的各项技术——与风险相称的提示、把批准表示为工具调用、提供充分证据的 review 界面、steering，以及经过校准的透明度——都服务于这一目标。

---

## 图：与风险成比例的交互

```mermaid
flowchart TD
    ACT["Agent 提议一个动作"] --> Q{"可逆？<br/>影响半径？"}

    Q -->|"可逆、低风险<br/>（读、测、scratch 编辑）"| SILENT["在 sandbox 内静默执行"]
    Q -->|"要紧但<br/>可观察且可逆"| REPORT["执行并报告<br/>（留下可 review 的 trace）"]
    Q -->|"不可逆 / 高风险<br/>（删、发、花钱、生产）"| ASK["request_human_approval()<br/>—— 批准即工具调用"]

    ASK --> WAIT["挂起；回应时<br/>从 event log 恢复（第 7、9 章）"]
    SILENT --> LOG["Event log + trace"]
    REPORT --> LOG
    WAIT --> LOG
    LOG --> REVIEW["Review 界面：<br/>展示证据，不只是结论"]

    REVIEW -.校准过的信任.-> ACT
```

*交互方式可以从静默执行延伸到强制批准。每个动作应根据可逆性和影响半径放在这个范围中的合适位置。把批准视为工具调用，并在 review 时展示证据，才能同时避免 permission fatigue 和盲目信任。*

---

## 要点

- **把人与 agent 的接口视为 harness 层**：人如何监督 agent，和 agent 如何行动一样值得投入工程精力。
- **同时避免两种失败模式**：询问太多会造成 permission fatigue，让人习惯性批准；询问太少则会造成盲目信任，使貌似合理的错误未经检查就被接受。
- **让交互方式与风险相称**：可逆的低风险动作可以静默执行；可观察、可逆的动作可以执行并报告；不可逆或高影响半径的动作必须先问，尤其是在 lethal-trifecta 边界上。
- **把批准表示为工具调用**：这样，批准过程就能够持久保存、重放和审计，并能与长运行任务的挂起和恢复机制配合。
- **展示证据，而不只展示结论**：无论一个人监督一个 agent 还是整个 fleet，要真正实现监督，都必须让 agent 的工作易于验证，也易于否决。
- **按风险排列 fleet review 的优先级**：失败的检查、敏感路径、policy hit、首次出现的动作和薄弱证据，应当优先于验证充分的低风险工作。

## 延伸阅读

- Erik Schluntz and Barry Zhang, *Building Effective Agents*, Anthropic, Dec 2024. https://www.anthropic.com/engineering/building-effective-agents
- Dex Horthy, *12-Factor Agents*（要素 7：用工具调用联系人类），HumanLayer, Apr 2025. https://www.humanlayer.dev/blog/12-factor-agents
- David Dworken and Oliver Weller-Davies, *Beyond Permission Prompts: Making Claude Code More Secure and Autonomous*, Anthropic, Oct 2025. https://www.anthropic.com/engineering/claude-code-sandboxing
- Saleema Amershi et al., *Guidelines for Human-AI Interaction*, CHI 2019. https://www.microsoft.com/en-us/research/publication/guidelines-for-human-ai-interaction/
- Eric Horvitz, *Principles of Mixed-Initiative User Interfaces*, CHI 1999. https://www.microsoft.com/en-us/research/publication/principles-of-mixed-initiative-user-interfaces/
- OpenAI, *Custom Code Review Rules for Codex*, Jul 2026. https://developers.openai.com/blog/custom-code-review-rules-for-codex
