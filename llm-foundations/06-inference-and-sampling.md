# Chapter 6: Inference and Sampling

Inference is the use of a trained model to compute outputs without updating its parameters. Given a token context, the model produces a score, called a **logit**, for every token in its vocabulary. A decoding rule turns those scores into a token choice. The chosen token is appended to the context, and the process repeats.

This chapter follows that path from logits to a complete generated sequence.

## What Inference Computes

For a context \(x_{1:t}\), a decoder-only Transformer produces a vector of next-token logits \(z\), with one value for each vocabulary token. Logits are relative scores, not probabilities. Softmax converts them into a probability distribution:

```text
p_i = exp(z_i) / sum_j exp(z_j)
```

Higher logits produce higher probabilities, but every probability also depends on the other logits in the vector. Ordinary inference performs forward computation through the existing parameters; it does not run backpropagation or update the checkpoint.

The context can change a model's output without changing its parameters. A fact mentioned earlier in the current input can influence the next-token distribution because the model conditions on that input. This temporary conditioning is different from learning the fact into the weights or storing it as durable memory.

## From Logits to a Token

**Greedy decoding** selects the token with the highest probability. Given exactly the same logits, transformations, and tie-breaking rule, greedy decoding makes the same next-token choice. It can nevertheless produce repetitive or locally attractive continuations because each step commits to one token without considering every possible complete sequence.

**Sampling** draws a token from a probability distribution instead of always taking the maximum. Temperature commonly modifies the distribution as

```text
p_i(T) = softmax(z_i / T)
```

for \(T>0\):

- At `temperature=1`, the logits are not rescaled, so softmax yields the model's unmodified next-token distribution.
- For `0 < temperature < 1`, the distribution becomes sharper and high-logit tokens receive more probability.
- For `temperature > 1`, the distribution becomes flatter and lower-logit tokens receive more probability.
- `temperature=0` is not defined by the formula because it would divide by zero. APIs usually interpret it as greedy or argmax decoding, but the exact contract is provider-specific.

**Top-p sampling**, also called nucleus sampling, first sorts tokens by probability and keeps the smallest set whose cumulative probability reaches at least \(p\). It then renormalizes and samples from that set. A top-p value of `1` normally removes no tokens; it does not itself make decoding greedy. Nucleus sampling was introduced to avoid sampling from an unreliable long tail while retaining context-dependent diversity ([The Curious Case of Neural Text Degeneration](https://arxiv.org/abs/1904.09751)).

Temperature and top-p are often combined, although the precise order and edge-case behavior depend on the implementation. Lower randomness can suit tasks with a narrow expected form, while broader sampling can expose alternative continuations. Neither setting determines whether the content is correct.

## The Autoregressive Loop

Generation is autoregressive: every selected token becomes part of the context for the following token. In simplified form:

1. Encode the input context as tokens.
2. Run the model to obtain logits for the next position.
3. Apply any configured logit transformations or constraints.
4. Select a token by greedy decoding or sampling.
5. Append the selected token to the context.
6. Repeat until a stopping condition is reached.

The initial pass over the input is commonly called **prefill**. The subsequent one-token-at-a-time phase is **decode**. Implementations normally reuse a KV cache during decode rather than recomputing all earlier attention keys and values; [Chapter 9](./09-context-window-and-kv-cache.md) explains that distinction.

An early token choice changes the context and therefore changes all later distributions. This is why two sampled completions can diverge substantially after a small initial difference.

Longer outputs require more computation because each additional output token requires another decode step. The cause is not merely that the final text contains more tokens: generation cannot produce token \(t+1\) until token \(t\) has been selected and appended.

## Stopping Generation

A generation can stop for several reasons:

- The model emits an end-of-sequence token.
- The configured maximum number of output tokens is reached.
- A configured stop sequence is encountered.
- The serving API ends generation for another documented, provider-specific reason.

Many APIs return a **finish reason** that distinguishes a normal stop from a token-limit stop or another termination mode. The field names and possible values vary by provider, so they must be interpreted according to that API's contract.

Reaching the maximum output length means the sequence may be truncated. The last characters can look fluent even when a sentence, code block, or structured value is incomplete. A stop sequence is also an external boundary: depending on the API, the matched sequence may be omitted from the returned text. Neither case says anything by itself about the correctness of the preceding content.

## Logit Transformations and Constrained Decoding

Decoding can alter or restrict the next-token distribution before selection. Examples include logit bias, repetition or frequency penalties, and masks that assign invalid tokens effectively zero probability.

**Constrained decoding** applies such restrictions at every step so that the growing token sequence remains a valid prefix under a grammar, JSON schema, regular language, or fixed label set. Because textual units and tokens do not always align, the decoder must determine which token continuations preserve the constraint rather than merely checking one character at a time.

These methods can guarantee that an output belongs to the supported syntactic language, provided the implementation is correct. They cannot guarantee that a JSON value is factually true, that code has the intended behavior, or that one of several forced labels is an adequate answer. A constraint can also hide uncertainty by requiring a choice when the model would otherwise express that none of the options fits.

Constrained generation concerns which token sequences may be emitted. Interpreting a generated action description or executing an external action is a separate boundary covered in [Chapter 12](./12-reasoning-tools-and-agents.md).

## Randomness and Repeatability

Sampling uses a pseudorandom state, so repeated runs can choose different tokens even when their probability distributions match. If an API exposes a seed, fixing it may improve repeatability, but guarantees are provider-specific and can depend on the model version, backend, and other decoding settings.

Greedy decoding removes sampling randomness, but `temperature=0` does not guarantee byte-for-byte identical responses across all hosted requests. Nominally identical requests can produce slightly different logits because batching, floating-point kernels, hardware, or serving software can change. If two leading tokens are nearly tied, a small numerical difference can change the argmax; that first difference then changes the rest of the autoregressive path.

The important distinction is:

- With exactly the same logits and deterministic tie-breaking, argmax chooses the same token.
- Requests that look identical at the API boundary are not guaranteed to produce exactly the same logits on every serving stack.
- With sampling, repeatability additionally depends on the pseudorandom state and the sampling implementation.

Finally, repeatability is not correctness. A greedy decoder can reproduce the same false answer consistently, while a sampled decoder can produce a correct answer on one run and an incorrect one on another.

## Multiple Complete Samples

Instead of generating one completion, an inference procedure can generate \(k\) complete samples from the same input. Each sample follows its own autoregressive path, so the set may reveal different phrasings, approaches, or candidate solutions.

Multiple samples are useful when the distribution contains several plausible continuations, but they do not identify the best candidate by themselves. Producing \(k\) candidates also consumes roughly \(k\) times as many generated tokens unless batching or early stopping changes the amount of work. How candidates are scored, how pass@k is reported, and whether an evaluator is trustworthy are evaluation questions covered in [Chapter 13](./13-evaluation-for-llm-behavior.md).

## Key Takeaways

- Inference maps a token context to next-token logits without updating model parameters.
- Greedy decoding selects an argmax; sampling draws from a distribution shaped by controls such as temperature and top-p.
- `temperature=1` leaves logits unscaled, while `temperature=0` is an API convention that usually requests greedy decoding.
- Autoregressive generation appends one selected token at a time and stops on an end token, a limit, a stop sequence, or another documented condition.
- Constrained decoding can enforce syntax, not semantic correctness.
- Lower randomness can improve repeatability, but deterministic output is not necessarily correct and hosted execution may still vary.
- Multiple complete samples explore more of the model's distribution at additional inference cost.
