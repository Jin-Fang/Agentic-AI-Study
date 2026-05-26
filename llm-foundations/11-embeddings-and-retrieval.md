# Chapter 11: Embeddings and Retrieval

Retrieval augments a model with external information at runtime. Karpathy introduces retrieval-augmented generation as a way to bring relevant documents into context instead of relying only on model parameters ([Intro to LLMs, around 00:41:33](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2493s)). The foundational RAG paper combines a parametric seq2seq model with a non-parametric memory accessed through retrieval ([Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)).

For harness engineers, RAG is not a model feature. It is a harness pattern.

## Embeddings

An embedding model maps text into a vector space where semantically related texts tend to be near each other. A retrieval system embeds documents or chunks, embeds the query, and finds nearby vectors. This is useful when keyword search misses paraphrases or conceptual matches.

Embeddings are not magic. They can miss exact constraints, confuse near neighbors, or retrieve text that is topically similar but not actually relevant. Hybrid search, metadata filters, reranking, and domain-specific chunking often matter.

Karpathy's intro presents retrieval-augmented generation as an alternative to expecting all knowledge to live inside the model parameters ([Intro to LLMs, around 00:41:33](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2493s)). That distinction is central:

- **Parametric memory**: information compressed into weights during training.
- **Retrieved memory**: information fetched at runtime and placed into context.

Parametric memory is fast and broad but stale and hard to audit. Retrieved memory is slower and depends on infrastructure, but it can be current, private, permissioned, and citeable.

## The Basic RAG Pipeline

A practical RAG system usually has two phases.

Indexing:

1. Collect documents.
2. Split them into chunks.
3. Attach metadata such as source, owner, timestamp, permissions, and section title.
4. Compute embeddings.
5. Store chunks in a vector database or search index.

Query time:

1. Rewrite or classify the user query if needed.
2. Retrieve candidate chunks.
3. Filter by permissions and freshness.
4. Rerank candidates.
5. Insert selected evidence into the model context.
6. Ask the model to answer with citations.
7. Validate citations and optionally verify support.

Each step can fail. RAG quality is not only model quality.

## Chunking

Documents are too large to retrieve whole. They are split into chunks. Chunking determines what evidence the model sees.

Bad chunks create bad answers:

- Chunks that are too small lose context.
- Chunks that are too large waste tokens.
- Chunks that cross unrelated sections introduce noise.
- Chunks without metadata are hard to cite.
- Chunks without stable IDs are hard to audit.

Good chunks preserve semantic units: sections, paragraphs, API entries, tickets, code symbols, or policy clauses.

For code and harness engineering material, chunking should respect structure:

- one function or class with its docstring,
- one README section,
- one policy clause,
- one issue thread segment,
- one tool definition,
- one trace step,
- or one design decision record.

Splitting by fixed character count is easy but often wrong. It can separate a claim from its caveat, a function from its type definition, or an error message from the command that produced it.

## Retrieval Is a Precision-Recall Tradeoff

High recall retrieves more possibly relevant material. High precision retrieves less but cleaner material. LLM contexts make this tradeoff painful because extra text is not free. Irrelevant retrieved text can distract the model or introduce false alternatives.

Reranking helps. A first-stage retriever can collect candidates, and a reranker can score them more carefully against the query. The harness can also ask the model to inspect candidates, but that costs tokens and should be evaluated.

Good RAG harnesses often expose search as a tool rather than forcing one retrieval pass before generation. The model can ask a targeted follow-up query after seeing that the first evidence is insufficient. This is more agentic, but it requires guardrails: query limits, permission checks, and trace logging.

## RAG Is Not Just "Put More Text In"

Karpathy also discusses memory and computational tools near the RAG section of the intro ([Intro to LLMs, around 00:42:46](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2566s)). Retrieval is one kind of augmentation, but not every missing capability should be solved by retrieving documents.

Use:

- retrieval for knowledge,
- database queries for structured state,
- calculators or code for exact computation,
- browsers for live web pages,
- file tools for local repositories,
- and user confirmation for ambiguous intent.

Dumping every possible source into the context is usually worse than giving the model the right tool.

## Context Pollution

RAG can reduce hallucination, but it can also cause hallucination if irrelevant or untrusted text enters context. A retrieved document may be outdated, adversarial, duplicated, or inconsistent with policy. The model may treat it as evidence because it is present.

Harness controls:

- Attach source metadata and freshness dates.
- Filter by permissions before retrieval.
- Keep untrusted content clearly delimited.
- Require answers to cite supporting chunks.
- Prefer "not enough evidence" over forced answers.
- Evaluate retrieval and generation separately.

## RAG vs Fine-Tuning

Use retrieval when information is large, changing, private, or needs citation. Use fine-tuning when behavior or style must be internalized across many calls. Many systems need both: fine-tuned behavior plus retrieved knowledge.

The harness should own the retrieval path because it owns permissions, indexing, freshness, and auditability.

## Key Takeaways

- Embeddings turn text into vectors for semantic retrieval.
- RAG supplies external evidence at runtime, but retrieval quality controls answer quality.
- Chunking, metadata, reranking, and permissions are harness responsibilities.
- Retrieval reduces some hallucination modes while introducing context pollution risks.
