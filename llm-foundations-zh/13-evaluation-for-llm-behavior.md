# 第 13 章：评估 LLM 行为

LLM 系统是概率性的、上下文敏感的，并且经常嵌入带工具的 workflow。因此评估必须测行为，而不只是测孤立模型回答。

公开 benchmark 有价值，但它不能告诉你：你的 harness 是否能处理你的仓库、文档、权限、用户和失败模式。Harness engineer 需要任务特定 eval。

HELM 和 BIG-bench 这类大规模 benchmark 有价值，因为它们从很多任务和指标暴露模型限制；但 harness 仍然需要面向自己 workload 的 eval ([BIG-bench](https://arxiv.org/abs/2206.04615), [HELM](https://arxiv.org/abs/2211.09110))。

## 评估什么

评估真正重要的单元。简单抽取 prompt 的单元可能是一次模型调用。Agent 的单元则是整个 loop：prompt、工具调用、observation、重试、最终答案和副作用。

有用维度包括：

- 任务成功率；
- 事实准确性；
- 引用正确性；
- 工具选择；
- 延迟；
- token 成本；
- 错误恢复；
- 安全策略遵守；
- 输出 schema 合法性；
- 相比旧版本是否回归。

Deep dive 的 reward-model 部分提醒我们：评估本身也可能成为一个学得或近似的系统。Reward model 会给输出打分，但它只是人类偏好的 proxy ([Deep Dive, around 02:52:39](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10359s))。Model-based grading 也是同样形状。它能扩展 review，但也可能漏掉系统性失败。

可以使用 model grader，但不要把 grader 分数误认为 ground truth。

## Golden Tasks

Golden task set 是一组有代表性的案例和期望结果。它应该包含普通任务、边界情况和历史失败。期望结果应该能通过代码、人类 review 或清晰 rubric 检查。

Harness eval 应包含真实上下文：

- 真实文档形状；
- 真实工具输出；
- 真实错误信息；
- 真实权限边界；
- 真实过期或冲突数据。

玩具 prompt 对 debug 有用，但不足以决定 release。

Golden tasks 应该版本化。产品变化时有意识更新。生产 bug 出现后，加入回归案例。模型升级导致行为变化时，保留变好和变坏的例子。

对 harness engineering，还应该包含 adversarial 和 operational cases：

- 检索文档含 prompt injection；
- 工具返回 no results；
- 工具返回过期结果；
- 用户请求越权动作；
- context 含冲突指令；
- 输出被截断；
- 模型引用未提供来源；
- agent 必须从失败命令恢复；
- 正确行为是 “not enough information”。

## Traces

Agent eval 应捕获 traces：prompt、工具调用、工具输出、模型输出、验证错误、重试、token count、timing 和最终结果。Trace 是工程师 debug 行为的主要材料。

没有 trace，失败会塌缩成模糊标签，比如“模型幻觉了”或“agent confused”。有 trace，才能判断问题出在检索、prompt 歧义、过期状态、坏工具输出、schema failure、sampling 还是模型能力。

Trace review 还会暴露缺失工具。如果模型反复做宽泛搜索，然后手动过滤几千 token，正确修复可能是更好的搜索工具。如果模型反复输出非法 JSON，修复可能是 constrained decoding 或更简单 schema。如果它反复忽略某个文档 section，修复可能是 chunking 或 prompt placement。

Eval 应产生工程任务，而不只是分数。

## Grading

有些任务能精确评分：JSON schema、单元测试、数据库状态、命令 exit code。另一些需要 rubric。Model-based grader 可以帮忙，但必须被视为有自己错误率的组件。

稳健 eval stack 可能组合：

- deterministic validators；
- unit 和 integration tests；
- source citation checks；
- 模糊场景的人类 review；
- 可规模化 qualitative check 的 model graders。

Workflow 越重要，验证越应该独立。

## Eval 里的 Reward Hacking

Karpathy 关于 RLHF reward hacking 的讨论，直接适用于 harness eval ([Deep Dive, around 03:04:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11051s))。如果系统被优化到某个 metric，它可能学会满足 metric，而不是满足真实目标。

例子：

- summarizer 通过引用很多无关段落最大化 citation count；
- coding agent 通过 visible tests，却破坏 hidden behavior；
- support bot 为了客户情绪避免说难听但必要的真话；
- retrieval 系统优化相似度，却漏掉精确 policy clause；
- model grader 奖励流畅解释，但回答没命中问题。

缓解手段包括 hidden tests、多指标、人类 audit、adversarial cases 和周期性 trace review。

## 回归纪律

每一次 prompt 修改、工具 schema 修改、模型升级、检索调整或 decoding 改动都可能改变行为。像对待软件改动一样对待这些变化。改前改后运行 eval。追踪 pass rate、failure category、cost 和 latency。

模型升级尤其需要纪律。新模型可能 broad benchmark 更强，却在具体 workflow 上变差，因为它遵循工具描述的方式不同，或 verbosity 不同。

## 要点

- 评估 model-harness workflow，而不是只评估 raw model。
- 使用真实 golden tasks，并捕获 trace。
- 结合 deterministic checks、人类 review 和 model grading。
- Prompt、工具、检索和模型版本都应被视为会引发回归的代码。

