# 第 14 章：操作性心智模型

只要把模型放进正确的心智框架里，harness engineering 就会清晰很多。LLM 不是数据库，不是 shell，不是浏览器，不是长期记忆系统，也不是独立自治的 worker。它是一个具备广泛学习能力的条件 token generator。Harness 把这个 generator 变成能工作的系统。

## Model-Harness Map

设计时可以使用下面这张责任映射：

| 需求 | 模型角色 | Harness 角色 |
|------|----------|--------------|
| 理解任务 | 解释提供的上下文 | 提供清晰指令和相关状态 |
| 使用事实 | 基于 evidence 推理 | 检索、引用、刷新和验证来源 |
| 精确计算 | 提出方法或代码 | 执行工具并验证输出 |
| 跨轮记忆 | 消费摘要状态 | 在模型外部持久化状态 |
| 采取行动 | 输出拟议工具调用 | 授权、执行、记录和回滚 |
| 保持安全 | 遵循训练出的 policy | 强制权限和沙箱 |
| 提高可靠性 | 从示例泛化 | 运行 eval 和回归测试 |

模型是推理和生成组件。Harness 是运行环境。

## 从失败模式出发设计

每个 LLM 属性都对应一个 harness 控制：

- Token 限制意味着 context budgeting。
- 概率 decoding 意味着 validation 和 regression tests。
- 参数化知识意味着新鲜或私有事实需要 retrieval。
- 幻觉意味着 source discipline 和 verification。
- 长任务意味着外部状态和 compaction。
- 工具能力意味着 permission boundaries。
- 模型升级意味着 eval suites。

这就是从 LLM 基础走向 harness engineering 的实际桥梁。

## 讲座最后的实践建议

Karpathy 在 deep dive 结尾给出的实践建议很朴素：把这些系统当工具使用，但不要完全信任它们 ([Deep Dive, around 03:09:24](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11364s), [03:30:42](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=12642s))。这也应该是 harness engineer 的姿态。

模型有用，是因为它能压缩模式、解释语言、起草代码、转换文本、基于 evidence 推理和协调工具。模型不能盲信，是因为它会幻觉、误读上下文、过拟合 prompt、遵循注入指令、误用工具，或优化错误 proxy。

正确态度既不是否定，也不是崇拜，而是认真做系统设计。

## 多模态和 Agentic 扩展

同样的基础也可以扩展到多模态系统。Karpathy 描述音频和图片可以被 tokenized，或以其他方式送入模型的序列处理机制 ([Deep Dive, around 03:09:57](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11397s))。对 harness engineering 来说，截图、图片、音频、视频和文档都需要选择合适的 representation。

Browser agent 可能使用：

- screenshot pixels；
- OCR text；
- DOM trees；
- accessibility nodes；
- network logs；
- direct browser actions。

每种 representation 都有不同的优点和盲点。截图能显示视觉布局，但可能隐藏 DOM metadata。DOM tree 暴露结构，但可能看不到视觉遮挡。OCR 可能漏掉小字。Harness 应该按任务选择 representation，并进行评估。

Long-running agents 又增加一层。Karpathy 指向的是一种未来：agent 能随时间执行任务，人类则监督多个 agent ([Deep Dive, around 03:11:58](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11518s))。这个未来依赖的不只是一个聪明 prompt，而是持久基础设施：状态、工具、eval、权限、trace、checkpoint 和 human control surface。

## 好 Harness 让正确行为变容易

模型不应该需要从混乱上下文里推断一切。好的 harness 会缩小 action space，并在正确时间呈现正确信息。

它应该：

- 把持久状态放在文件、数据库或任务记录中；
- 给模型呈现紧凑、当前的 context；
- 暴露 affordance 清晰的工具；
- 验证结构化输出；
- 把不可信内容和指令分开；
- 记录 trace 方便 debug；
- 改 prompt、工具、模型或检索前运行 eval。

Harness 不只是 wrapper。它决定了一次流畅的模型调用，能否变成真正可工作的系统。

## Harness 决策 Checklist

设计 workflow 时，问：

- **Source of truth 是什么？** 如果不是模型，就检索或查询它。
- **什么必须精确？** 使用工具、validator 或测试。
- **什么可以近似？** 让模型起草、排序、总结或提出方案。
- **什么不可信？** 分隔它，阻止它控制工具。
- **什么需要持久？** 存在 prompt 外部。
- **什么昂贵？** 测量 token 和延迟成本。
- **什么会失败？** 加 eval case 和 trace。
- **什么需要批准？** 不可逆效果前加人类 checkpoint。

这份 checklist 把 LLM 基础转化为工程实践。

## 最该记住的一句话

如果只记住一句话，记住这一句：

**模型预测 token；harness 负责 context、状态、工具、权限、验证和后果。**

这句话也是配套 harness engineering 教材的基础。它解释了为什么 context engineering 重要，为什么工具设计重要，为什么 sandboxing 重要，以及为什么 eval 必须测完整 loop。

## 要点

- 把每项责任放在 model-harness 边界的正确一侧。
- 从模型属性推导 harness 控制。
- 构建能够 grounding、verification 和 constraint 的系统。
- 把 LLM 基础当作操作性知识，而不是学术背景。
