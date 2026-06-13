# LLM Foundations for Harness Engineering

*A practitioner's textbook on large language model fundamentals, written for engineers who build the systems around models.*

A Chinese version is available at [LLM 基础](../llm-foundations-zh/).

---

## Why This Book Exists

Harness engineering starts where a raw model stops. A model predicts tokens; a harness gives that model tools, memory, state, permissions, retrieval, evaluation, and a controlled path to real-world effects. To build that surrounding system well, engineers need an accurate mental model of what the model is and is not.

This book is not a machine learning theory course. It is a practical foundation for the engineer who needs to reason about prompts, context windows, retrieval, sampling, tool calls, hallucination, evaluation, and long-running agent behavior.

The primary source material is Andrej Karpathy's two YouTube lectures:

- [Intro to Large Language Models](https://www.youtube.com/watch?v=zjkBMFhNj_g)
- [Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI)

The chapters also map back to lecture timestamps and cite foundational papers where they anchor specific concepts.

---

## Chapters

| Chapter | Title | Focus |
|---------|-------|-------|
| [Preface](./00-preface.md) | Preface | Scope, audience, and relationship to harness engineering |
| [Chapter 1](./01-llm-as-token-machine.md) | The LLM as a Token Machine | Models as token-in/token-out systems; where the harness begins |
| [Chapter 2](./02-tokenization.md) | Tokenization | Text-to-token conversion, subwords, budgets, chat templates, and multimodal tokens |
| [Chapter 3](./03-next-token-prediction.md) | Next-Token Prediction | The pretraining objective, the training loop, loss, and why it produces broad capability |
| [Chapter 4](./04-transformer-attention.md) | Transformer and Attention | The engineering intuition behind embeddings, attention, MLPs, and layers |
| [Chapter 5](./05-training-data-and-scaling.md) | Data and Scaling | Web data, filtering, deduplication, scaling laws, quantization, and training cutoffs |
| [Chapter 6](./06-inference-and-sampling.md) | Inference and Sampling | Logits, temperature, top-p, stop conditions, streaming, latency, and model routing |
| [Chapter 7](./07-post-training.md) | Post-Training | SFT, RLHF, reward models, reward hacking, and assistant behavior |
| [Chapter 8](./08-prompting-and-in-context-learning.md) | Prompting and In-Context Learning | Instructions, few-shot, chain-of-thought, reasoning models, test-time compute, and prompt injection |
| [Chapter 9](./09-context-window-and-kv-cache.md) | Context Windows and KV Cache | Finite context, KV cache, working vs long-term memory, context rot, and context as a security boundary |
| [Chapter 10](./10-knowledge-hallucination-uncertainty.md) | Knowledge, Hallucination, and Uncertainty | Parametric knowledge, grounding, citation discipline, safety, and jailbreaks |
| [Chapter 11](./11-embeddings-and-retrieval.md) | Embeddings and Retrieval | Vector search, RAG, chunking, reranking, and context pollution |
| [Chapter 12](./12-reasoning-tools-and-agents.md) | Reasoning, Tools, and Agents | Tool-use protocols, the agent loop, long-running tasks, and human supervision |
| [Chapter 13](./13-evaluation-for-llm-behavior.md) | Evaluating LLM Behavior | Golden tasks, traces, grading, reward hacking, and regression discipline |
| [Chapter 14](./14-operational-mental-model.md) | The Operational Mental Model | A compact model-to-harness map for engineering decisions |
| [Source Map](./source-map.md) | Source Map | Lecture timestamp map for the main concepts used in the book |
| [Glossary](./glossary.md) | Glossary | Key terms used throughout the book |
| [References](./references.md) | References | Source videos, papers, and supporting material |

---

## Reading Path

Read Chapters 1-7 to understand what the model is. Read Chapters 8-14 to understand how this changes harness design.

If you are already building agents, the most immediately useful chapters are 2, 6, 8, 9, 10, 11, 12, 13, and 14.
