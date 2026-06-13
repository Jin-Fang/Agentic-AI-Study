# Glossary

## Agent

A model system driven by a harness that repeatedly calls tools, reads observations, and acts across turns to reach a goal. Distinct from single-shot token prediction: the model runs in a loop and its own outputs shape what it sees next.

## Attention / Self-Attention

The mechanism that lets each token position read other tokens' representations, weighted by relevance. Self-attention is how a Transformer mixes information across the sequence.

## Autoregressive Model

A model that generates a sequence one token at a time, conditioning each new token on previous tokens.

## Base Model

A model after large-scale pretraining but before assistant-oriented post-training. Base models are strong text completers but are not necessarily helpful assistants.

## Byte Pair Encoding

A subword tokenization method that builds a vocabulary by repeatedly merging frequent symbol pairs. It helps models handle rare and unseen words through smaller units.

## Chain-of-Thought

A prompting pattern where the model generates intermediate reasoning steps before an answer. It can improve some reasoning tasks, but production harnesses should control how intermediate reasoning is represented.

## Chat Template

The serialization format that turns a chat conversation with roles such as system, user, assistant, and tool into the token sequence a model actually receives.

## Compaction

Summarizing or compressing accumulated context to stay within the token budget. It frees room but rewrites the prefix, which works against prefix caching.

## Context Engineering

Deliberately deciding what enters the context and in what form (prompt, tool result, or retrieved passage) within the token budget.

## Context Rot

Degradation of the model's use of context as the input grows, both from sheer length and from accumulated irrelevant material crowding out what matters.

## Context Window

The maximum number of tokens a model can condition on in one call. It is input context, not durable memory.

## DPO

Direct preference optimization. A post-training method that optimizes a model directly from preference data without a separately trained reward model.

## Embedding

A vector representation of text, code, images, or other data. Text embeddings are often used for semantic search and retrieval.

## Fine-Tuning

Additional training after pretraining. In LLM practice this may include supervised fine-tuning on demonstrations or preference-based optimization.

## Grounding

Tying generated claims to provided evidence, so an answer can be traced back to the source passages the harness supplied.

## Hallucination

Plausible generated text that is not supported by reality or by supplied evidence.

## Harness

The software system around a model: prompts, tools, retrieval, memory, state, permissions, execution, evaluation, and user interaction.

## Hybrid Search

Combining lexical or exact retrieval (such as BM25 or grep) with vector retrieval, so results catch both keyword matches and semantic ones.

## In-Context Learning

The model's ability to adapt behavior based on instructions and examples in the prompt without changing its parameters.

## KV Cache

Cached key and value tensors used during Transformer inference to avoid recomputing previous context. It improves efficiency but is not semantic memory.

## Logits

Raw model scores for possible next tokens before conversion into probabilities.

## Mixture-of-Experts (MoE)

An architecture in which a router activates only a few expert sub-networks per token, so total parameter count can grow without a proportional rise in per-token compute. Active parameters predict per-token compute; total parameters still determine serving memory.

## Next-Token Prediction

The training objective where the model learns to predict the next token from previous tokens.

## Parameters

Learned numerical weights of a model. They encode compressed statistical structure and behavior learned during training.

## pass@k

An evaluation metric: the fraction of problems solved by at least one of k sampled attempts. Higher k rewards models that can get there with more tries.

## Post-Training

Training after pretraining that shapes behavior, such as supervised fine-tuning, RLHF, DPO, or constitutional AI.

## Pretraining

Large-scale self-supervised next-token-prediction training over a broad text corpus that produces the base model. Every later stage (fine-tuning, post-training) builds on top of it.

## Prompt Injection

A failure mode where untrusted content contains instruction-like text that influences the model in a way the harness did not intend.

## Quantization

Serving a model at lower numerical precision (for example 8-bit or 4-bit) to reduce memory and speed up inference, at some cost in fidelity. A precision change should be treated as a behavior change and re-evaluated.

## RAG

Retrieval-augmented generation. A harness retrieves external information and provides it to the model as context for generation.

## Reasoning Model

A model post-trained, often with reinforcement learning on verifiable rewards, to generate long internal reasoning before answering. Trades extra inference tokens (test-time compute) for better performance on hard tasks.

## Reward Hacking

Optimizing against an imperfect reward or grading signal in a way that improves the measured score without improving the real objective.

## Reward Model

A model trained to score candidate outputs according to preference data or another proxy objective. Reward models are useful but can be imperfect simulations of human judgment.

## RLHF

Reinforcement learning from human feedback. A post-training method that uses human preference data to steer model behavior.

## Sampling

Choosing output tokens from a probability distribution. Sampling settings such as temperature and top-p affect creativity, stability, and variance.

## SFT

Supervised fine-tuning. Training a model on examples of desired input-output behavior.

## Temperature

A decoding parameter that changes the sharpness of the next-token probability distribution. Lower temperature is more deterministic; higher temperature is more varied.

## Test-Time Compute

Spending more tokens, time, and money at inference to improve hard answers, as distinct from training-time scaling. Reasoning models are the most common example.

## Token

The unit of text a model processes. Tokens may be words, subwords, punctuation, whitespace patterns, or byte-level pieces.

## Tool Call

A model output that the harness interprets as a request to run an external operation.

## Top-p (Nucleus Sampling)

A decoding setting that samples from the smallest set of tokens whose cumulative probability crosses p. It trims the long tail of unlikely tokens while keeping the choice adaptive to how confident the model is.

## Transformer

The neural network architecture underlying most modern LLMs, based on attention mechanisms rather than recurrence.
