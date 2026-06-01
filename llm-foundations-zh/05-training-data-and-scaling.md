# 第 5 章：数据与 Scaling

预训练质量取决于数据、模型规模和算力。Karpathy 的 deep dive 从数据收集和过滤讲起，把 web-scale dataset 作为现代 LLM 的实际底座 ([Deep Dive, around 00:01:28](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=88s))。对 harness engineer 来说，数据重要，是因为它既解释模型能力，也解释模型盲点。

## Web 数据并不中立

大型预训练语料包含网页、书籍、代码、论文、讨论、文档和许多其他文本来源。它们也包含重复内容、spam、低质量文本、过期事实、有毒内容、个人数据和分布偏差。数据 pipeline 会过滤、去重、分类和重新配比这些来源，但没有任何 pipeline 能产生完美的真理表示。

Karpathy 强调，dataset construction 是核心工作，不是附带细节。FineWeb 是一个公开的 web-scale 文本数据集例子，用来说明类似 Common Crawl 的原始网页数据在训练前必须经过大量处理 ([Deep Dive, around 00:01:28](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=88s))。原始网页不是干净的书，它包含菜单、cookie banner、重复模板、spam、抽取错误、样板噪声和多语言页面。

Dataset construction 通常包括：

- 从原始网页抽取文本；
- 过滤低质量或无关内容；
- 做语言分类；
- 去重重复文本；
- 去除或降低 spam 和 boilerplate；
- 按选择的比例混合不同来源；
- 把最终 corpus 转成 token。

每一步都是建模决策，都会影响模型后来把什么当成“正常”。

## 过滤就是嵌入数据的政策

Karpathy 以语言过滤为例：如果数据集主要面向英文，那么非英文内容就会被有意减少 ([Deep Dive, around 00:04:54](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=294s))。类似决策也会发生在成人内容、代码、数学文本、版权材料、论坛、社交媒体和技术文档上。

这意味着模型能力和行为会反映训练数据的 mixture：

- 法律、医疗、金融能力取决于高质量领域文本和 post-training 方式。
- 代码能力取决于代码数据的质量、语言分布和新鲜度。
- 多语言能力取决于语言覆盖和 tokenizer 效率。
- 安全行为取决于预训练分布，也取决于 refusal/preference 数据。

如果某个 workflow 很重要，不要根据模型名声推断可靠性。应该在这个 workflow 上测试。

## 去重和记忆

重复会影响训练。重复文本会获得不成比例的权重，使模型更可能记住或模仿它。去重能降低这种风险并提升数据效率，但去重并不完美。有些重复模板有用，有些只是噪声。

对 harness 来说，实际结论是：模型记忆并不均匀。模型可能知道某个流行库的旧 API，因为网上有许多副本；却不知道新 API，因为它出现得少或在训练 cutoff 之后。检索和本地检查才是正确控制手段。

## Scaling Laws

过去几年的经验事实是：更大的模型、更多数据和更多算力，通常会以可预测的方式改进模型。Kaplan 等人发现，loss 与模型大小、数据集大小和 compute 之间在很大范围内呈现 power-law 关系 ([Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361))。

后续工作进一步说明，compute-optimal training 需要平衡参数量和 token 数。Chinchilla 论文指出，许多早期大模型相对于其规模训练不足；在同等 compute 下，用更多数据训练较小模型，可能胜过更大的 undertrained model ([Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556))。

