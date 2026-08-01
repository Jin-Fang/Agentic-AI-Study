# 第 11 章：Embeddings 与 Retrieval

Retrieval 在 inference 时为模型补充外部信息。Karpathy 把 retrieval-augmented generation（RAG）介绍为一种办法：与其只依赖模型参数，不如把相关文档带进 context（[Intro to LLMs, around 00:41:33](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2493s)）。RAG 的基础论文把参数化 sequence model 与通过 retrieval 访问的信息结合起来（[Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)）。

RAG 改变的是模型输入，而不是模型权重。因此，它是否有用取决于两个不同的问题：retrieval 是否找到了所需 evidence，以及模型是否正确使用了这些 evidence？

## 为什么需要 Retrieval

训练期间学到的信息被压缩在模型参数中。这类参数化知识覆盖面广，在生成时可以直接使用，但它反映的是训练数据；源文档发生变化并不会自动更新这些知识。

Retrieval 采用另一条路径。在 inference 时，系统搜索一个外部集合，选择相关 passage，并把它们放入模型有限的 context：

- **参数化知识**：间接表示在模型权重中的信息。
- **检索信息**：保留在权重之外，并作为某次调用的输入提供给模型的信息。

外部集合可以在不训练新 checkpoint 的情况下更新，检索到的 passage 也可以保留 source label 以供引用。不过，retrieval 并不保证选中的文本相关或真实；把 passage 放进 context，也不保证模型会忠实使用它。

## Retrieval Embeddings

*Embedding* 一词可以指彼此相关、但并不相同的表示：

- **Token embedding** 把一个 token ID 映射为进入 Transformer 的向量。后续各层会把这些初始向量变成与 context 和 position 有关的 hidden state。
- **Retrieval embedding** 把长度不定的 query 或 passage 映射为用于 similarity search 的定长向量。

两者不能互换。Retrieval model 的训练目标会让相关的 query-passage pair 倾向于获得相似向量。有些系统对两侧使用同一个 encoder，有些则使用不同的 query mode 和 document mode。因此，在 index time 与 query time 必须一致地使用该模型要求的 mode 和 preprocessing。

Dense retrieval 会比较 query vector 与已存储的 passage vector，常见分数是 cosine similarity 或 dot product。如果向量已经归一化，二者会产生相同的排序。高分表示它们按照该 embedding model 的表示彼此接近；这个分数并不是“passage 能回答 query”的校准概率。

让 query 与所有已存储向量逐一做精确比较，所需工作会随集合规模增长。HNSW、IVF 等 approximate nearest-neighbor（ANN）index 通过避免 exhaustive scan 来降低 search latency。由于采用近似搜索，它们可能漏掉 exact vector search 本会返回的向量。这种 index 层面的损失，不同于 retrieval model 把语义上无关的 passage 排在高位。

## Dense、Lexical 与 Hybrid Retrieval

三种常见 retrieval 方法强调不同的信号：

- **Dense retrieval** 按 learned retrieval embedding 之间的相似度给 passage 排序。即使 query 与 passage 共享的词很少，它也可能匹配改写和概念关系。
- **Lexical 或 sparse retrieval** 根据 term-based representation 给 passage 排序。例如，BM25 会使用 term frequency、inverse document frequency 和 document-length normalization。它奖励词项匹配，但属于 relevance-ranking function，并不像 `grep` 那样执行 exact string matching。
- **Hybrid retrieval** 结合 dense 与 lexical 结果，常见做法包括对分数归一化后加权，或融合两边的 rank。

Lexical retrieval 通常擅长稀有名称、identifier、error code 和 exact phrase。Dense retrieval 通常擅长寻找用不同措辞表达的同一概念。Hybrid retrieval 可以同时保留两类信号，但 fusion rule 仍需评估：不同 retriever 的 raw score 并不会天然可比。

第二阶段 reranker 可以对较小的 candidate set 做更仔细的评分，例如使用同时读取 query 与 passage 的 cross-encoder。Reranking 可以改进已有 candidate 的顺序和 precision，但无法找回第一阶段 retrieval 从未纳入的相关 passage。

## 最小 RAG Pipeline

最小 RAG pipeline 包含 indexing phase 与 query phase。

在 index time：

1. 收集构成 retrieval corpus 的文档。
2. 把每份文档切成可检索的 chunks。
3. 保留 source、title、section 等 provenance。
4. 为每个 chunk 计算 retrieval embedding。
5. 把 chunk text、vector 和 provenance 存入 search index。

在 query time：

1. 使用 retrieval model 的 query encoder 或 query mode 编码 query。
2. 通过 dense、lexical 或 hybrid retrieval 搜索排名靠前的 candidate chunks。
3. 可以选择用计算成本更高的 relevance model 对 candidates 做 rerank。
4. 选择能放进模型 context 的 passages，并将它们与 question 或 instruction 一起序列化。
5. 让模型基于这份扩充后的输入生成答案。

显式的 query embedding 步骤很重要：即使 index 本身工作正常，用不兼容的表示搜索 document vectors 也会降低 retrieval 质量。最终 prompt 可以保留 source label，让答案能够指回相应 passage；不过，引用是否获得支持、事实是否忠实，属于另外的评估问题，详见[第 10 章](./10-knowledge-hallucination-uncertainty.md)与[第 13 章](./13-evaluation-for-llm-behavior.md)。

## Chunking

整份文档往往太大，而且主题太宽，不适合作为 retrieval unit。Chunking 决定哪段文本共用一个 retrieval representation，也决定哪些 evidence 可以被独立选中。

