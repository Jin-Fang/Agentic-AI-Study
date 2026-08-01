# Chapter 11: Embeddings and Retrieval

Retrieval augments a model with external information at inference time. Karpathy introduces retrieval-augmented generation (RAG) as a way to bring relevant documents into context instead of relying only on model parameters ([Intro to LLMs, around 00:41:33](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2493s)). The foundational RAG paper combines a parametric sequence model with information accessed through retrieval ([Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)).

RAG changes the model's input, not its weights. Its usefulness therefore depends on two separate questions: did retrieval find the needed evidence, and did the model use that evidence correctly?

## Why Retrieval

Information learned during training is compressed into model parameters. This parametric knowledge is broad and immediately available during generation, but it reflects the training data and does not update simply because a source document changes.

Retrieval takes a different path. At inference time, a system searches an external collection, selects relevant passages, and includes them in the model's finite context:

- **Parametric knowledge** is represented indirectly in the model's weights.
- **Retrieved information** remains outside the weights and is supplied as input for a particular call.

The external collection can be updated without training a new checkpoint, and retrieved passages can retain source labels for citation. Retrieval does not guarantee that the selected text is relevant or true, however, and placing a passage in context does not guarantee that the model will use it faithfully.

## Retrieval Embeddings

The word *embedding* is used for related but distinct representations:

- A **token embedding** maps one token ID to the vector that enters a Transformer. Subsequent layers turn these initial vectors into contextual, position-dependent hidden states.
- A **retrieval embedding** maps a variable-length query or passage to a fixed-length vector intended for similarity search.

These are not interchangeable. A retrieval model is trained so that relevant query-passage pairs tend to receive similar vectors. Some systems use the same encoder for both sides; others use distinct query and document modes. The model's required mode and preprocessing must therefore be used consistently at indexing and query time.

Dense retrieval compares the query vector with stored passage vectors, commonly using cosine similarity or dot product. If vectors are normalized, cosine similarity and dot product produce the same ranking. A high score means closeness according to that embedding model; it is not a calibrated probability that the passage answers the query.

Comparing a query exactly with every stored vector costs work proportional to the collection size. Approximate nearest-neighbor (ANN) indexes such as HNSW and IVF reduce search latency by avoiding an exhaustive scan. Their approximation can omit vectors that an exact vector search would have returned. That index-level loss is distinct from a retrieval model ranking semantically irrelevant passages highly.

## Dense, Lexical, and Hybrid Retrieval

Three common retrieval approaches emphasize different signals:

- **Dense retrieval** ranks passages by similarity between learned retrieval embeddings. It can match paraphrases and conceptual relationships even when query and passage share few words.
- **Lexical or sparse retrieval** ranks passages from term-based representations. BM25, for example, uses term frequency, inverse document frequency, and document-length normalization. It rewards matching terms, but it is a relevance-ranking function rather than an exact string matcher like `grep`.
- **Hybrid retrieval** combines dense and lexical results, often by normalizing and weighting scores or by fusing ranks.

Lexical retrieval is often strong for rare names, identifiers, error codes, and exact phrases. Dense retrieval is often strong when the same idea is expressed with different wording. Hybrid retrieval can preserve both signals, but its fusion rule still needs evaluation: raw scores from different retrievers are not automatically comparable.

A second-stage reranker can score a small candidate set more carefully, perhaps with a cross-encoder that reads the query and passage together. Reranking can improve ordering and precision among the candidates it receives. It cannot recover a relevant passage that the first-stage retrieval never included.

## A Minimal RAG Pipeline

A minimal RAG pipeline has an indexing phase and a query phase.

At index time:

1. Collect the documents that form the retrieval corpus.
2. Split each document into retrievable chunks.
3. Retain provenance such as source, title, and section.
4. Compute a retrieval embedding for each chunk.
5. Store the chunk text, vector, and provenance in a search index.

At query time:

1. Encode the query with the retrieval model's query encoder or query mode.
2. Search for the top candidate chunks, using dense, lexical, or hybrid retrieval.
3. Optionally rerank the candidates with a more expensive relevance model.
4. Select passages that fit within the model's context and serialize them alongside the question or instruction.
5. Generate an answer conditioned on that augmented input.

The explicit query-embedding step matters: searching document vectors with an incompatible representation can degrade retrieval even when the index itself is functioning correctly. The final prompt may preserve source labels so the answer can refer back to the passages, but citation support and factual faithfulness are separate evaluation questions, discussed in [Chapter 10](./10-knowledge-hallucination-uncertainty.md) and [Chapter 13](./13-evaluation-for-llm-behavior.md).

## Chunking

Whole documents are often too large and too topically broad to serve as useful retrieval units. Chunking decides which span of text receives one retrieval representation and which evidence can be selected independently.

