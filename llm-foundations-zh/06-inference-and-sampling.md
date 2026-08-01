# 第 6 章：Inference 与 Sampling

Inference（推理）是指使用训练好的模型计算输出，而不更新模型参数。给定 token 上下文，模型会为词表中的每个 token 产生一个分数，这个分数叫作 **logit**。Decoding（解码）规则把这些分数转化为一次 token 选择。被选中的 token 会追加到上下文中，然后重复这一过程。

本章沿着这条路径，从 logits 一直讲到完整序列的生成。

## Inference 计算什么

对于上下文 \(x_{1:t}\)，decoder-only Transformer 会产生下一个 token 的 logits 向量 \(z\)，词表中的每个 token 对应一个值。Logits 是相对分数，不是概率。Softmax 会把它们转化为概率分布：

```text
p_i = exp(z_i) / sum_j exp(z_j)
```

Logit 越高，概率也越高，但每个概率还取决于向量中的其他 logits。普通 inference 只通过已有参数执行前向计算；它不会运行反向传播，也不会更新 checkpoint。

上下文可以改变模型输出，却不改变模型参数。当前输入前面提到的事实可以影响下一个 token 的分布，因为模型会以该输入为条件。这样的临时条件化不同于把事实学习进权重，也不同于把它存入持久记忆。

## 从 Logits 到一个 Token

**Greedy decoding（贪心解码）**选择概率最高的 token。给定完全相同的 logits、变换和打破平局的规则，greedy decoding 会做出相同的下一 token 选择。不过，它仍可能产生重复或只在局部有吸引力的续写，因为每一步都会直接确定一个 token，而不会考虑所有可能的完整序列。

**Sampling（采样）**从概率分布中抽取 token，而不是总取最大值。Temperature（温度）通常按下面的方式改变分布：

```text
p_i(T) = softmax(z_i / T)
```

其中 \(T>0\)：

- `temperature=1` 时，logits 不会被重新缩放，因此 softmax 给出模型未经修改的下一 token 分布。
- `0 < temperature < 1` 时，分布变得更尖锐，高 logit token 获得更多概率。
- `temperature > 1` 时，分布变得更平坦，低 logit token 获得更多概率。
- `temperature=0` 在公式中没有定义，因为它会导致除以零。API 通常把它解释为 greedy 或 argmax decoding，但具体约定取决于供应商。

