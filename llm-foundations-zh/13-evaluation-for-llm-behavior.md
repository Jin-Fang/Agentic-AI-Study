# 第 13 章：评估 LLM 行为

LLM 行为具有概率性，并且依赖上下文。Prompt、chat template、decoding 配置或采样到的 token 路径发生变化，都可能改变结果。即使名义上相同的请求，也未必产生相同输出。因此，评估需要跨任务、跨 trial 积累证据；单个出色答案或单次失败都只是很弱的证据。

Eval 分数总是以一组设置为条件：model checkpoint 或服务版本、输入、decoding 配置、任务分布和 grader。它描述的是模型在这些条件下表现出的行为，而不是模型某种脱离上下文的内在属性。

## Benchmark 及其局限

公开 benchmark 测量的是特定的行为切片。MMLU 测试广泛的学术和专业知识，TruthfulQA 考察模型如何回答容易诱发常见错误观念的问题，HumanEval 和 MBPP 则通过可执行的 programming problems 测试代码生成 ([MMLU](https://arxiv.org/abs/2009.03300), [TruthfulQA](https://arxiv.org/abs/2109.07958), [HumanEval](https://arxiv.org/abs/2107.03374), [MBPP](https://arxiv.org/abs/2108.07732))。BIG-bench 和 HELM 展示了另一类更广泛的工作：跨许多任务和指标比较模型 ([BIG-bench](https://arxiv.org/abs/2206.04615), [HELM](https://arxiv.org/abs/2211.09110))。

这些分数是有用的比较信号，但适用范围有限。Benchmark 可能不同于真正关心的任务，可能过度强调某种格式，可能逐渐饱和，也可能受到训练数据污染。Prompting 和 decoding 选择同样会影响测得的结果。聚合分数提高，并不保证每个任务、语言或失败模式都得到改善。

需要使用工具或交互环境的 benchmark，测量的是模型与外围协议、系统的组合。它们可能很有价值，但分数不是对模型本身的单独测量。

## 代表性任务

Golden task set 是一组经过整理的输入和可检查的成功标准。它应该覆盖有代表性的普通案例、重要边界情况和已知历史失败。成功标准可以是精确答案、一组必要属性、可执行检查或清晰 rubric。Task set 应进行版本管理，以便把任务及期望结果的变化与模型行为变化区分开来。

玩具 prompt 对诊断有用，但不能证明模型在更广任务分布上的表现。Task set 应接近结果实际要被解释到的输入和输出要求。保留一部分 held-out tasks，也能降低反复迎合可见示例、却没有改善目标行为的风险。

### Capability Eval 与 Regression Eval

**Capability eval** 问的是：在明确的 prompting 和 decoding 设置下，模型能够完成哪些任务。它会有意包含尚不能稳定解决的任务，从而同时暴露已经展现的行为和继续改进的空间。它提供的是这些条件下能力被引出的证据，而不是模型在所有可能 prompt 下能做什么的完整证明。

**Regression eval** 问的是：更换模型、prompt 或 decoding 设置后，过去有效的行为是否仍然有效。当某个 capability task 变得持续可靠后，它也可以成为 regression case。两类 eval 可以使用相似机制，但回答的问题不同。

## 重复 Trial

由于行为会在不同运行之间变化，应报告 trial 数量、成功次数或成功率，并在需要比较时报告不确定性区间。10 次中成功 8 次仍是一个不确定性很大的估计；两种配置之间的小幅差异可能只是噪声。

两个常用汇总指标回答不同问题：

- **pass@k** 是 \(k\) 次尝试中至少有一次成功的概率。它适用于可以生成多个候选、并从中选出一个成功候选的场景。
- **pass^k** 是 \(k\) 次尝试全部成功的概率。它适用于同一任务必须反复成功的场景。

如果各次 trial 相互独立，并且每次成功概率都是 \(p\)，那么 pass@k 为 \(1-(1-p)^k\)，pass^k 为 \(p^k\)。现实中的 trial 可能相关，因此经验估计应说明任务和尝试是如何采样的。两个指标没有哪个天然“更诚实”；应该选择哪一个，取决于正在研究的行为契约。

应记录模型版本、完整输入、chat template、采样参数，以及 API 支持的 seed。固定 seed 可以减少一种变化来源，也有助于做成对的调试比较，但它不能保证 hosted inference 可复现。后端变化、数值非确定性和实现细节仍可能改变输出。如果目标是刻画行为波动，就应运行多次相互独立的 trial。

不要把每一次 pass/fail 翻转都称为 flaky eval。如果同一份已保存输出得到不同 verdict、validator 间歇性失败，或任务输入意外变化，那么不稳定的是测量设施或 grader，应该修复它。如果在声明的设置下，模型的多次输出确实在正确性上不同，那么 eval 发现的是不稳定的模型行为；重复试验应测量并报告它，而不是让它消失。

## Grading

不同输出需要不同 grader：

- **Deterministic 或 code-based grader** 使用精确匹配、结构化输出验证或可执行检查。它们速度快且可复现，但也可能拒绝合理变体，或只能检查很窄的属性。
- **Human grader** 可以对模糊或主观输出应用领域判断，但速度更慢；rubric 不充分时，不同评审者也可能意见不一。
- **Model-based grader** 可以大规模应用自然语言 rubric，但其 verdict 本身也是概率性的模型输出。

这些方法可以组合使用。对 deterministic check 真正能够确定的属性使用它，并用清晰标注的示例校准人工或模型判断。例如，citation 格式合法不能证明来源存在，而来源存在也不能证明它支持对应论断。

Grader 是目标质量的 proxy，而不是 ground truth。Post-training 中的 reward model 也有相同的基本限制：它近似的是偏好，而不是直接观察偏好 ([Deep Dive, around 02:52:39](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10359s))。Model grader 的模型、prompt、rubric 和分歧处理规则也都应该被记录。

## 作为 Proxy 的指标

当开发过程不断针对一个可见 metric 优化时，输出可能在 metric 上进步，却没有改善背后的真实目标。这就是[第 7 章](./07-post-training.md)讨论的 reward hacking 在 eval 中的对应现象 ([Deep Dive, around 03:04:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11051s))。

例如，summarizer 可能通过添加无关引用来提高 citation count；答案可能在保留事实错误的同时最大化 keyword overlap；model grader 也可能奖励精致冗长的表达，而不是正确性。Truthfulness、usefulness 或 clarity 之类的质量，都无法由单一 metric 完整规定。

应组合互补指标，使用平衡案例和 held-out cases，并定期人工检查 grader 意见不一致的样本。分数上升时，要检查新获奖励的行为是否真是该指标原本要代表的行为。

## Model Eval 的终点

Direct model eval 可以测量给定 context 下输出中可见的属性，例如 task accuracy、factuality、citation support，以及 format 或 schema validity。应保留输入、输出、配置和 grader 结果，使单项判断可以接受检查。

当成功依赖工具执行、错误恢复、权限、副作用或外部环境的最终状态时，评估单元就不再只是模型，而是 system eval。Agent transcript/trace、环境状态判分、运行可靠性和 release gate 属于外围系统；参见 [Agent Harness 第 11 章](../agent-harness-zh/11-evaluation.md)。

## 要点

- LLM 行为具有概率性并依赖上下文，因此 eval 结论需要代表性任务和重复 trial。
- 公开 benchmark 只能提供关于自身任务分布的有限证据，而不是普适模型排名。
- Capability eval 探索能够引出什么行为；regression eval 检查已经展现的行为是否仍然存在。
- pass@k 与 pass^k 回答不同问题，seed 不能保证 hosted inference 可复现。
- Deterministic、human 和 model grader 测量的都是 proxy，并各有不同失败模式。
- 对工具执行、权限、副作用或环境状态的评估属于 system evaluation，而不是 model-only evaluation。