Chunk size creates several tradeoffs:

- Chunks that are too small may separate a claim from its explanation or caveat.
- Chunks that are too large may mix topics, weaken the embedding signal, and consume unnecessary context tokens.
- Boundaries that ignore document structure may split a paragraph, API entry, or code function at an unhelpful point.
- Missing source and section information makes a retrieved span harder to interpret or cite.

Structure-aware chunking tries to preserve semantic units such as sections, paragraphs, API entries, or code symbols. Fixed-size windows are simple and can still be useful, especially when document structure is unreliable.

Overlap between adjacent chunks can preserve information that crosses a boundary. More overlap also increases index size and can return several nearly identical passages, consuming result slots and context. Overlap is therefore a tunable tradeoff, not an automatic improvement. When overlapping or duplicate chunks are retrieved together, deduplication can reduce repeated evidence.

## Measuring Retrieval

Retrieval evaluation starts with a set of queries and relevance judgments identifying which passages are useful for each query. Different metrics answer different questions:

- **Recall@k** is the fraction of all relevant passages that appear in the top \(k\) results: \(|R_k \cap G| / |G|\), where \(G\) is the relevant set. When each query has one required passage, this is often reported as a top-\(k\) hit rate across queries.
- **Precision@k** is the fraction of the top \(k\) results that are relevant: \(|R_k \cap G| / k\).
- **Mean Reciprocal Rank (MRR)** averages the reciprocal rank of the first relevant result. It emphasizes finding one relevant result early.
- **Normalized Discounted Cumulative Gain (NDCG)** rewards placing highly relevant results near the top and supports graded, rather than only binary, relevance judgments.

These task metrics should not be confused with **ANN recall**, which compares an approximate index's neighbors with those returned by exact vector search. An ANN index can have high ANN recall while both exact and approximate searches return passages irrelevant to the user's task. Conversely, lowering ANN recall can reduce task Recall@k if the omitted exact neighbor was useful.

No metric is meaningful without a clear retrieval unit and relevance definition. If a fact is duplicated across many chunks, chunk-level recall and precision may tell a different story from whether the system found enough evidence to answer the query.

## Precision, Recall, Latency, and Context Pollution

Precision and recall are formal relevance measures, not simply synonyms for “retrieve less” and “retrieve more.” Increasing \(k\) often raises or preserves recall because more candidates are considered, while precision may fall as weaker candidates enter the result set. The exact behavior depends on the query set and ranking.

Retrieval also has a latency budget. Query encoding, index search, hybrid fusion, and reranking all add time before generation begins. ANN search can reduce index latency at the cost of some ANN recall. A larger candidate set gives a reranker more opportunities to find relevant evidence, but increases reranking work. These tradeoffs should be measured together rather than optimizing one metric in isolation.

The selected passages also consume context. Irrelevant, outdated, duplicated, or mutually conflicting passages can distract the model or introduce unsupported alternatives. This is **context pollution**: retrieval may improve Recall@k while making the final input harder to use. Smaller, cleaner result sets can therefore outperform larger ones even when they contain fewer relevant chunks.

Retrieved text can also contain instructions or adversarial content. That model-level prompt-injection problem is covered in [Chapter 8](./08-prompting-and-in-context-learning.md); similarity to a query does not establish that a passage should be treated as an instruction.

## RAG vs Fine-Tuning

Retrieval and fine-tuning change different things:

- Use retrieval when the task depends on a substantial information collection that changes independently of the model or when answers need to refer to source passages.
- Use [fine-tuning](./07-post-training.md) when the goal is to change recurring behavior, style, or task conventions across calls.

Fine-tuning is not a dependable way to keep a changing document collection current, and retrieval does not by itself teach a model a new stable behavior. A system can use both: fine-tuning shapes how the model responds, while retrieval supplies information for the current query.

## Companion Boundary

This chapter covers the model-facing mechanics of retrieval. Production index maintenance and the integration of retrieval into broader agent workflows belong to the companion [*Agent Harness*](../agent-harness/README.md).

## Key Takeaways

- Token embeddings are internal token representations; retrieval embeddings represent whole queries or passages for similarity search.
- Dense retrieval captures learned semantic similarity, lexical retrieval captures term evidence, and hybrid retrieval combines them.
- Minimal RAG embeds both chunks and the query, retrieves candidates, optionally reranks them, and adds selected passages to the model input.
- Chunking and overlap determine what can be retrieved and how much duplicate context appears.
- Recall@k, Precision@k, MRR, NDCG, ANN recall, latency, and context pollution measure different parts of retrieval behavior.
- RAG supplies query-time information; fine-tuning changes recurring model behavior.