**Top-p sampling** 也叫 nucleus sampling（核采样）。它先按概率给 token 排序，保留累计概率至少达到 \(p\) 的最小集合，然后重新归一化并从这个集合中采样。Top-p 为 `1` 时通常不会移除任何 token；它本身不会让 decoding 变成 greedy。Nucleus sampling 的提出，是为了避免从不可靠的长尾中采样，同时保留随上下文变化的多样性（[The Curious Case of Neural Text Degeneration](https://arxiv.org/abs/1904.09751)）。

Temperature 和 top-p 经常结合使用，不过两者的具体应用顺序和边界行为取决于实现。随机性较低可以适合预期形式较窄的任务，而更宽的采样可以暴露不同续写。任何一种设置都不能决定内容是否正确。

## 自回归循环

生成是自回归的：每个被选中的 token 都会成为下一个 token 的上下文的一部分。简化后的过程如下：

1. 把输入上下文编码成 tokens。
2. 运行模型，得到下一个位置的 logits。
3. 应用已配置的 logit 变换或约束。
4. 通过 greedy decoding 或 sampling 选择一个 token。
5. 把选中的 token 追加到上下文。
6. 重复以上步骤，直到触发停止条件。

对输入执行的初始计算通常叫作 **prefill**。随后一次生成一个 token 的阶段叫作 **decode**。实现通常会在 decode 期间复用 KV cache，而不是重新计算之前所有 token 的 attention keys 和 values；[第 9 章](./09-context-window-and-kv-cache.md)会解释这一区别。

早期的 token 选择会改变上下文，因而改变此后的所有分布。这就是为什么两次采样生成可能在一个很小的初始差异之后显著分叉。

输出越长，需要的计算越多，因为每增加一个输出 token，就需要再执行一次 decode。原因不只是最终文本包含更多 token：只有先选择并追加 token \(t\)，才能生成 token \(t+1\)。

## 停止生成

生成可能因为以下几种原因停止：

- 模型发出 end-of-sequence token。
- 达到已配置的最大输出 token 数。
- 遇到已配置的 stop sequence。
- Serving API 因另一个有文档说明、且由供应商具体定义的原因结束生成。

许多 API 会返回一个 **finish reason**，用来区分正常停止、达到 token 上限或其他终止方式。字段名称和可能取值因供应商而异，因此必须按照相应 API 的约定来解释。

达到最大输出长度意味着序列可能被截断。即使一句话、代码块或结构化值尚未完成，最后几个字符看起来也可能很流畅。Stop sequence 同样是一个外部边界：根据 API 的不同，匹配到的序列可能不会出现在返回文本中。这两种情况本身都不能说明此前内容是否正确。

## Logit 变换与 Constrained Decoding

Decoding 可以在选择 token 之前改变或限制下一 token 分布，例如使用 logit bias、重复或频率 penalty，以及通过 mask 让非法 token 的概率实际上变为零。

**Constrained decoding（约束解码）**在每一步应用这类限制，使不断增长的 token 序列始终是某种 grammar、JSON schema、正则语言或固定 label 集合下的有效前缀。由于文本单位与 token 并不总是对齐，decoder 必须判断哪些 token 续写能够继续满足约束，而不能只逐个字符检查。

只要实现正确，这些方法可以保证输出属于所支持的句法语言。它们不能保证 JSON 值在事实上真实、代码具有预期行为，或若干强制 label 中一定存在充分的答案。约束还可能掩盖不确定性：即使没有合适选项，模型也可能被迫做出选择。

约束生成讨论的是哪些 token 序列可以被发出。如何解释生成出的动作描述，或是否执行外部动作，属于另一个边界，由[第 12 章](./12-reasoning-tools-and-agents.md)讨论。

## 随机性与可重复性

Sampling 使用伪随机状态，因此即使概率分布相同，多次运行也可能选择不同 token。如果 API 暴露 seed，固定 seed 可能提高可重复性，但相关保证取决于供应商，也可能依赖模型版本、后端和其他 decoding 设置。

Greedy decoding 消除了采样随机性，但 `temperature=0` 并不能保证所有托管请求都得到逐字节相同的响应。名义上相同的请求仍可能产生略有差异的 logits，因为 batching、浮点 kernel、硬件或 serving 软件都可能发生变化。如果领先的两个 token 几乎并列，一个很小的数值差异就可能改变 argmax；最初的差异随后又会改变整个自回归路径。

关键区别是：

- 对于完全相同的 logits 和确定性的平局处理规则，argmax 会选择相同 token。
- 在 API 边界上看起来相同的请求，并不保证在每一种 serving stack 上都产生完全相同的 logits。
- 使用 sampling 时，可重复性还取决于伪随机状态和采样实现。

最后，可重复不等于正确。Greedy decoder 可以稳定复现同一个错误答案，而 sampled decoder 可能一次给出正确答案，另一次给出错误答案。

## 多次完整采样

Inference 过程可以不只生成一个 completion，而是根据同一个输入生成 \(k\) 个完整样本。每个样本都沿着自己的自回归路径前进，因此这个集合可能呈现不同的措辞、方法或候选解。

当分布中存在多个合理续写时，多次采样会有帮助，但它本身不会指出哪个候选最好。生成 \(k\) 个候选通常也会消耗大约 \(k\) 倍的生成 token，除非 batching 或提前停止改变了实际工作量。如何给候选打分、如何报告 pass@k，以及 evaluator 是否可信，属于评测问题，由[第 13 章](./13-evaluation-for-llm-behavior.md)讨论。

## 要点

- Inference 把 token 上下文映射成下一 token 的 logits，而不更新模型参数。
- Greedy decoding 选择 argmax；sampling 从 temperature 和 top-p 等控制参数塑造的分布中抽样。
- `temperature=1` 不缩放 logits，而 `temperature=0` 是通常表示 greedy decoding 的 API 约定。
- 自回归生成每次追加一个被选中的 token，并在 end token、长度上限、stop sequence 或其他有文档说明的条件下停止。
- Constrained decoding 可以强制句法，但不能保证语义正确。
- 降低随机性可以提高可重复性，但确定性输出不一定正确，托管执行也仍可能变化。
- 多次完整采样以额外 inference 成本为代价，探索模型分布中的更多区域。
