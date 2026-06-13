# Agent Harness：实践者教材

*这是一份基于事实的 agent harness 工程综述，主要整理自 [Awesome Harness Engineering](https://github.com/walkinglabs/awesome-harness-engineering) 阅读列表和 OpenReview 综述论文 [Agent Harness Engineering: A Survey](https://openreview.net/pdf?id=3hXEPbG0dh)。正文中的每个关键论断都在相应位置给出行内引用。*

English version: [Agent Harness: A Practitioner's Textbook](../agent-harness/)

---

## 引言

这本书讨论的是语言模型真正被拿来做事时，围绕模型构建的那套系统。这套系统现在常被称为 *harness*。围绕如何构建它，业界已经形成了一套仍然年轻、但快速成熟的写作和实践体系。

这个领域的基本前提很简单。LangChain 的 Vivek Trivedy 将其概括为：“Agent = Model + Harness。**如果你不是模型，那你就是 harness。**”系统提示、工具、沙箱、记忆、子代理、控制流、评估基础设施，都是 harness 的一部分。OpenReview 上的综述论文进一步把这个观点收紧为系统工程命题：对长周期 agent 来说，可靠性的瓶颈可能在 harness，而不只是模型能力。本书讨论的，就是如何把这层系统设计好。

---

## 如何阅读本书

这是一个两卷本系列的第二卷。它假定读者已经掌握配套卷 [*LLM 基础：面向 Harness Engineering 的实践者教材*](../llm-foundations-zh/) 中讲解的模型基础知识——token、attention 与 KV-cache、context 窗口、采样、post-training、检索、agent 循环与 tool-call 协议、prompt injection，以及 pass@k 与 pass^k。本书在提到某个 Foundations 概念时，会指回原处（例如“见《LLM Foundations》第 9 章”），而不是重新推导。如果对这些术语还不熟悉，请先阅读那一卷。

各章是对 ETCLOVG 分类的一次完整叙述，可以从头读到尾。如果你带着特定目标而来：context 预算见第 2-3 章；工具与 MCP 见第 4 章；安全与沙箱见第 5 章；评估与迭代见第 9-11 章；生产清单见第 8 章。

---

## 章节

| 章节 | 标题 | 简介 |
|------|------|------|
| [前言](./00-preface.md) | 前言 | 本书的范围和写作目的 |
| [第 1 章](./01-what-is-an-agent-harness.md) | 什么是 Agent Harness？ | Model + Harness 公式、agent 循环、内外层 harness、ETCLOVG 分类与历史脉络 |
| [第 2 章](./02-context-as-finite-resource.md) | 上下文是一种有限资源 | Context rot、注意力预算、KV-cache、文件系统作为工作记忆 |
| [第 3 章](./03-compaction-memory-subagent.md) | 压缩、记忆与子代理模式 | 压缩、结构化笔记、反复复述、上下文防火墙 |
| [第 4 章](./04-tools-agent-computer-interface.md) | 工具与 Agent-Computer Interface | 工具设计、MCP、协议边界、命名空间、节省 token 的响应、代码执行作为元工具 |
| [第 5 章](./05-sandboxing-guardrails.md) | 沙箱、护栏与安全自治 | 安全威胁模型、沙箱作用、权限疲劳、governance、文件系统/网络隔离、hooks |
| [第 6 章](./06-agentic-workflow-patterns.md) | Agentic 工作流模式 | 五种组合式工作流、小代理模式 |
| [第 7 章](./07-long-running-agents.md) | 长运行代理与多上下文窗口任务 | 交接班问题、initializer + coding agent、managed agents、GAN 式架构 |
| [第 8 章](./08-twelve-factors.md) | 生产级 Agent 的十二要素 | HumanLayer 十二要素、状态 reducer、framework 到 platform 的迁移 |
| [第 9 章](./09-evaluation.md) | 评估 | Eval 结构、grader 类型、pass@k 与 pass^k、readiness validation、八步路线图 |
| [第 10 章](./10-infrastructure-noise.md) | 基础设施噪声 | 资源配置对 benchmark 分数的影响 |
| [第 11 章](./11-trace-driven-iteration.md) | 基于 Trace 的迭代与 Model-Harness 共同演化 | Trace 反馈回路、span telemetry、regression extraction、meta-harness、模型与 harness 的耦合 |
| [第 12 章](./12-outlook.md) | 展望 | 开放问题、跨层权衡与长期原则 |
| [参考文献](./references.md) | 参考文献 | 完整书目 |
| [术语表](./glossary.md) | 术语表 | 全书关键术语的简明定义 |

---

*大多数来源文章发表于 2025-2026 年。这个领域变化很快，阅读时请结合参考文献查看最新原文。*
