# 第 12 章：推理、工具与 Agent

LLM 可以生成类似推理的文本，但不能直接观察或改变世界。工具弥补这个缺口。工具让 harness 暴露搜索、文件读取、代码执行、数据库查询、浏览器动作或消息发送等操作。

Karpathy 的 intro 把 tool use 和 retrieval 作为增强模型能力的方式来讨论 ([Intro to LLMs, around 00:41:33](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2493s))。ReAct 这类研究系统展示了语言模型如何交替产生 reasoning trace、action 和 observation ([ReAct](https://arxiv.org/abs/2210.03629))。Toolformer 则探索了模型如何学习何时、如何调用 API ([Toolformer](https://arxiv.org/abs/2302.04761))。

## 工具使用是一种协议

模型不会自己调用工具。它输出一个调用表示。Harness 解析、验证、执行，然后返回 observation。这个协议定义了 agent loop：

1. Harness 发送任务上下文和可用工具。
2. 模型选择输出文本或工具调用。
3. Harness 验证并执行允许的调用。
4. Harness 返回 observation。
5. 循环继续，直到满足停止条件。

每一步都是设计表面。

Karpathy 用人类解题来说明这一点：人们面对任务时，不只是内部思考，也会用浏览器、计算器、笔记本、图像工具和其他辅助工具 ([Intro to LLMs, around 00:32:11](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1931s))。现代 assistant 也是如此。模型的 token generation 变成了外部能力的 controller。

所以“模型能浏览”只是简写。模型不能单独浏览。产品给它 browser-like tool，决定它能打开哪些页面，把 observation 转成 context，并处理失败。

## 工具沿不同轴扩展模型

不同工具补偿不同模型限制：

- **搜索/检索**补偿过期或缺失知识；
- **代码执行**补偿精确计算和可重复转换；
- **浏览器**补偿 live web interaction；
- **文件工具**补偿本地项目状态；
- **图像生成器**提供另一种生成模态；
- **视觉工具或多模态 encoder**提供视觉观察；
- **数据库**提供结构化 source-of-truth 状态。

Karpathy 的例子包括 browser-like lookup 和 image generation 作为语言模型周围的工具 ([Intro to LLMs, around 00:28:20](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1700s), [00:32:42](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1962s))。Harness 决定如何表示这些工具，以及何时信任工具输出。

## 推理 vs 行动

推理文本可以帮助模型规划、分解和跟踪状态。行动让模型获取新信息或改变外部状态。ReAct 的核心洞见是 reasoning 和 acting 会相互增强：thought 指导 action，observation 更新 thought。

复杂任务不能假设一次 final answer 就够。许多任务需要：

- 检查本地状态；
- 尝试命令；
- 阅读错误；
- 更新计划；
- 失败后重试；
- 验证结果。

Harness 让这个迭代过程成为可能。

这个循环必须足够可调试。如果 agent 失败，trace 应显示：

- 它以为自己在解决什么任务；
- 它形成了什么计划；
- 它选择了什么工具；
- 它传了什么参数；
- 它收到了什么 observation；
- 它如何更新计划；
- 它为什么停止。

没有 trace，工具型 agent 几乎无法系统改进。

## 工具设计很重要

坏工具会产生坏 agent。给模型几百个含糊工具，它就必须花上下文和概率质量理解每个工具。给模型少数高 affordance 工具，它通常更可靠。

好工具设计包括：

- 清楚名称；
- 精确描述；
- 简单 schema；
- 有用错误；
- 简洁输出；
- 权限边界；
- 适当的 idempotent dry-run 模式；
- 大 artifact 的稳定 handle。

工具输出应该告诉模型发生了什么变化，以及失败时下一步该怎么做。

工具描述还应教约束。例如 `search_docs` 应说明是搜标题还是全文，是否尊重权限，no results 意味着什么。`run_tests` 应说明运行全部测试还是子集，成功输出是否被压缩。`send_email` 如果有不可逆副作用，就应该要求确认。

好的工具 API 更接近产品 workflow，而不是裸 backend endpoint。很多时候，`schedule_meeting` 比 `list_users`、`list_calendars`、`create_event`、`send_invite` 这些低级工具更适合 agent，除非 agent 确实需要细粒度控制。

## 长运行 Agent

Deep dive 结尾，Karpathy 指向 long-running agents：能随着时间完成任务、由人类监督的系统 ([Deep Dive, around 03:11:58](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11518s))。长运行 agent 不是更长 prompt，而是需要持久状态和运行纪律。

长运行 harness 需要：

- task record；
- checkpoints；
- 可恢复工具状态；
- 跨步骤持续生效的权限；
- 清楚的人类 approval point；
- failure recovery；
- cost budget；
- final verification。

模型在调用之间可能是无状态的。Agent 不应该无状态。

## 安全与副作用

工具越强，harness 越需要严格。读取公开网页不同于删除生产数据库行。模型流畅性不能绕过授权。

控制包括：

- sandboxing；
- allow/deny lists；
- 危险动作需要人工批准；
- 网络和文件系统 scope；
- secrets isolation；
- audit logs；
- rollback strategies。

模型可以提出动作。Harness 必须决定什么被允许。

## 人工监督

未来 agent pattern 不一定是“没有人类”，更多时候是“人类以更高杠杆监督”。Harness 应让监督便宜且有意义：

- 总结 agent 已经做了什么；
- 暴露决策背后的 evidence；
- 不可逆动作前请求批准；
- 提供 rollback path；
- 明确说明 agent 何时不确定。

Human-in-the-loop 是 harness 设计的一部分，不是事后补丁。

## 要点

- 工具调用由 harness 协议中介。
- 推理和行动形成复杂任务的迭代 loop。
- 工具 schema、命名、输出大小和错误会塑造 agent 行为。
- 安全控制属于 harness，不能只靠模型意图。

