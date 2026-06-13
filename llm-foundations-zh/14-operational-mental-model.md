# 第 14 章：操作性心智模型

只要把模型放进正确的心智框架里，harness engineering 就会清晰很多。LLM 不是数据库，不是 shell，不是浏览器，不是长期记忆系统，也不是独立自治的 worker。它是一个具备广泛习得能力（通过训练习得，而非运行时学习）的条件 token generator。Harness 把这个 generator 变成能工作的系统。

## Model-Harness Map

设计时可以使用下面这张责任映射：

| 需求 | 模型角色 | Harness 角色 |
|------|----------|--------------|
| 理解任务 | 解释提供的上下文 | 提供清晰指令和相关状态 |
| 使用事实 | 基于（harness）提供的 evidence 推理 | 检索、引用、刷新和验证来源 |
| 精确计算 | 提出方法或代码 | 执行工具并验证输出 |
| 跨轮记忆 | 消费摘要状态 | 在模型外部持久化状态 |
| 采取行动 | 输出拟议工具调用 | 授权、执行、记录和回滚 |
| 保持安全 | 遵循训练出的 policy | 强制权限和沙箱 |
| 提高可靠性 | 从示例泛化 | 运行 eval 和回归测试 |

模型是推理和生成组件。Harness 是运行环境。

## 能力是参差不齐的（jagged）

模型能力是参差不齐的，不是一个统一的旋钮。同一个能解出多步证明难题的模型，可能在紧挨着的一个极简单任务上失败：它能写出可运行的排序算法，却数错一个单词里的字母；能设计数据库 schema，却算错简单算术。这种「jagged」（参差）或 Swiss-cheese（瑞士奶酪）式的能力分布意味着，在某个任务上的能力，几乎说明不了它旁边有哪些漏洞。

实践结论：不要从「它在这件事上很强」外推到「它不会在那件事上失败」。要靠经验找出易失败的子任务（见[第 13 章](./13-evaluation-for-llm-behavior.md)），并给每一个加上 harness 控制——用工具做精确计数或算术、用 validator 校验格式、用 verification 步骤核实事实——而不是因为模型「看起来很能干」就信任它把整个任务做完。前面的章节点名了这些具体漏洞：tokenization 会破坏字符级和算术任务（见[第 2 章](./02-tokenization.md)），参数化记忆在常见事实和冷门事实上参差不齐（见[第 5 章](./05-training-data-and-scaling.md)）。

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

## 成本心智模型

成本在每一章都会出现；这一节把它收拢成一个模型，让一个 workflow 在上线前就能估出价钱。

先看单价。供应商对 input、output 和 reasoning token 按不同费率计费，而 output（包括 reasoning model 的隐藏 token）通常最贵——output token 还会回流成下一步的 input（见[第 6 章](./06-inference-and-sampling.md)），而一个 reasoning model 在吐出第一个可见词之前，可能先生成数千个隐藏 token（见[第 8 章](./08-prompting-and-in-context-learning.md)）。被缓存的前缀 token 单独计费：cache read 比新鲜 input 便宜得多，但写入 cache、以及因改动早期 token 而使其失效，都要按全价付费（见[第 9 章](./09-context-window-and-kv-cache.md)）。token 数量本身取决于 tokenization（见[第 2 章](./02-tokenization.md)）；而一旦引入 Mixture-of-Experts 和 deployment-optimal 部署，宣传的模型大小就不再能预测单 token 价格了（见[第 4 章](./04-transformer-attention.md)和[第 5 章](./05-training-data-and-scaling.md)）。

有了单价，就能估算 per-workflow 单位成本。对每次调用，把预期的 input、output 和 reasoning token 分别乘以各自费率，减去由 cache 服务的那部分，再乘以每个任务的调用次数。一个每轮都检索 8k token 上下文的 RAG 步骤，或一个不断重发增长 transcript 的 agent loop，即使每个回答都很短，也可能主导整个账单。

然后设上限并做路由。给每个任务或每个 session 设一个 token 预算，并决定超出时怎么办：从昂贵模型回退到便宜模型、改用能精确作答的工具（而不是花钱让模型推理），或者停下来请求人类介入。同一套路由——为难题挑 reasoning model——也应该为简单抽取挑小模型（见[第 6 章](./06-inference-and-sampling.md)）。降级路由是一项特性，不是失败：一条仍能完成任务的更便宜路径，胜过一条冲爆预算的昂贵路径。

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

有几个多模态的具体问题带有运营分量（图片如何变成 token，见[第 2 章](./02-tokenization.md)）：

- **Image token 要花钱，而分辨率决定 token 数量。** 模型会把一张大图 tile 成多个 patch，所以一张高分辨率截图的 token 成本可能是缩略图的好几倍。降采样能省预算，却引入「读不了小字」的盲点——细小字体、密集表格和微小的 UI 标签会糊掉。当需要精确文字时，应该把图片与 OCR 或 DOM/accessibility tree 配对，而不是让 vision 去读像素。
- **图片也是一个不可信输入槽。** 截图或上传的文档可能携带隐藏指令——嵌进图片里的文字、淡色或近似背景色的文字、或被精心构造成命令的 caption。这就是 multimodal prompt injection：对图片和音频内容要用和不可信文本一样的分隔与最小权限纪律，绝不让它授权工具调用。
- **音频和视频会增加延迟和成本开销。** 它们会展开成很长的 token 序列，而且在模型看到之前往往需要先做转写或抽帧，所以要为额外的往返预留预算，并考虑是否有更便宜的 representation（一份转写稿、几张关键帧）就能完成任务。

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
- 构建能对模型输出做 grounding（落地核实）、验证和约束的系统。
- 把 LLM 基础当作操作性知识，而不是学术背景。