Chunk size 带来几项取舍：

- Chunk 太小，可能会把 claim 与 explanation 或 caveat 分开。
- Chunk 太大，可能混合多个主题、弱化 embedding signal，并占用不必要的 context tokens。
- 忽略文档结构的边界，可能会在不合适的位置切断 paragraph、API entry 或 code function。
- 缺少 source 和 section 信息，会让检索出的文本更难解释或引用。

Structure-aware chunking 会尽量保留 section、paragraph、API entry 或 code symbol 等语义单元。Fixed-size window 实现简单，在文档结构不可靠时也可能有用。

相邻 chunks 之间的 overlap 可以保留跨越边界的信息。更多 overlap 也会扩大 index，并可能返回多个几乎相同的 passage，从而占用 result slot 和 context。因此，overlap 是一项可调取舍，并非越多越好。当重叠或重复 chunks 被一起检索出来时，deduplication 可以减少重复 evidence。

## 衡量 Retrieval

评估 retrieval 时，首先需要一组 queries 和 relevance judgments，用来标明每个 query 对应的有用 passages。不同指标回答不同的问题：

- **Recall@k** 是 top \(k\) 结果中出现的相关 passages 占全部相关 passages 的比例：\(|R_k \cap G| / |G|\)，其中 \(G\) 是 relevant set。当每个 query 只有一个必需 passage 时，通常也会把它报告为所有 queries 上的 top-\(k\) hit rate。
- **Precision@k** 是 top \(k\) 结果中的相关结果比例：\(|R_k \cap G| / k\)。
- **Mean Reciprocal Rank（MRR）** 对第一个相关结果所在 rank 的倒数取平均，因此强调尽早找到一个相关结果。
- **Normalized Discounted Cumulative Gain（NDCG）** 奖励把高度相关的结果排在前面，并且能处理分级而不只是二元的 relevance judgment。

这些 task metrics 不应与 **ANN recall** 混淆。ANN recall 比较 approximate index 返回的 neighbors 与 exact vector search 返回的 neighbors。一个 ANN index 可能拥有很高的 ANN recall，但 exact search 与 approximate search 返回的 passages 对用户任务都无关。反过来，如果被近似搜索漏掉的 exact neighbor 确实有用，降低 ANN recall 也会降低 task Recall@k。

如果没有清晰定义 retrieval unit 与 relevance，任何 metric 都没有明确含义。一个事实如果重复出现在多个 chunks 中，那么 chunk-level recall 和 precision 反映的情况，可能不同于系统是否找到了足以回答 query 的 evidence。

## Precision、Recall、Latency 与 Context Pollution

Precision 和 recall 是正式的 relevance measure，并不只是“少取一些”和“多取一些”的同义词。增大 \(k\) 通常会提高或保持 recall，因为系统考虑了更多 candidates；随着较弱的 candidates 进入结果集，precision 则可能下降。具体变化取决于 query set 与 ranking。

Retrieval 还受 latency budget 约束。在 generation 开始前，query encoding、index search、hybrid fusion 与 reranking 都会增加耗时。ANN search 可以降低 index latency，代价是可能损失一部分 ANN recall。更大的 candidate set 会给 reranker 更多找到相关 evidence 的机会，但也会增加 reranking 工作量。这些取舍应该一起测量，而不是孤立优化某一项 metric。

选中的 passages 还会占用 context。无关、过期、重复或彼此冲突的 passages 可能干扰模型，或引入缺乏支持的替代说法。这就是 **context pollution**：retrieval 可能提高 Recall@k，却同时让最终输入更难利用。因此，即使包含的 relevant chunks 更少，更小、更干净的结果集仍可能表现更好。

检索到的文本也可能包含 instruction 或 adversarial content。模型层面的 prompt-injection 问题在[第 8 章](./08-prompting-and-in-context-learning.md)讨论；与 query 相似，并不代表某段 passage 应被当作 instruction。

## RAG vs Fine-Tuning

Retrieval 和 fine-tuning 改变的是不同部分：

- 当任务依赖规模较大、独立于模型而变化的信息集合，或答案需要指向 source passage 时，使用 retrieval。
- 当目标是改变跨调用反复出现的 behavior、style 或 task convention 时，使用 [fine-tuning](./07-post-training.md)。

Fine-tuning 不是让持续变化的文档集合保持最新的可靠方法，而 retrieval 本身也不会教会模型一种新的稳定行为。一个系统可以同时使用两者：fine-tuning 塑造模型如何回应，retrieval 则为当前 query 提供信息。

## 配套教材边界

本章只讨论面向模型的 retrieval 机制。生产环境中的 index maintenance，以及如何把 retrieval 集成到更广泛的 agent workflow，属于配套教材 [*Agent Harness*](../agent-harness/README.md) 的范围。

## 要点

- Token embedding 是模型内部的 token representation；retrieval embedding 则表示用于 similarity search 的完整 query 或 passage。
- Dense retrieval 捕捉 learned semantic similarity，lexical retrieval 捕捉词项证据，hybrid retrieval 将两者结合。
- 最小 RAG 会同时嵌入 chunks 与 query、检索 candidates、可选地 rerank，并把选中的 passages 加入模型输入。
- Chunking 和 overlap 决定哪些内容可以被检索，以及会出现多少重复 context。
- Recall@k、Precision@k、MRR、NDCG、ANN recall、latency 与 context pollution 衡量 retrieval behavior 的不同部分。
- RAG 提供 query-time information；fine-tuning 改变反复出现的 model behavior。
