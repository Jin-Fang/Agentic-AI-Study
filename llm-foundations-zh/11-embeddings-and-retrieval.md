# 第 11 章：Embeddings 与 Retrieval

Retrieval 在运行时为模型补充外部信息。Karpathy 把 retrieval-augmented generation 介绍为一种办法：与其只依赖模型参数，不如把相关文档带进上下文 ([Intro to LLMs, around 00:41:33](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2493s))。RAG 的基础论文把参数化 seq2seq 模型和通过检索访问的非参数记忆结合起来 ([Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401))。

对 harness engineer 来说，RAG 不是模型特性，而是 harness pattern。

## Embeddings

Embedding model 把文本映射到向量空间，使语义相关的文本倾向于彼此接近。检索系统会嵌入文档或 chunk，再嵌入 query，并寻找相近向量。当 keyword search 漏掉改写或概念匹配时，embedding 很有用。

Embedding 并不神奇。它可能漏掉精确约束，混淆近邻，或者检索到主题相似但实际无关的文本。Hybrid search、metadata filter、reranking 和领域 chunking 通常都很重要。

Karpathy 的 intro 把 RAG 作为“不把所有知识都寄托在模型参数里”的替代方案 ([Intro to LLMs, around 00:41:33](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2493s))。这个区别很关键：

- **参数化记忆**：训练时压缩进权重的信息。
- **检索记忆**：运行时取回并放进 context 的信息。

参数化记忆快而广，但可能过期且难以审计。检索记忆更慢，也依赖基础设施，但它可以是当前的、私有的、权限化的、可引用的。

## 基本 RAG Pipeline

实际 RAG 系统通常分为两个阶段。

Indexing：

1. 收集文档。
2. 切成 chunks。
3. 附加 source、owner、timestamp、permissions、section title 等 metadata。
4. 计算 embeddings。
5. 存入 vector database 或 search index。

Query time：

1. 必要时重写或分类用户 query。
2. 检索候选 chunks。
3. 按权限和新鲜度过滤。
4. Rerank candidates。
5. 把选中 evidence 插入模型上下文。
6. 要求模型带引用回答。
7. 验证引用，必要时检查支持关系。

每一步都可能失败。RAG 的质量不只是模型质量。

## 检索评估

RAG 系统应该把 retrieval 和 generation 分开评估。否则每个失败都会被归因成“模型幻觉”，即使真正的问题是证据从未到达模型。

有用的 retrieval metrics 包括：

- **Recall@k**：需要的 chunk 是否出现在 top k 结果中。
- **Precision@k**：检索到的 chunks 有多少真的有用。
- **MRR 或 NDCG**：更好的 evidence 是否排在更前。
- **Citation support rate**：最终引用的 chunks 是否真的支持答案。
- **Answer faithfulness**：生成 claim 是否停留在检索 evidence 内。

指标应和 trace review 搭配。相似度分数高还不够；如果 retriever 漏掉精确 policy clause、版本约束、权限或否定句，系统仍然会失败。

## Chunking

文档通常太大，不能整体检索。它们会被切成 chunks。Chunking 决定模型最终看到什么 evidence。

坏 chunk 会制造坏答案：

- 太小会丢上下文；
- 太大会浪费 token；
- 跨无关段落会引入噪声；
- 没 metadata 难引用；
- 没稳定 ID 难审计。

好的 chunk 会保留语义单元：章节、段落、API 条目、ticket、代码符号或 policy clause。

对代码和 harness 工程材料，chunking 应尊重结构：

- 一个函数或类及其 docstring；
- 一个 README section；
- 一条 policy clause；
- 一段 issue thread；
- 一个工具定义；
- 一个 trace step；
- 一个设计决策记录。

按固定字符数切很容易，但往往错误。它可能把 claim 和 caveat 分开，把函数和类型定义分开，把错误信息和产生它的命令分开。

## Retrieval 是 Precision-Recall 取舍

高 recall 会检索更多可能相关的材料。高 precision 则检索更少但更干净的材料。LLM context 让这个取舍变得棘手，因为额外文本不是免费的。无关检索文本会干扰模型，或引入错误的替代说法。

Reranking 有帮助。第一阶段 retriever 可以收集候选，reranker 再根据 query 更仔细地打分。Harness 也可以让模型检查候选，但这会消耗 token，应该经过评估。

好的 RAG harness 往往把 search 暴露为工具，而不是在生成前强制做一次检索。模型看到第一批 evidence 不足后，可以提出更精准 query。这更 agentic，但需要 guardrails：query 限制、权限检查和 trace logging。

## RAG 不是“放更多文本进去”

Karpathy 在 RAG 附近也讨论了 memory 和 computational tools ([Intro to LLMs, around 00:42:46](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2566s))。Retrieval 是一种增强，但不是每个缺失能力都该靠检索文档解决。

应该使用：

- retrieval 处理知识；
- database query 处理结构化状态；
- calculator 或 code 处理精确计算；
- browser 处理 live web pages；
- file tools 处理本地仓库；
- user confirmation 处理模糊意图。

把所有可能来源都倒进 context，通常不如给模型合适的工具。

## Context Pollution

RAG 可以减少某些幻觉，也可能制造新的幻觉。如果无关或不可信文本进入 context，模型可能因为它出现在上下文里就把它当 evidence。检索文档可能过期、恶意、重复，或和 policy 矛盾。

Harness 控制包括：

- 附带 source metadata 和 freshness date；
- 检索前按权限过滤；
- 清楚分隔不可信内容；
- 要求回答引用支持 chunks；
- 优先允许 “not enough evidence”，而不是强迫答案；
- 分别评估 retrieval 和 generation。

## RAG vs Fine-Tuning

信息庞大、变化、私有或需要引用时，用 retrieval。行为或风格需要跨大量调用内化时，用 fine-tuning。许多系统两者都需要：fine-tuned behavior 加 retrieved knowledge。

Harness 应拥有 retrieval path，因为它拥有权限、索引、新鲜度和可审计性。

## 要点

- Embeddings 把文本变成向量，用于语义检索。
- RAG 在运行时提供外部 evidence，但检索质量控制回答质量。
- Chunking、metadata、reranking 和权限是 harness 责任。
- Retrieval 降低某些幻觉，同时引入 context pollution 风险。
