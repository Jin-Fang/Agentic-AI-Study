# Chapter 1: The LLM as a Token Machine

The most useful first approximation is simple: a large language model receives a sequence of tokens and produces probabilities for what token could come next. It does not directly see words, files, websites, or users. It receives token IDs that encode a representation of its current context.

## Tokens In, Probabilities Out

For a given token context, the model computes a score for every token in its vocabulary. The runtime converts those scores into a probability distribution over the next token. In this sense, an LLM is a parameterized function from token sequences to next-token probabilities.

Karpathy's short introduction uses a deliberately demystifying frame: a trained model can be thought of as two files, one containing parameters and one containing code that knows how to run them ([Intro to LLMs, around 00:00:24](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=24s)). Real implementations contain more machinery, but the approximation exposes the essential interface: token context goes in, and a distribution over the next token comes out.

## Generating a Sequence

One pass does not normally produce a complete answer. Generation repeats the same basic operation:

1. Evaluate the current token context.
2. Produce probabilities for the next token.
3. Select a token according to a decoding rule.
4. Append that token to the context.
5. Repeat until a stop condition is reached.

The word *select* matters. Greedy decoding chooses the highest-probability token, while stochastic decoding samples from a distribution. Both are decoding rules, but greedy selection is not sampling. [Inference and sampling](./06-inference-and-sampling.md) develops this loop and its stopping conditions in detail.

## Architecture, Parameters, Runtime, and Application

Four layers are often blurred together:

- **Architecture** defines the shape of the computation, such as a decoder-only Transformer.
- **Parameters** are the learned numerical values that specialize that architecture.
- **Runtime** loads the parameters, evaluates the model, and applies a decoding rule.
- **Application layer** prepares inputs, calls the runtime, and interprets or presents its outputs.

Two models may share an architecture but contain different parameters. Conversely, two applications may call the same checkpoint yet produce different user experiences because they prepare different contexts or interpret the returned tokens differently.

Karpathy makes the parameters concrete by describing them as ordinary files that can be copied, downloaded, and loaded by runtime code ([Intro to LLMs, around 00:01:35](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=95s)). Their storage size is roughly determined by parameter count and numerical precision. A 70-billion-parameter model stored at two bytes per parameter requires about 140 GB for the parameters alone, before runtime overhead.

## Where Parameters Come From

Parameters are produced by training, not by the inference loop. During pretraining, optimization repeatedly changes the parameters to reduce next-token prediction error across a large collection of token sequences. Creating a large checkpoint can require substantial data, compute, and time, even though running an existing checkpoint is a more routine operation ([Intro to LLMs, around 00:03:59](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=239s), [00:05:16](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=316s)).

[Post-training](./07-post-training.md) starts from a pretrained checkpoint and further changes learned parameters—or adds learned adapter parameters—to shape tendencies such as instruction following, answer formatting, and refusal. The result is an updated checkpoint or an additional set of learned weights, not the original parameter file left unchanged.

Most model users do not create a base checkpoint themselves. They call an existing checkpoint through an API, an inference provider, or a local runtime. Regardless of where inference runs, the same separation holds: training produces learned parameters; the runtime uses them to compute next-token probabilities.

## Parameters Are Not a Database

Parameters encode distributed statistical structure and learned behavior. They are not rows that can be queried by key, inspected as exact records, or updated one fact at a time. A model may reproduce facts and patterns learned during training, but the parameter file is not an authoritative database and does not carry built-in provenance for each generated claim.

This distinction is about representation, not about whether a model can answer factual questions. Fluent recall can emerge from learned parameters without turning those parameters into a record store.

## Tokens Do Not Cause External Side Effects

The model's direct output is tokens. A continuation may describe reading a file, sending a message, or taking another action, but generating that description does not make the action happen. External software must interpret the output and perform any operation.

[Reasoning, tools, and agents](./12-reasoning-tools-and-agents.md) returns to this boundary: a model can generate a proposed call, while an external system executes it and may return an observation. The proposal and the external effect remain different events.

## A Model Call Is Not the Whole Application

Karpathy's deep dive begins by asking what is behind the text box and where its generated words come from ([Deep Dive, around 00:00:28](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=28s)). At the model boundary, the answer is the token-generation loop. At the application boundary, there is also software that constructs the input, invokes the runtime, and handles the output.

It is still useful to discuss *model behavior*: the phrase can refer to learned tendencies, probability distributions, or generated sequences under specified conditions. But observable application behavior may also include rendering, stored state, and external effects. Those additional outcomes are not produced by the model call alone.

The next chapters deepen the model-side picture: [tokenization](./02-tokenization.md) explains how text becomes token IDs, [next-token prediction](./03-next-token-prediction.md) explains the training objective, [Transformer attention](./04-transformer-attention.md) explains the core architecture, and [inference and sampling](./06-inference-and-sampling.md) explains decoding. System design beyond the model boundary belongs to the companion [Agent Harness](../agent-harness/README.md), especially its chapters on [the harness boundary](../agent-harness/01-what-is-an-agent-harness.md), [state and event history](../agent-harness/10-state-event-history-production-factors.md), [permissions and side effects](../agent-harness/07-sandboxing-runtime-enforcement.md), and [evaluation](../agent-harness/11-evaluation.md).

## Key Takeaways

- An LLM maps a token context to probabilities for the next token.
- Sequence generation repeats next-token prediction and token selection until a stop condition.
- Architecture, parameters, runtime, and application are distinct layers.
- Pretraining and post-training produce learned parameters; inference uses them.
- Parameters are distributed learned representations, not a queryable database.
- Model-generated tokens do not by themselves cause external actions.
