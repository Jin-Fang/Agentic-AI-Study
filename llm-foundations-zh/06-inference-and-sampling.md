# 第 6 章：Inference 与 Sampling

Inference 是训练好的模型被使用时发生的事情。给定上下文，模型会计算下一个 token 的概率分布。这个分布在归一化之前通常表示为 logits。系统随后选择一个 token，把它追加到上下文里，然后重复。

这就是为什么生成看起来是一词一词发生的。也是为什么生成对 decoding 设置敏感。

## Greedy Decoding 和 Sampling

最简单的策略是 greedy decoding：总是选择概率最高的下一个 token。Greedy decoding 稳定，但可能无聊、重复，或被局部选择困住。

Sampling 则从分布中抽样。Temperature 调整分布尖锐程度。低 temperature 让高概率 token 更占优势；高 temperature 给低概率 token 更多机会。Top-p，也叫 nucleus sampling，会选择累计概率超过阈值的最小 token 集合，然后在其中抽样；Holtzman 等人提出 nucleus sampling，是为了缓解神经文本生成中的重复退化问题 ([The Curious Case of Neural Text Degeneration](https://arxiv.org/abs/1904.09751))。

创意写作需要变化。代码修改、数据抽取、合规 workflow 或 eval 往往不希望变化。Harness 应该按任务明确设置 decoding 参数，而不是沿用默认值。

Karpathy 多次区分训练和 inference：神经网络训练好以后，inference 就是向前运行模型来产生预测 ([Deep Dive, around 00:26:12](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1572s))。普通 inference 不会更新参数。模型不是在权重更新意义上从用户消息中“学习”；它是在 context-window 意义上根据用户消息条件化。

这个区别会影响用户预期。模型可能因为当前对话还在上下文里而“记得”某件事，但这不等于它更新了参数或写入了长期记忆。

## 确定性不等于真实

确定性输出不一定正确。它只是同一模型、同一上下文、同一 decoding 设置和同一基础设施假设下可重复。反过来，非确定性输出也不一定坏。有些任务可以通过多个样本和选择器获得更好结果。

Harness engineer 应该区分：

- **稳定性**：相似输入下行为是否相似；
- **正确性**：输出是否满足任务；
- **校准**：表达出的信心和实际可靠性是否一致；
- **鲁棒性**：prompt 变化和边界情况是否能扛住。

Decoding 设置可以提升稳定性，但不能替代验证。

## 自回归循环

Inference 时的循环是：

1. 把对话和上下文序列化成 token。
2. 运行 Transformer。
3. 产生下一个 token 的 logits。
4. 应用 temperature、top-p、penalty 或 mask 等 decoding 控制。
5. 选择一个 token。
6. 追加到上下文。
7. 重复直到停止。

这解释了为什么输出长度重要。每个生成 token 都会成为下一步输入的一部分。长答案不仅输出 token 多，而且模型要反复执行 next-token loop。

对 harness 来说，这带来几个控制点：

- 下游只需要结构时，使用简洁输出 contract。
- 需要的 artifact 完成后立刻停止生成。
- 不要要求无用的隐藏 scratch work。
- 把长工作拆成工具支持的步骤，而不是要求一次性长答案。
- 精确循环交给代码执行，而不是让模型在文本里模拟多轮计算。

## 停止条件和输出合同

生成必须停止。它可能因为模型输出 end token、达到最大 token 限制，或匹配 stop sequence 而停止。糟糕的停止条件会造成隐蔽失败：截断 JSON、不完整代码、缺失引用或无尽 rambling。

Harness 中的输出 contract 应该明确：

- 下游要解析时使用 schema。
- 执行动作前验证结构化输出。
- 验证失败时带错误反馈重试。
- 最大输出 token 既要足够完成任务，也要控制成本。
- 除非 parser 足够强，不要让模型在同一 channel 同时输出长 prose 和严格机器 payload。

## Logit Bias、Mask 和工具选择

有些系统会直接修改下一个 token 分布。它们可能强制合法 JSON，mask 掉不可用工具名，把输出偏向少数 label，或约束生成符合某个 grammar。这些都是 harness 对 inference 的干预。

用得好，约束能减少非法输出。用得不好，约束会隐藏模型不确定性，或迫使模型在错误选项里选择。分类 harness 如果真实可能是“都不是”或“证据不足”，就应该提供这个选项。

工具调用系统通常结合 schema 约束和自然语言描述。模型仍然决定哪个工具调用最可能，但 harness 可以限制语法并验证结果。

## 延迟、吞吐和模型路由

Inference 成本取决于模型大小、prompt 长度、输出长度、batching、硬件和供应商实现。Demo 里很快的 harness，生产负载下可能很贵。

常用模式包括：

- 简单格式转换路由到小模型；
- 规划、歧义处理和复杂综合交给大模型；
- 缓存确定性的检索和预处理；
- 只有用户从部分文本中受益时才 stream；
- 内部 JSON 要完整解析时，不必流式输出给用户；
- 分别测量 p50、p95、p99 latency。

模型是分布式系统的一部分。Inference 参数应该被当成生产配置，而不是 notebook 装饰。

## 多样本与选择

有些 workflow 可以从多个样本和 grader 中获益。这对规划、测试生成、总结、重构方案等有多个合理路径的任务有帮助。但 pass@k 式提升可能掩盖操作成本。如果 harness 采样五个输出再评分，延迟和 token 成本可能乘以五。

只有在任务价值足以抵消成本，并且 grader 可靠时，才使用多样本策略。

## 要点

- Inference 反复预测并选择下一个 token。
- Temperature、top-p、max tokens 和 stop conditions 都是行为控制。
- 确定性提高可重复性，但不保证真实。
- Harness 应按 workflow 设置 decoding，并验证输出。

