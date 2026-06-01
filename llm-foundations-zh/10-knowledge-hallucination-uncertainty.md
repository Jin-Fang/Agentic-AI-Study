# 第 10 章：知识、幻觉与不确定性

LLM 经常显得知识丰富，因为预训练把大量文本压缩进了模型参数。但参数化知识不是数据库：它可能过期、不完整、混合多个来源，或者直接错误。

Karpathy 在 intro 中把 hallucination 作为核心失败模式提出：模型可以生成流畅可信、但并不 grounded in reality 的文本 ([Intro to LLMs, around 00:10:04](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=604s))。对 harness 来说，幻觉不是神秘的人格缺陷，而是一个没有内置真理 oracle 的 next-token generator 在缺少 grounding 时产生的可预期结果。

## 幻觉为什么发生

模型优化目标是预测 token，post-training 又让输出更有帮助、更流畅。两者都不保证事实性。如果 context 要求引用但没有可用引用，模型仍可能继续生成看起来像引用的文本。如果 prompt 要求回答一个不存在答案的问题，模型可能推断出最像答案的文字。

幻觉风险在以下场景上升：

- 问题需要冷门或新鲜事实；
- prompt 暗示答案一定存在；
- 要求精确引用但没有提供来源；
- 检索上下文缺失或有噪声；
- 任务奖励流畅而不是验证；
- 模型没有工具检查现实。

Karpathy 的例子说明，模型可以在缺少可靠知识时继续生成 answer-shaped text ([Intro to LLMs, around 00:10:04](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=604s))。流畅输出不是事实存在的证据，只是文本在模型分布和当前 prompt 下看起来合理。

这对 harness 很重要，因为 harness 常要求模型生成看起来权威的产物：引用、代码、changelog、诊断、政策解释、测试计划或数据库说明。流畅性很容易掩盖 grounding 的缺失。

## 模仿性错误

有些错误答案不是随机编造。模型可能模仿常见人类误解、过期说法、迷思或互联网上的错误模式，因为这些模式存在于训练分布中。TruthfulQA 就是为了衡量这种失败：模型是否给出真实回答，而不是模仿貌似合理的人类错误 ([TruthfulQA](https://arxiv.org/abs/2109.07958))。

这也是为什么“模型看过很多文本”还不够。更大规模可能让模型更擅长模仿数据分布，包括其中错误的部分。只要真相重要，就需要 post-training、retrieval 和显式 truthfulness evaluation。

## 不确定性不总是校准的

模型表达信心的能力不稳定。它可能正确时犹豫，错误时自信。校准会随领域、模型、prompt 和 post-training 变化。

一些研究显示，模型可以在一定程度上预测自己是否知道答案，但这种能力不会完美泛化到所有任务和 prompt ([Language Models Mostly Know What They Know](https://arxiv.org/abs/2207.05221))。因此，自报信心只能当成弱信号，不能当成验证。

不要只依赖自报信心。Harness 应把不确定性控制内置进 workflow：

- 要求模型引用提供的 evidence；
- 当来源不支持答案时必须说 “not found”；
- 对事实使用检索或工具；
- 对高风险输出运行独立验证；
- 比较多个来源；
- 记录每个答案使用了哪些 evidence。

模型也会被用户 framing 带偏。如果用户问“为什么 X 发生了？”，模型可能解释 X，即使 X 未被证明发生。更好的 harness 会重构任务：

```text
Task: Determine whether X happened. If not supported, say so.
Evidence: ...
```

这个小变化会把 continuation 从解释转向验证。

## Grounding

Grounding 是把生成绑定到提供的 evidence 或外部状态上。[RAG](./11-embeddings-and-retrieval.md) 是一种 grounding 模式，工具使用也是。代码执行工具可以 ground 算术。浏览器可以 ground 当前网页事实。数据库查询可以 ground 账户状态。

Grounding 不意味着模型不会幻觉。它意味着 harness 给模型更好的证据，并且可以验证输出是否由证据支持。

Grounding 质量取决于整条链：

1. 正确来源是否可用？
2. 用户是否有权访问？
3. 检索是否找到相关部分？
4. 相关部分是否清楚进入上下文？
5. 模型是否引用了正确 evidence？
6. 答案是否停留在 evidence 支持范围内？

任何一步失败都可能看起来像“模型幻觉”。但修复点可能是检索、权限、chunking、prompt 结构或引用验证。

## 幻觉 vs 工具错误

工具进入系统后，事实错误也可能来自模型外部。Search API 可能返回过期结果。数据库查询可能使用错误 tenant。浏览器可能没加载动态内容。文件读取可能读错 branch。模型随后只是总结了错误 observation。

Harness 应区分：

- 模型编造了无来源内容；
- 检索返回无关内容；
- 工具输出本身错误；
- context 没包含需要的来源；
- 来源本身错误；
- 最终答案没有正确引用来源。

Trace log 是实际区分这些情况时最可靠的办法。

## Safety、Refusal 和 Jailbreak

幻觉是真实性失败。Jailbreak 是行为控制失败。Karpathy 展示 jailbreak 例子，说明 safety behavior 可以被上下文扰乱 ([Intro to LLMs, around 00:46:16](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2776s))。对 harness engineer 来说，这意味着安全不能只靠模型拒绝不安全文本。

应该使用分层控制：

- 工具访问前先分类请求；
- 按 policy 限制危险工具；
- 不可逆动作需要确认；
- secrets 不进入 prompt context；
- 清理不可信文档；
- 记录 refusal 和 override 事件。

模型拒绝行为是一层，不是整个安全系统。

## 引用纪律

引用应该指向系统实际使用过的来源。如果模型编造 source title，答案会比没有引用更糟，因为它创造了虚假的可审计性。

Harness 可以强制 source discipline：

- 检索文档时附带稳定 ID；
- 传入 snippet 和 source metadata；
- 要求答案只引用这些 ID；
- 验证被引用 ID 存在；
- 可选地检查被引用 snippet 是否真的支持对应说法。

这会把引用从写作风格变成系统合同。

## 要点

- 参数化知识是压缩且会犯错的。
- 幻觉是缺少足够 grounding 时的合理 continuation。
- 自报信心不是可靠 verifier。
- Harness 应 grounding、引用、验证，并允许 “not found”。