更稳妥地说，scaling law 描述的是 aggregate loss 和平均趋势。它不保证每个 benchmark、workflow 或能力都会平滑提升。有些看起来像 “emergent ability” 的跳变，可能部分来自 metric choice 或 thresholded scoring，而不是内部机制突然出现 ([Are Emergent Abilities of Large Language Models a Mirage?](https://arxiv.org/abs/2304.15004))。

这会直接影响模型选择。更大模型可能降低 pretraining loss，却仍然因为 post-training 行为、延迟、context 处理、工具调用、安全策略或数据新鲜度，在某个 workflow 上表现更差。Scaling 是强趋势，但不能替代任务特定 eval。

Harness 层面的结论很直接：模型选择不是简单的“越大越好”。一个较小但训练充分、post-training 好的模型，可能在某个 workflow 上胜过更大但工具行为差、指令遵循弱或延迟更高的模型。

## Compute 是操作性约束

训练产生参数，但每次使用模型时，inference 都会消耗 compute。Karpathy 在 deep dive 中用 GPU 例子让成本变得具体 ([Deep Dive, around 00:40:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=2411s))。对 harness 来说，成本不只是供应商账单问题，它会影响架构。

昂贵 inference 会鼓励：

- 更短 prompt；
- 简单子任务使用更小模型；
- 缓存稳定前缀或工具结果；
- 先检索再生成，而不是把所有文档倒进 prompt；
- 当验证已经足够时提前退出；
- 按任务难度在模型之间路由。

最好的 harness 往往不是“所有事情都调用最大模型”，而是把模型能力花在真正改变结果的地方。

## 量化与数值精度

[第 1 章](./01-llm-as-token-machine.md)用参数量乘以每参数字节数来估算模型大小。量化改变的就是第二个因子。模型可以不在 16 位精度下存储和计算权重，而是用 8 位、4 位甚至更低来提供服务，用一些数值精度换取更小的内存占用和更快的 inference。LLM.int8() 和 GPTQ 等方法表明，大模型可以在质量损失有限的情况下被量化 ([LLM.int8()](https://arxiv.org/abs/2208.07339), [GPTQ](https://arxiv.org/abs/2210.17323))。

对 harness engineer 来说，量化是一个运维杠杆，不是模型内部细节：

- 同一个模型在更低精度下更便宜、更快，但行为可能略有不同，尤其在边缘情况、长输出或精确格式上。
- 供应商可能悄悄量化。如果服务精度变了，一个模型可以在名字不变的情况下改变行为。
- 本地部署常常依赖量化，才能把模型塞进可用内存。

规则和任何模型变更一样：把精度变化当成行为变化，重新跑 eval（见[第 13 章](./13-evaluation-for-llm-behavior.md)）。量化模型通过你的 golden task 就没问题；不验证就假设它和全精度模型一致则不行。

## 数据新鲜度和训练 Cutoff

训练是阶段性的。模型先在某个时间点之前收集的 corpus 上训练，然后部署。Post-training 和 retrieval 可以补充行为和信息，但参数本身不会自动随世界更新。

这就是为什么模型可能知道 2020 年的论文，却不知道昨天更新的政策。也是为什么当前代码应该由本地 repo inspection 提供，而不是依赖模型记忆。任何处理变化事实的 harness 都需要新鲜度路径：检索、浏览器、数据库、文件读取或用户提供的证据。

## 数据分布塑造能力

模型最强的地方，是训练数据和 post-training 数据中出现过类似模式的地方。它在以下场景更弱：

- 需要训练 cutoff 之后的新信息；
- 需要私有或本地状态；
- 需要精确回忆冷门事实；
- 需要长链条精确计算；
- 需要在外部环境中行动；
- 需要公开数据里没有的领域政策。

这些都是 harness 的机会。检索提供新鲜和私有数据。工具执行精确计算。沙箱运行代码。Eval 衡量某个 model-harness 组合是否真的能处理目标领域。

## 污染和评估

Web-scale 数据会带来 benchmark contamination 风险。如果模型训练时见过测试样例，benchmark 结果会高估泛化。Harness engineer 在用公开 benchmark 选模型时要小心。私有的、任务特定的 eval 通常更有信息量。

这也影响 agent 设计。模型也许知道某个框架的公开形状，但不知道当前 repo 的本地惯例。Harness 应该检查真实 repo、运行真实测试、提供真实文件，而不是依赖参数化知识。

## 要点

- 训练数据是模型行为的主要决定因素之一。
- Scaling 会改进模型，但 compute、数据、参数和 post-training 相互影响。
- 公开模型知识不应被当成当前本地真理。
- Harness 用检索、工具、验证和领域 eval 弥补数据限制。
