# 第 16 章：Computer-Use 与多模态 Agent

[第 4 章](./04-tools-agent-computer-interface.md)用定义良好的工具搭出 agent–computer interface：带 schema 的函数、MCP server、code API。有一类正在壮大的 agent 工作方式不同。它们不调用干净的 API，而是像人一样操作软件——看着屏幕移动光标、往字段里打字、点按钮。这些 *computer-use* agent，以及它们依赖的多模态感知，带来了 API-工具那几章没有的 harness 问题，而它们正是当下最有野心的通用 agent 所在的前沿。

### 16.1 越过 API：操作软件的 agent

动机是触达范围。大多数软件没有对 agent 友好的 API；它有一个为人造的 GUI。一个能看屏幕并据此行动的 agent，能用人能用的一切——老旧桌面应用、没有 API 的网站、永远不会有人去包成 MCP 的内部工具。Anthropic 的 computer-use 模型和 OpenAI 的 Computer-Using Agent 都走这条路：模型接收截图、对其推理、并发出像“在 (x, y) 点击”或“输入这个字符串”这样的底层动作 ([Anthropic — Computer use](https://www.anthropic.com/news/3-5-models-and-computer-use)；[OpenAI — Computer-Using Agent](https://openai.com/index/computer-using-agent/))。

这是一个和[第 1 章](./01-what-is-an-agent-harness.md)里那个截然不同的 agent loop。observation 是一张图，而不是工具结果；action 是一个 UI 手势，而不是函数调用；环境是整个操作系统或浏览器，而不是一套精挑的工具集。本书关于工具、context、安全说过的一切仍然适用，但每一项都带上了视觉的、更底层的性格。

### 16.2 环境就是工具面

在 ACI 那章，harness engineer *选择* 工具，能让它们少而高 affordance（第 4 章）。一个 computer-use agent 从环境继承它的动作面：屏幕上每个按钮、菜单、字段都是潜在目标。[第 4 章](./04-tools-agent-computer-interface.md)里那种谨慎的工具策展，不再以同样方式可用，因为“工具”就是应用恰好在视觉上暴露出来的任何东西。

这反转了一个关键杠杆。Harness 不再能通过提供更少工具来缩小动作空间；它必须帮 agent 准确 *感知* 动作空间，并约束 agent *被允许在哪里* 行动。设计工作从工具选择转向感知与划界——这正是接下来几节的主题。

### 16.3 屏幕的几种编码

屏幕可以用几种方式呈现给模型，而这个选择是一个带直接后果的 harness 决策——正是姊妹卷讲“图片变成 token”时所说的多模态要点（*LLM Foundations*，第 2 章）。主要编码：

- **截图像素**：保留视觉布局和样式，但 token 很重，且可能让小字模糊。模型必须用视觉去定位元素。
- **DOM 或 HTML**（网页）：保留精确文本和结构，却丢掉了真正可见的东西——隐藏的、屏幕外的、被视觉遮挡的元素看起来都一样。
- **Accessibility tree（可达性树）**：暴露一个为辅助技术构建的结构化、语义化视图：role、label、state，通常远比裸 DOM 紧凑。
- **OCR**：从像素里恢复文本，却丢掉了结构和空间关系。

没有一种是完整的。截图显示人所见，却不显示底层结构；DOM dump 显示结构，却不显示显著性。生产系统常常 *组合* 编码——用截图看布局，加 accessibility tree 或 DOM 拿精确目标——更稳健，但花更多 context。这和检索（第 2 章）是同一个精度对预算的张力，只是现在落在视觉域里。

### 16.4 Grounding：从“看见”到“点击”

computer-use agent 独有的最难问题是 *visual grounding（视觉接地）*：把一个意图（“点击 Submit 按钮”）翻译成一个具体动作（在特定坐标点击）。模型可以正确判断某个按钮该被按，却仍发出错误的像素位置。Grounding 错误是一种在 API 工具里没有对应物的失败模式——在 API 里，点名一个函数是精确的。

一个常见的 harness 技术是 *Set-of-Mark prompting*：在截图上给候选可交互元素叠加编号标记，让模型选择一个离散标签（“点击元素 7”），而不是产出裸坐标 ([Yang et al. — Set-of-Mark Prompting](https://arxiv.org/abs/2310.11441))。这把一个易错的连续 grounding 问题，转成一个更可靠的离散选择，代价是 harness 必须提供一个元素检测步骤。相关的 SeeAct 工作线表明，即使强视觉模型，也需要这类 grounding 脚手架才能在真实网页上可靠行动——感知和动作是可分离的，而它们之间的缝隙正是 harness 体现价值的地方 ([Zheng et al. — GPT-4V is a Generalist Web Agent](https://arxiv.org/abs/2401.01614))。

### 16.5 动作空间及其失败模式

Computer-use 动作是底层且有状态的，函数调用则不然。一次点击依赖屏幕处于模型以为的那个状态；一个加载慢了的页面、一个弹出的 modal、一个移位的布局，都可能让模型已经决定好的动作失效。因此 loop 必须在每个动作后重新观察——屏幕是新的 ground truth——并容忍 observation 和 action 会失去同步。

这让[第 7 章](./07-long-running-agents.md)的头号杠杆 self-verification 更加核心。行动后，agent 应在继续之前检查屏幕是否如预期改变。它也让恢复更难：撤销一个 GUI 动作很少像逆转一次 API 调用那样干净，所以[第 15 章](./15-human-agent-interaction.md)的与风险成比例的交互更要紧——一个即将确认不可逆对话框的 computer-use agent，正是人类 checkpoint 该在的地方。

### 16.6 延迟、成本与像素的 token 重量

Computer-use loop 的每个回合都往 context 里送一张图，而图在 token 上很贵——单张高分辨率截图可能和一页文字一样贵（*LLM Foundations*，第 2 章）。一个人要点三十下的任务，就是三十张截图穿过 context window，这和[第 2 章](./02-context-as-finite-resource.md)的有限上下文预算、以及 agentic 负载的 prefill 偏斜，相处得很糟。

Harness 杠杆还是那些熟悉的，只是更尖锐。把截图缩到任务能容忍的程度——但不能再多，因为缩小可能抹掉 agent 正需要读的那段文字。信息抽取后不要把旧截图留在 context 里；保留一条关于先前屏幕显示了什么的紧凑笔记，而不是像素（[第 3 章](./03-compaction-memory-subagent.md)“把没用的东西挡在外面”的纪律，对图片尤其适用）。能用结构化编码（accessibility tree）就别用像素，把昂贵的截图留给布局真正要紧的时候。

### 16.7 安全：全书最宽的攻击面

一个 computer-use agent 是 [lethal trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/)（第 5 章）最浓缩的形态。它读取不可信内容（屏幕上任何网页或文档）、常常能访问私有数据（浏览器或文件系统里打开的任何东西）、并能对外通信（它能导航、提交表单、发消息）。这里的 prompt injection 不是工具结果里假设的文本；它是渲染在 agent 正盯着的网页上的恶意指令，而模型可能把它读成命令。

防线就是[第 5 章](./05-sandboxing-guardrails.md)的 sandboxing 和 governance，只是因为动作面如此之宽而更严。把 agent 跑在隔离环境里——一个专用 VM 或容器，而不是用户的主 session。划定网络和文件系统访问。在不可逆或对外动作前要求人类批准（第 15 章）。并把屏幕上的一切都当不可信 data，绝不当指令——当“data”是一整张渲染好的网页时，[第 13 章](./13-system-prompts-and-instructions.md)的 instruction-hierarchy 纪律是承重的。

### 16.8 评估 computer-use agent

因为环境是一整个 OS 或浏览器，评估必须是环境式的，而非基于文本——[第 10 章](./10-evaluation.md)的 *outcome* 区分在这里不可回避，因为唯一要紧的是任务是否真的在环境中被完成。为此而造的真实 benchmark 提供了样板：WebArena 提供一个可自托管、真实的 web 环境，带基于执行的成功检查 ([WebArena](https://arxiv.org/abs/2307.13854))；OSWorld 把这个思路扩展到一个真实桌面操作系统上的开放式任务 ([OSWorld](https://arxiv.org/abs/2404.07972))。

这些 benchmark 的教训印证了全书：computer-use agent 在真实任务上远未饱和，而“模型能感知屏幕”和“agent 可靠完成任务”之间的差距，正是 harness 差距——grounding 脚手架、重新观察、恢复、划界、验证。一如既往，正确的 eval 是工作负载 eval（第 10 章）：一个公开 computer-use benchmark 是背景信号；agent 能否可靠地驱动 *你的* 应用，才是发布信号。

---

## 图：Computer-Use 循环

```mermaid
flowchart TD
    OBS["观察屏幕"] --> ENC{"编码？"}
    ENC -->|布局要紧| PIX["截图（像素）"]
    ENC -->|精确目标| AX["Accessibility tree / DOM"]
    PIX --> GROUND["Grounding：Set-of-Mark<br/>→ 离散元素选择"]
    AX --> GROUND
    GROUND --> ACT["发出底层动作<br/>（点击 / 输入 / 滚动）"]
    ACT --> SAFE{"不可逆 /<br/>对外？"}
    SAFE -->|是| HUMAN["人类批准（第 15 章）"]
    SAFE -->|否| REOBS["重新观察并自我验证<br/>屏幕是否如预期改变？"]
    HUMAN --> REOBS
    REOBS --> OBS

    SANDBOX["隔离 VM · 划界的网络/文件系统 · 屏幕=不可信 data（第 5、12 章）"] -.包裹每一步.-> OBS
```

*感知 → grounding → 行动 → 重新观察，包在一个 sandbox 里。Grounding 把“看见”变成“点击”；重新观察应对有状态的屏幕；sandbox 容纳全书最宽的攻击面。*

---

## 要点

- **Computer-use agent 用干净 API 换触达**：它们像人一样操作 GUI，因此能用没有 agent API 的软件——代价是更难的 loop。
- **环境就是动作面**：工具策展让位于感知与划界；harness 帮 agent 准确看见动作空间，并约束它能在哪里行动。
- **屏幕编码是 harness 选择**：像素、DOM、accessibility tree、OCR 各自保留不同的东西；组合更稳健但花 context。
- **Grounding 是独有的失败模式**：把意图翻译成正确点击很易错；像 Set-of-Mark 这样的离散技术比裸坐标更可靠。
- **最宽攻击面，最严 sandbox**：computer-use agent 是浓缩的 lethal trifecta——隔离它、划界它、给不可逆动作设闸，并把整个屏幕当不可信 data。

## 延伸阅读

- Anthropic, *Introducing computer use, a new Claude 3.5 Sonnet, and Claude 3.5 Haiku*, Oct 2024. https://www.anthropic.com/news/3-5-models-and-computer-use
- OpenAI, *Computer-Using Agent (Operator)*, Jan 2025. https://openai.com/index/computer-using-agent/
- Jianwei Yang et al., *Set-of-Mark Prompting Unleashes Extraordinary Visual Grounding in GPT-4V*, 2023. https://arxiv.org/abs/2310.11441
- Boyuan Zheng et al., *GPT-4V(ision) is a Generalist Web Agent, if Grounded* (SeeAct), 2024. https://arxiv.org/abs/2401.01614
- Shuyan Zhou et al., *WebArena: A Realistic Web Environment for Building Autonomous Agents*, 2023. https://arxiv.org/abs/2307.13854
- Tianbao Xie et al., *OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments*, 2024. https://arxiv.org/abs/2404.07972
