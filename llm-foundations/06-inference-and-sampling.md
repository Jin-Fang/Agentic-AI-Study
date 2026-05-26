# Chapter 6: Inference and Sampling

Inference is what happens when a trained model is used. Given a context, the model computes a probability distribution over the next token. That distribution is often represented as logits before normalization. The system then chooses a token, appends it to the context, and repeats.

This loop is why generation appears word by word. It is also why generation is sensitive to decoding settings.

## Greedy Decoding and Sampling

The simplest strategy is greedy decoding: always choose the highest-probability next token. Greedy decoding can be stable, but it can also be dull, repetitive, or trapped by local choices.

Sampling chooses from the distribution. Temperature adjusts how sharp or flat the distribution is. Lower temperature makes high-probability tokens more dominant. Higher temperature gives lower-probability tokens more chance. Top-p, or nucleus, sampling restricts choices to the smallest set of tokens whose cumulative probability crosses a threshold, then samples within that set; Holtzman et al. introduced nucleus sampling as a response to repetitive degeneration in neural text generation ([The Curious Case of Neural Text Degeneration](https://arxiv.org/abs/1904.09751)).

For creative writing, variation is useful. For code edits, data extraction, compliance workflows, or evals, variation can be harmful. Harnesses should set decoding parameters intentionally instead of inheriting defaults.

Karpathy distinguishes training from inference repeatedly: once a neural network is trained, inference is the act of running it forward to produce predictions ([Deep Dive, around 00:26:12](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1572s)). There is no parameter update during ordinary inference. The model is not learning from the user's message in the weight-update sense. It is conditioning on the user's message in the context-window sense.

This distinction matters for user expectations. A model may "remember" something in the current conversation because it is still in context. That is not the same as updating its parameters or writing durable memory.

## Determinism Is Not Truth

A deterministic output is not necessarily correct. It is only repeatable under the same model, context, decoding settings, and infrastructure assumptions. Conversely, a nondeterministic output is not necessarily bad. Some tasks benefit from multiple samples and selection.

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

## Multiple Samples and Selection

Some workflows benefit from sampling several candidates and grading them. This can improve tasks where there are many plausible paths: planning, test generation, summaries, or refactoring options. But pass@k-style improvement can hide operational cost. If a harness samples five outputs and grades them, latency and token spend may multiply.

Use multi-sample strategies when the task value justifies the cost and when the grader is trustworthy.

## Key Takeaways

- Inference repeatedly predicts and selects the next token.
- Temperature, top-p, max tokens, and stop conditions are behavioral controls.
- Determinism improves repeatability but does not guarantee truth.
- Harnesses should validate outputs and choose decoding settings per workflow.
