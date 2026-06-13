# Chapter 6: Inference and Sampling

Inference is what happens when a trained model is used. Given a context, the model computes a probability distribution over the next token. That distribution is often represented as logits before normalization. The system then chooses a token, appends it to the context, and repeats.

This loop is why generation appears word by word. It is also why generation is sensitive to decoding settings.

## Greedy Decoding and Sampling

The simplest strategy is greedy decoding: always choose the highest-probability next token. Greedy decoding can be stable, but it can also be dull, repetitive, or trapped by local choices.

Sampling chooses from the distribution. Temperature scales the logits before the softmax, which adjusts how sharp or flat the distribution is. At `t=1` the distribution is exactly the one the model was trained to produce. As `t` approaches 0 the distribution collapses onto its single most likely token, so `t→0` is effectively greedy decoding (argmax); the `temperature=0` exposed by most APIs corresponds to the greedy decoding above. Above `t=1` the distribution flattens, giving lower-probability tokens more chance. Top-p, or nucleus, sampling restricts choices to the smallest set of tokens whose cumulative probability crosses a threshold, then samples within that set; Holtzman et al. introduced nucleus sampling as a response to repetitive degeneration in neural text generation ([The Curious Case of Neural Text Degeneration](https://arxiv.org/abs/1904.09751)).

For creative writing, variation is useful. For code edits, data extraction, compliance workflows, or evals, variation can be harmful. Harnesses should set decoding parameters intentionally instead of inheriting defaults.

Karpathy distinguishes training from inference repeatedly: once a neural network is trained, inference is the act of running it forward to produce predictions ([Deep Dive, around 00:26:12](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1572s)). There is no parameter update during ordinary inference. The model is not learning from the user's message in the weight-update sense. It is conditioning on the user's message in the context-window sense.

This distinction matters for user expectations. A model may "remember" something in the current conversation because it is still in context. That is not the same as updating its parameters or writing durable memory.

## Determinism Is Not Truth

A deterministic output is not necessarily correct. It is only repeatable under the same model, context, decoding settings, and infrastructure assumptions. Conversely, a nondeterministic output is not necessarily bad. Some tasks benefit from multiple samples and selection.

A common mistake is to assume that `temperature=0` or greedy decoding guarantees identical outputs across API calls. It does not. Hosted inference batches requests dynamically, and floating-point addition is not associative, so the same logits can come out slightly different depending on how a request is batched with others. Kernel and code paths can vary across hardware or server versions, and a Mixture-of-Experts model can route the same token to different experts depending on the batch it lands in. Any of these can flip a near-tie at the argmax and change a token, which then changes everything after it. Build eval replay and regression tests on semantic or structural assertions, not byte-for-byte equality of `temperature=0` runs.

Harness engineers should distinguish:

- **Stability**: does the system produce similar behavior under similar inputs?
- **Correctness**: does the output satisfy the task?
- **Calibration**: does expressed confidence match actual reliability?
- **Robustness**: does the system hold up under prompt variation and edge cases?

Decoding settings can improve stability, but they do not replace verification.

## The Autoregressive Loop

At inference time, the loop is:

1. Serialize the conversation and context into tokens.
2. Run the Transformer forward.
3. Produce logits for the next token.
4. Apply decoding controls such as temperature, top-p, penalties, or masks.
5. Select a token.
6. Append it to the context.
7. Repeat until stop.

This explains why output length matters. Every generated token becomes part of the next step's input. Long answers cost more than short answers not only because they contain more output tokens, but because the model repeatedly runs the next-token loop.

For harness design, the autoregressive loop creates several controls:

- Use concise output contracts when downstream systems only need structure.
- Stop generation as soon as the needed artifact is complete.
- Avoid asking for hidden scratch work if it is not used.
- Split long work into tool-backed steps instead of one sprawling answer.
- Prefer code execution for exact loops over asking the model to simulate many iterations in text.

## Stop Conditions and Output Contracts

Generation must stop. It may stop because the model emits an end token, reaches a maximum token limit, or matches a stop sequence. Bad stop conditions cause subtle failures: truncated JSON, incomplete code, missing citations, or rambling outputs.

For harness work, output contracts should be explicit:

- Use schemas when downstream code parses the response.
- Validate structured outputs before acting on them.
- Retry with error feedback when validation fails.
- Keep maximum output tokens large enough for the task but small enough to control cost.
- Avoid asking the model to produce both long prose and strict machine-readable payloads in the same channel unless the parser is robust.

## Logit Bias, Masks, and Tool Choice

Some systems modify the next-token distribution directly. They may force valid JSON, mask unavailable tool names, bias toward a small set of labels, or constrain generation to a grammar. These controls are harness-level interventions on inference.

Used well, constraints reduce invalid outputs. Used badly, they can hide model uncertainty or force a model to choose among wrong options. A classification harness should include an explicit "none of the above" or "insufficient evidence" option when that is a real possibility.

Tool-calling systems often combine schema constraints with natural-language descriptions. The model still decides which tool call is likely, but the harness can restrict the syntax and validate the result.

## Latency, Throughput, and Model Routing

Inference cost depends on model size, prompt length, output length, batching, hardware, and provider implementation. A harness that feels fast in a demo can become expensive under production load.

Useful patterns include:

- route simple formatting tasks to smaller models,
- use larger models for planning, ambiguity, or difficult synthesis,
- cache deterministic retrieval and preprocessing,
- stream output only when the user benefits from partial text,
- avoid streaming internal machine-readable JSON that will be parsed only after completion,
- and measure p50, p95, and p99 latency separately.

The model is part of a distributed system. Treat inference parameters as production configuration, not notebook decoration.

## Streaming

Many providers can stream a response instead of returning it all at once. The transport is an event stream: the server emits small chunks as the model generates, including text deltas and the incremental arguments of a tool call. The client assembles these chunks into the final result. The key consequence is that a partial payload is not yet valid: a tool call's JSON arguments arrive a few characters at a time, so any structure read mid-stream may be incomplete and must not be parsed until the stream finishes.

Stream when a human is waiting on long text and benefits from seeing it appear: chat answers, generated prose, a long explanation. Do not bother streaming when only downstream code consumes the output and it parses the final structured payload anyway — there is no one to read the partial text, and assembling deltas just adds complexity. Streaming also interacts with control flow: a cancel or timeout can arrive after some tokens have already been delivered, and a retry restarts the stream from the beginning, so the client must be ready to discard a partial response and re-emit the full one.

## Call-Boundary Failure Handling

A model call is a network call, so it fails the way network calls fail. Sort the failures into two buckets. Retryable failures are transient and usually succeed on a second attempt: rate limits (HTTP 429), timeouts, and transient 5xx errors. Non-retryable failures will fail again identically until the request itself changes: a context that is too long, a content refusal, or an otherwise invalid request. Retrying the second kind just wastes time and money.

For retryable failures, back off exponentially with jitter so that many clients recovering at once do not retry in lockstep and re-overload the provider. When a call carries tool side effects — sending an email, charging a card, writing a row — attach an idempotency key so that a retry after an ambiguous timeout does not perform the action twice. Finally, detect truncated output: a response stopped by the token limit rather than a natural stop is a distinct outcome from a complete one, and the harness should either continue generation or fail loudly rather than treat the fragment as final. These same patterns scale up into the operational discipline that long-running agents need (see [Reasoning, Tools, and Agents](./12-reasoning-tools-and-agents.md)).

## Multiple Samples and Selection

Some workflows benefit from sampling several candidates and grading them. This can improve tasks where there are many plausible paths: planning, test generation, summaries, or refactoring options. But pass@k-style improvement can hide operational cost. (Pass@k is the fraction of problems solved by at least one of k sampled attempts.) If a harness samples five outputs and grades them, latency and token spend may multiply.

Use multi-sample strategies when the task value justifies the cost and when the grader is trustworthy.

## Key Takeaways

- Inference repeatedly predicts and selects the next token.
- Temperature, top-p, max tokens, and stop conditions are behavioral controls.
- Determinism improves repeatability but does not guarantee truth.
- Harnesses should validate outputs and choose decoding settings per workflow.
