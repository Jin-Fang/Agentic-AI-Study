# Glossary

## Agent

A system that places model calls in a loop: the model may propose a tool call, an external system executes it, and the resulting observation becomes input to a later call. Execution, authorization, and persistent state remain outside the model.

## Attention / Self-Attention

The mechanism that lets each token position read other tokens' representations, weighted by relevance. Self-attention is how a Transformer mixes information across the sequence.

## Autoregressive Model

A model that generates a sequence one token at a time, conditioning each new token on previous tokens.

## Base Model

A model after large-scale pretraining but before assistant-oriented post-training. Base models are strong text completers but are not necessarily helpful assistants.

## Byte Pair Encoding

A subword tokenization method that builds a vocabulary by repeatedly merging frequent symbol pairs. It helps models handle rare and unseen words through smaller units.

## Chain-of-Thought

A prompting pattern in which the model generates intermediate reasoning text before an answer. It can improve some tasks, but the text is not guaranteed to be a faithful account of the computation that produced the answer.

## Chat Template

The serialization format that turns a chat conversation with roles such as system, user, assistant, and tool into the token sequence a model actually receives.

## Context Rot

An empirical degradation in how effectively a model uses information as a sequence grows. Its severity depends on the model, task, length, information position, and surrounding distractors.

## Context Window

The maximum sequence length a model can condition on during a call, usually shared by the prompt and tokens generated so far. It is a transient working sequence, not durable memory.

## DPO

Direct preference optimization. A post-training method that optimizes a model directly from preference data without a separately trained reward model.

## Embedding

A vector representation of text, code, images, or other data. Text embeddings are often used for semantic search and retrieval.

## Epistemic Abstention

A model response that declines to answer because the requested information is unknown or insufficiently supported. It is a learned behavior, not a guaranteed readout of the model's internal knowledge boundary.

## Fine-Tuning

Additional training after pretraining. In LLM practice this may include supervised fine-tuning on demonstrations or preference-based optimization.

## Grounding

Conditioning generation on external evidence and tying claims back to that evidence. Grounding changes the model's input; it does not update the model's parameters or guarantee faithful use of the evidence.

## Hallucination

Plausible generated text that is not supported by reality or by supplied evidence.

## Harness

The software system around a model. It owns responsibilities the model cannot provide by token generation alone, such as execution, persistent state, permissions, verification, and real-world consequences.

## Hybrid Search

Combining dense vector retrieval with lexical or sparse retrieval such as BM25. Literal or regular-expression search such as `grep` is a separate exact-text signal that may also be combined with them.

## In-Context Learning

The model's ability to adapt behavior based on instructions and examples in the prompt without changing its parameters.

## KV Cache

Cached key and value tensors used during Transformer inference to avoid recomputing previous context. It improves efficiency but is not semantic memory.

## Logits

Raw model scores for possible next tokens before conversion into probabilities.

## Next-Token Prediction

The training objective where the model learns to predict the next token from previous tokens.

## Parameters

Learned numerical weights of a model. They encode compressed statistical structure and behavior learned during training.

## pass@k

An evaluation metric: the fraction of problems solved by at least one of k sampled attempts. Higher k rewards models that can get there with more tries.

## pass^k

An evaluation metric: the fraction of problems for which all k sampled attempts succeed. It measures repeated reliability under the sampled conditions rather than the chance that at least one attempt works.

## Post-Training

Training after pretraining that shapes behavior, such as supervised fine-tuning, RLHF, DPO, or constitutional AI.

## Pretraining

Large-scale self-supervised next-token-prediction training over a broad text corpus that produces the base model. Every later stage (fine-tuning, post-training) builds on top of it.

## Prompt Injection

A failure mode where untrusted content contains instruction-like text that influences the model in a way the harness did not intend.

## Provider Prompt Caching

A provider-specific feature that reuses work for matching prompt prefixes across requests. It is distinct from the per-request KV cache and follows provider-specific matching, lifetime, and billing rules.

## RAG

Retrieval-augmented generation. An external retrieval step selects information and adds it to the model's input at inference time; the model weights do not change.

## Reasoning Model

A model post-trained to use additional test-time computation on difficult tasks, often with reinforcement learning on verifiable rewards. More reasoning tokens can improve some tasks but do not create missing facts or external evidence.

## Retrieval Embedding

A fixed-length vector representing a query or passage for similarity search. It differs from the per-token internal representations used inside a Transformer.

## Reward Hacking

Optimizing against an imperfect reward or grading signal in a way that improves the measured score without improving the real objective.

## Reward Model

A model trained to score candidate outputs according to preference data or another proxy objective. Reward models are useful but can be imperfect simulations of human judgment.

## RLHF

Reinforcement learning from human feedback. A post-training method that uses human preference data to steer model behavior.

## Safety Refusal

A learned response that declines a request because it falls into a category treated as unsafe or disallowed. It is distinct from epistemic abstention and is not an execution-layer guarantee.

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
