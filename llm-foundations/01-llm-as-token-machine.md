# Chapter 1: The LLM as a Token Machine

The most useful first approximation is simple: a large language model is a system that receives a sequence of tokens and predicts a continuation. It does not directly see words, files, websites, test suites, databases, or users. It sees tokens that encode some representation of those things, and it produces more tokens.

Karpathy's short introduction begins with a deliberately demystifying frame: a trained model can be thought of as two files, one containing parameters and one containing code that knows how to run those parameters ([Intro to LLMs, around 00:00:24](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=24s)). That statement is not a complete implementation manual, but it is a powerful corrective. The model is not an agent by itself. It is a function-like component that maps token context to token probabilities.

## Parameters Are Compressed Behavior

The parameter file contains billions or trillions of learned numbers. During pretraining, those numbers are adjusted so that the model becomes better at predicting missing or next tokens in enormous text corpora. After post-training, the same parameter file also encodes assistant-like behavior: following instructions, refusing some requests, formatting answers, and preferring helpful responses.

The model's knowledge is therefore not stored as rows in a database. It is distributed across weights. This matters for harness design. If a system needs a current policy, an exact invoice, a user's private document, or a source citation, the harness should retrieve or provide that information. The model can reason over supplied material, but it should not be used as the source of truth for mutable or high-stakes facts.

Karpathy makes the parameter file concrete by talking about ordinary files on a filesystem: a parameter file can be copied, downloaded, or loaded by runtime code ([Intro to LLMs, around 00:01:35](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=95s)). The size of that file is roughly determined by the number of parameters and the numerical precision used to store them. A 70-billion-parameter model stored at two bytes per parameter is already on the order of 140 GB before considering runtime overhead. That is not a metaphor. It is an engineering artifact.

This framing helps separate four things that are often blurred together:

- **Model architecture**: the shape of the computation, such as a Transformer.
- **Parameters**: the learned numbers that specialize that architecture.
- **Runtime**: the code that loads parameters and performs inference.
- **Product**: the larger application, chat UI, tool system, memory layer, safety layer, and deployment infrastructure.

Two systems may share a model architecture but have different parameters. Two products may use the same parameter file but expose different capabilities because one has tools, retrieval, or memory and the other does not.

## The Model Has No Native Side Effects

A raw language model does not execute code, send email, open a browser, modify a repository, or remember the next conversation. It only emits tokens. Side effects appear when a surrounding system interprets those tokens as actions. This is the central boundary between model and harness.

For example, a model may emit:

```text
{"tool": "read_file", "path": "/repo/README.md"}
```

Nothing has happened yet. A harness must parse that output, decide whether the call is allowed, execute the file read, capture the result, and feed some representation of that result back into the model. The model proposes; the harness disposes.

This is why harness engineering is not prompt engineering with a bigger name. The harness owns execution, state, permissions, observation, retry, compaction, retrieval, and evaluation.

## Training Produces the Parameters

The runtime code can run inference once the parameters exist. It does not explain where the parameters came from. The parameters are produced by training: a large optimization process over data, compute, and time. Karpathy contrasts the relatively ordinary act of running a model with the expensive act of creating its parameters, which can require large GPU clusters and long training runs ([Intro to LLMs, around 00:03:59](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=239s), [00:05:16](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=316s)).

This matters operationally because most harness engineers are not training the base model. They are consuming a finished artifact through an API, local runtime, or inference provider. Their leverage is therefore different:

- They choose the model and provider.
- They shape prompts and context.
- They provide tools and retrieval.
- They constrain side effects.
- They evaluate behavior.
- They decide when a model change is safe to ship.

Fine-tuning sits between base-model training and harnessing. It can change the parameters, but it is still not the same as giving the model external state or authority.

## Text Interface, System Behavior

The user experiences a model as a text box. Karpathy's deep dive starts with this exact question: what is behind the text box, and what are the generated words really doing ([Deep Dive, around 00:00:28](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=28s))? For a harness engineer, the answer is: a probabilistic text interface wrapped by software.

The probabilistic part explains why small prompt changes can matter, why outputs vary, and why deterministic-looking behavior may still fail under distribution shift. The software wrapper explains why some products can browse, cite sources, operate computers, keep long-term notes, or run tests while other products using similar base models cannot.

The same text box can hide very different systems:

- A raw completion model receiving a plain prefix.
- A chat model receiving a serialized conversation with system, user, and assistant roles.
- A retrieval system that injects documents before the model sees the request.
- An agent loop that lets the model call tools and observe results.
- A multimodal model that converts images or audio into tokens or token-like representations before generation.

From the outside, all of these may look like "ask the model." From the harness perspective, they are different runtime systems with different failure modes.

## Model Output Is Not Product Behavior

It is useful to reserve the word *behavior* for the whole system. The model outputs tokens. The product decides what those tokens mean.

For example, a model may output a Markdown link. A chat application may render it. A browser automation harness may click it. A security layer may block it. An eval harness may mark it wrong because the URL was not supported by sources. Each product-level result depends on code outside the model.

This distinction prevents two common mistakes. The first is over-crediting the model for capabilities that the harness provides, such as browsing or memory. The second is over-blaming the model for failures caused by poor tool design, stale retrieval, ambiguous instructions, or missing validation.

## Harness Implications

Treat the model as a powerful but bounded component:

- Put authoritative state outside the model.
- Make tool effects explicit and auditable.
- Feed the model only the context it needs for the next step.
- Verify outputs that must be true.
- Evaluate the full model-harness loop, not only isolated answers.

The rest of this book adds detail to that frame. [Tokenization](./02-tokenization.md) explains what the model's input really looks like. [Pretraining](./03-next-token-prediction.md) explains where broad competence comes from. [Inference and sampling](./06-inference-and-sampling.md) explain why behavior varies. [Post-training](./07-post-training.md) explains why assistant models do more than raw completion. [Retrieval](./11-embeddings-and-retrieval.md), [tools](./12-reasoning-tools-and-agents.md), and [evals](./13-evaluation-for-llm-behavior.md) explain why serious systems require a harness.

## Key Takeaways

- An LLM is best treated operationally as a token-in, token-out component.
- Parameters encode compressed statistical structure and learned behavior, not a queryable database.
- Tool calls and real-world effects are created by the harness, not the model alone.
- Harness engineering begins at the boundary where token output becomes system action.
