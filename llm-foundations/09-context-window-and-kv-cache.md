# Chapter 9: Context Windows and KV Cache

The context window is the token sequence a model can condition on during one generation. Its limit usually applies to the prompt **plus the tokens generated so far**, not to the prompt alone. If a model has a context limit of \(C\) tokens and the serialized prompt uses \(n\), at most \(C-n\) positions remain for generation. Providers may also impose separate input and output limits, so the model's architectural limit and an API's accepted limits are not always identical.

Context is temporary input to one generation. It is not durable state, and it is not a guarantee that the model will use every included token reliably.

## A Finite Token Sequence

A model receives token IDs, including any special tokens added by its chat template. All of them occupy positions in the sequence. As generation proceeds, each selected token is appended to that same sequence and reduces the remaining capacity. Tokenization and hidden formatting overhead therefore affect both how much input fits and how much output can still be produced; see [Chapter 2](./02-tokenization.md).

Exceeding a limit is a capacity failure: an API may reject the request, truncate part of it, or stop generation at its configured output bound. Staying below the limit answers only whether the sequence fits. It does not establish that the model can recall, compare, or reason over every part of the sequence equally well.

Karpathy describes the context window as the model's finite working context: the information it can currently see while generating ([Intro to LLMs, around 00:32:42](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1962s)). The working-memory analogy is useful as long as it is not mistaken for persistence or reliable random access.

## Prefill and Decode

Autoregressive inference has two computationally different stages.

### Prefill

During **prefill**, the model processes the prompt through all [Transformer layers](./04-transformer-attention.md). Causal masking allows the prompt positions to be computed in parallel even though each position can attend only to itself and earlier positions.

For a prompt of length \(n\), standard dense self-attention performs attention work that grows as \(O(n^2)\). Optimized attention kernels can greatly reduce intermediate memory traffic and constants without changing that basic pairwise-comparison scaling. Prefill produces the logits used to select the first generated token and also creates the key and value tensors that will be reused during decoding.

Prompt length therefore has a direct effect on prefill work and often on time to first token. Other parts of the model, hardware, batching, and serving implementation also contribute, so token count alone does not determine latency.

### Decode

During **decode**, the model selects one new token at a time. At each layer, it computes the new token's query, key, and value. The query attends to the keys and values already stored for the preceding sequence; the new key and value are then appended to the cache.

With a KV cache, projections and MLP computations for earlier tokens do not need to be repeated. For standard dense attention, however, the new query still compares against a growing prefix. The attention work for one decoded token is therefore \(O(t)\) at sequence length \(t\), not constant time. Generating \(m\) tokens after an \(n\)-token prompt requires roughly \(O(mn+m^2)\) decode-attention work across those tokens. Without a cache, a naive implementation would repeatedly run the whole growing prefix and redo much more computation.

This distinction explains two familiar latency measures: prefill largely determines time to first token, while sequential decode largely determines the rate at which later tokens arrive.

## What the KV Cache Stores

In every attention layer, each previously processed token has a key vector and a value vector. The **KV cache** stores those tensors for reuse by later decode steps. It is a cache of intermediate numerical state for an exact token prefix, not a cache of facts or a summary of the text.

Its size grows approximately with

```text
KV elements per request =
  2 * layers * cached_tokens * KV_heads * head_dimension
```

per active sequence, multiplied by the number of bytes used for each element. Batch size, parallel samples, and beam search can multiply that cost. Architectures such as grouped-query or multi-query attention use fewer KV heads and can reduce it, while sliding-window or other attention variants may change which tokens must remain cached.

Longer contexts thus consume more cache memory and require each new query to read more cached state. KV-cache capacity can limit batch size and throughput even when model weights fit comfortably in memory.

A cache is not “stale” merely because the prefix describes an outdated fact. The tensors still correctly represent the exact tokens from which they were computed; the **content** is stale. If a token in that prefix changes, the affected hidden states and their derived keys and values must be recomputed.

## Context, KV Cache, and Provider Prompt Caching

These three ideas are related but not interchangeable:

- The **context** is the token sequence the model is allowed to condition on.
- The **per-request KV cache** holds layer-level key and value tensors for positions already processed during that generation.
- **Provider prompt caching** may reuse prefill work for a shared prefix across separate requests.

Provider prompt caching is an API and serving contract, not a property implied by the model's context window. Eligibility, prefix-matching rules, retention time, billing, and latency effects are provider-specific; a match often requires identical leading tokens. A provider may implement the feature by retaining KV-derived state or by other internal means. Either way, it does not enlarge the context window, make the prefix more trustworthy, or turn the request into persistent semantic memory.

## Working Context Is Not Persistent State

When a call ends, its context does not by itself become state available to a future call. An application can preserve information externally and include some of it in a later prompt, but that is a separate system mechanism. Detailed context management and memory architectures belong to [Chapter 3](../agent-harness/03-context-as-finite-resource.md) and [Chapter 5](../agent-harness/05-compaction-memory-context-handoffs.md) of *Agent Harness*; durable execution state and event history are defined in [Chapter 10](../agent-harness/10-state-event-history-production-factors.md).

## Long-Context Capacity and Reliability

A larger advertised window increases **capacity**: more tokens can fit. It does not guarantee uniform or reliable **utilization** of those tokens. Long inputs can expose several empirical weaknesses:

- sensitivity to where relevant information appears;
- reduced accuracy when relevant material is surrounded by distractors;
- difficulty integrating evidence spread across distant positions;
- declining task performance before the hard context limit is reached.

The term **context rot** is often used for this broad degradation as context grows. It is an empirical behavior, not a single mechanism or a universal threshold. Its severity depends on the model, task, sequence length, position, and surrounding content.

*Lost in the Middle* found that models on key-value retrieval and multi-document question answering could perform better when relevant information appeared near the beginning or end than when it appeared in the middle ([Liu et al., 2023](https://arxiv.org/abs/2307.03172)). The exact pattern is not identical for every model, but it demonstrates the central distinction: information being inside the supported window does not mean the model will use it reliably.

Long-context claims should therefore be read precisely. A maximum token count describes an accepted sequence length. Performance on a short retrieval probe describes one behavior. Neither alone establishes dependable comprehension, recall, or reasoning across arbitrary inputs at that length.

## Context Is Not an Enforcement Boundary

The model computes over the serialized tokens it receives; it does not provide reliable trust isolation between different parts of that sequence. Labels, role markers, and delimiters may influence behavior, but untrusted text can still influence generation, as discussed in [Chapter 8](./08-prompting-and-in-context-learning.md).

Context is therefore an input and attack surface, not an authorization or enforcement boundary. Any hard access or action boundary must exist outside the model. The detailed controls belong to the companion [*Agent Harness*](../agent-harness/README.md).

## Key Takeaways

- A context-window limit usually covers the prompt plus generated tokens; provider input and output limits may add further constraints.
- Prefill processes the prompt and builds per-layer keys and values; decode then generates sequentially while reusing them.
- KV cache removes repeated computation for old tokens, but its memory grows linearly with cached sequence length and standard decode attention still scans a growing prefix.
- Context, a per-request KV cache, and provider prompt caching are different concepts with different lifetimes and contracts.
- Long-context capacity does not guarantee reliable use of every included token.
- Context is temporary input, not persistent memory or a model-enforced trust boundary.
