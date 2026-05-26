# Glossary

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

## Context Window

The maximum number of tokens a model can condition on in one call. It is input context, not durable memory.

## Embedding

A vector representation of text, code, images, or other data. Text embeddings are often used for semantic search and retrieval.

## Fine-Tuning

Additional training after pretraining. In LLM practice this may include supervised fine-tuning on demonstrations or preference-based optimization.

## Hallucination

Plausible generated text that is not supported by reality or by supplied evidence.

## Harness

The software system around a model: prompts, tools, retrieval, memory, state, permissions, execution, evaluation, and user interaction.

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

## Post-Training

Training after pretraining that shapes behavior, such as supervised fine-tuning, RLHF, DPO, or constitutional AI.

## Prompt Injection

A failure mode where untrusted content contains instruction-like text that influences the model in a way the harness did not intend.

## RAG

Retrieval-augmented generation. A harness retrieves external information and provides it to the model as context for generation.

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

## Token

The unit of text a model processes. Tokens may be words, subwords, punctuation, whitespace patterns, or byte-level pieces.

## Tool Call

A model output that the harness interprets as a request to run an external operation.

## Transformer

The neural network architecture underlying most modern LLMs, based on attention mechanisms rather than recurrence.
