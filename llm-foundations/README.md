# LLM Foundations for Harness Engineering

*A practitioner's textbook on the mechanisms and behavioral boundaries of large language models.*

A Chinese version is available at [LLM 基础](../llm-foundations-zh/).

---

## Why This Book Exists

Large language models are easy to call and difficult to reason about. A chat interface hides the mechanisms that shape their output: tokenization, next-token prediction, Transformer inference, decoding, post-training, and a finite context window. This book makes those mechanisms visible and explains the practical limits that follow from them.

This is not a machine learning theory course or a guide to training frontier models. It is a practical foundation for software engineers and technical readers who need to reason accurately about prompts, context, retrieval, sampling, tool calls, hallucination, and evaluation. When a topic crosses from model behavior into system design, the text marks that boundary and points to the companion [Agent Harness](../agent-harness/) volume.

The primary source material is Andrej Karpathy's two YouTube lectures:

- [Intro to Large Language Models](https://www.youtube.com/watch?v=zjkBMFhNj_g)
- [Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI)

The chapters also map back to lecture timestamps and cite foundational papers where they anchor specific concepts.

---

## Chapters

| Chapter | Title | Focus |
|---------|-------|-------|
| [Preface](./00-preface.md) | Preface | Scope, audience, source material, and the companion volume |
| [Chapter 1](./01-llm-as-token-machine.md) | The LLM as a Token Machine | Token probabilities, parameters, runtime, application, and external side effects |
| [Chapter 2](./02-tokenization.md) | Tokenization | Tokenizer training and encoding, subwords, budgets, chat templates, and character-level gaps |
| [Chapter 3](./03-next-token-prediction.md) | Next-Token Prediction | The pretraining objective, the training loop, loss, and why it produces broad capability |
| [Chapter 4](./04-transformer-attention.md) | Transformer and Attention | Decoder-only Transformers, self-attention, MLPs, distributed representations, and attention cost |
| [Chapter 5](./05-training-data-and-scaling.md) | Data and Scaling | Data construction, coverage, deduplication, scaling laws, compute tradeoffs, and contamination |
| [Chapter 6](./06-inference-and-sampling.md) | Inference and Sampling | Logits, temperature, top-p, the autoregressive loop, stopping, constrained decoding, and repeatability |
| [Chapter 7](./07-post-training.md) | Post-Training | SFT, learned interaction conventions, preference optimization, proxy rewards, RLVR, and PEFT |
| [Chapter 8](./08-prompting-and-in-context-learning.md) | Prompting and In-Context Learning | Instructions, examples, reasoning prompts, tool-use prompting, prompt injection, and prompting limits |
| [Chapter 9](./09-context-window-and-kv-cache.md) | Context Windows and KV Cache | Prefill and decode, KV-cache mechanics, provider caching, long-context reliability, and trust boundaries |
| [Chapter 10](./10-knowledge-hallucination-uncertainty.md) | Knowledge, Hallucination, and Uncertainty | Parametric knowledge, false-answer patterns, calibration, abstention, refusal, and citation-shaped hallucination |
| [Chapter 11](./11-embeddings-and-retrieval.md) | Embeddings and Retrieval | Retrieval embeddings, dense and lexical search, minimal RAG, chunking, retrieval metrics, and context pollution |
| [Chapter 12](./12-reasoning-tools-and-agents.md) | Reasoning, Tools, and Agents | Structured tool calls, the minimal agent loop, reasoning versus acting, and the model boundary |
| [Chapter 13](./13-evaluation-for-llm-behavior.md) | Evaluating LLM Behavior | Benchmarks, representative tasks, repeated trials, grading, proxy metrics, and the system boundary |
| [Chapter 14](./14-operational-mental-model.md) | The Operational Mental Model | A compact model-system responsibility boundary and guide to the companion volume |
| [Source Map](./source-map.md) | Source Map | Lecture timestamp map for the main concepts used in the book |
| [Glossary](./glossary.md) | Glossary | Key terms used throughout the book |
| [References](./references.md) | References | Source videos, papers, and supporting material |

---

## Reading Path

Read Chapters 1-7 to understand the model's mechanisms. Chapters 8-13 cover prompting, context, knowledge, retrieval, tools, and evaluation at the model boundary. Chapter 14 collects those limits into a compact responsibility map and points to the companion volume for system design.

If you are already building agents, the most immediately useful chapters are 2, 6, 8, 9, 10, 11, 12, 13, and 14.
