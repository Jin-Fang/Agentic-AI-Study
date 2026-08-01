# Chapter 4: Transformer and Attention

Most modern LLMs are based on the Transformer architecture introduced in *Attention Is All You Need* ([Vaswani et al., 2017](https://arxiv.org/abs/1706.03762)). Karpathy's introduction likewise identifies the Transformer as the neural network architecture behind these models ([Intro to LLMs, around 00:11:40](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=700s)). The architecture explains how a sequence of tokens becomes context-dependent predictions.

## Inputs and Outputs

A language model begins with token IDs. An embedding table maps each ID to a vector, so an input sequence becomes a sequence of vectors. The model must also represent order: without position information, the same tokens in different orders would be difficult to distinguish.

Transformer families encode position in different ways. Examples include learned absolute position embeddings, sinusoidal encodings, relative position biases, and rotary position embeddings applied within attention. Position is therefore part of the model's representation of the sequence, even though it is not always literally added to the token embedding.

The vectors pass through a stack of Transformer blocks. Each block produces a new representation for every position. After the final block, a learned projection maps the representation at each position to vocabulary logits. During next-token training, those logits are compared with the following token at every eligible position. During generation, the logits at the last position define the distribution used to select the next token.

Karpathy describes this flow as tokens passing through repeated Transformer blocks until the network produces next-token predictions ([Deep Dive, around 00:23:24](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1404s)). The model is not parsing the sequence into a set of explicit variables. It is repeatedly transforming vector representations.

## Original Transformer and Decoder-Only LLMs

The original Transformer was an encoder-decoder architecture designed for sequence-to-sequence tasks such as machine translation. Its encoder builds representations of an input sequence. Its decoder uses both causal self-attention over the output prefix and cross-attention to the encoder's representations.

Many autoregressive LLMs instead use a decoder-only architecture. They have no separate encoder or cross-attention stage. A single stack processes a prefix under a causal constraint and predicts the token that follows it. In training, many next-token predictions can be computed in parallel because the correct prefix for every position is already present. At generation time, tokens are appended one at a time.

"Transformer" therefore names a family of architectures, not one fixed layout. Model families also vary in normalization placement, position method, attention variants, activation functions, and other details. The shared idea is a stack of learned blocks that turns a token sequence into contextual representations.

## Self-Attention

Self-attention lets a position mix information from other positions in the same sequence. This makes the representation of a token depend on its context. For example, a word in a question can interact with words in the source text that precedes it, and a line of code can interact with an earlier variable definition.

The attention computation is learned and soft. It does not retrieve a symbolic record or copy a single fact through a fixed rule. Instead, it creates weighted mixtures of value vectors, which are then combined with other signals and transformed by the rest of the network.

### Queries, Keys, and Values

Within one attention head, learned projections turn each input representation into three vectors:

- A **query** represents what the current position is looking for.
- A **key** represents how an available position can be matched.
- A **value** represents information that the available position can contribute.

For an input matrix \(X\), one head computes projections \(Q=XW_Q\), \(K=XW_K\), and \(V=XW_V\). Its output has the form

```text
Attention(Q, K, V) =
  softmax((Q K^T) / sqrt(d_k) + M) V
```

where \(M\) is the attention mask. The dot products produce compatibility scores, the softmax turns the permitted scores into weights, and the weighted sum mixes the value vectors.

Suppose a code sequence contains `user_count = ...` and later reaches `return `. Some heads may give the earlier definition relatively high weight and contribute information about `user_count` to the later representation. That is only an intuition for one intermediate computation: no single head normally decides that the next token will be `user_count`. The outputs of multiple heads, residual paths, MLPs, and many layers all contribute before vocabulary logits are produced.

The same caution applies to prose. A position used to answer a question may weight an earlier sentence that states a relevant fact, but the final answer does not follow mechanically from one attention link. Attention can mix useful, irrelevant, or misleading information, and high attention weight alone is not proof of causal importance.

### Causal Masking

In a decoder-only language model, the mask \(M\) prevents a position from attending to later positions. Disallowed scores are effectively set to negative infinity before the softmax, so their weights become zero. A representation at position \(i\) can use tokens at positions up to \(i\), but not tokens that come after it.

This causal mask aligns the architecture with next-token prediction. During training, the model can process a complete sequence while still preventing each position from seeing the token it is supposed to predict. During generation, the same constraint means that a newly generated token depends only on the existing prefix.

### Multi-Head Attention

Multi-head attention runs several attention computations with different learned projections. Their outputs are concatenated and projected back into the model's residual stream. Multiple heads give a layer several ways to combine information across positions in parallel.

Heads sometimes exhibit recognizable patterns, such as attending locally or tracking repeated tokens, but they are not guaranteed to divide into clean human-readable roles. Their contributions can overlap, change with context, and interact with later layers. A head is best understood as one component of a distributed computation rather than an independent decision-maker.

The attention block is the mechanism Karpathy highlights when explaining how positions communicate inside a Transformer ([Deep Dive, around 00:24:29](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1469s)). It gives earlier text a path to affect later representations, but it does not guarantee that the model will identify or use the most relevant information correctly.

## The Transformer Block

Attention is only one part of a Transformer block. A typical decoder-only block contains:

1. A normalization operation.
2. Causal multi-head self-attention.
3. A residual connection that adds the attention output back to the running representation.
4. Another normalization operation.
5. A feed-forward network, often called an MLP, applied independently at each position.
6. Another residual connection.

Exact ordering differs across model families; for example, normalization may appear before or after a sublayer. The functional distinction is more important than the exact variant: attention mixes information across token positions, while the MLP applies learned nonlinear transformations within each position. Residual connections preserve and accumulate signals as representations pass through many blocks, and normalization helps keep those computations stable.

Repeating these blocks produces representations conditioned on the available prefix. Individual layers need not correspond to clean stages such as "syntax first, meaning later." Features can be distributed across layers and components, and the same component may participate in different computations for different inputs.

## Distributed Representation and Interpretability

A model's learned knowledge and behavior are distributed across many parameters and activations. Karpathy emphasizes that billions of parameters collaborate in ways that are not yet fully understood mechanistically ([Intro to LLMs, around 00:11:57](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=717s)). Asking where one fact is stored therefore rarely has a simple answer.

The same is true of a particular prediction. Attention weights reveal part of an internal computation, but they are not a complete explanation: value vectors, MLPs, residual paths, and later layers also matter. Mechanistic interpretability studies these computations, yet current methods do not generally provide a simple, exhaustive causal account of every generated token.

Distributed representation also means that model knowledge is not an editable table of facts. Changing a parameter can affect many inputs, while one behavior may depend on many parameters. The network still performs a definite numerical computation, but its internal concepts usually do not map one-to-one to human labels.

## Architecture and Training Are Separate

Architecture defines the operations the network can perform; training determines the parameter values used by those operations. A randomly initialized Transformer has the architecture but not useful language behavior. Pretraining fits the parameters to next-token prediction over training sequences, and post-training can further change the distribution of its responses.

This distinction prevents architecture from becoming a catch-all explanation. Self-attention provides a path for earlier text to influence a later prediction, but training determines which patterns the model has learned to recognize and how reliably it uses them. Two models with similar architectures can behave differently because their data, objectives, parameter counts, and post-training differ.

## Attention Cost

For standard full-sequence attention on \(n\) tokens, each position forms scores against the other permitted positions. The score matrix therefore has \(O(n^2)\) entries per head. Holding model width and layer count fixed, the sequence-length-dependent attention work is quadratic during training and during prompt processing, also called **prefill**. A causal mask removes future-position interactions but does not change this asymptotic scaling.

This statement applies specifically to the attention part of a block. Linear projections and MLPs also consume substantial compute, and for many practical sequence lengths they may dominate total runtime. Conventional attention implementations may also require \(O(n^2)\) temporary memory for attention scores, while memory-efficient kernels can avoid materializing the full matrix without eliminating the underlying pairwise attention work.

Autoregressive decoding has a different profile when a **KV cache** is used. The keys and values for existing tokens are stored at every layer. For one new token, the model computes only the new query, key, and value; that query attends over the cached prefix. Holding model dimensions fixed, the attention work for that decode step grows as \(O(n)\) with prefix length rather than recomputing \(O(n^2)\) attention for the entire prefix. KV-cache memory grows linearly with the number of cached tokens.

Across many generated tokens, those linear-per-step costs accumulate: generating \(m\) tokens after a prompt of length \(p\) requires attention score work proportional to roughly \(mp + m^2\), in addition to prefill and the other computations in each block. Architecture and kernel optimizations can change constants or use approximate/sparse patterns, but longer sequences still impose real compute, memory, and latency costs.

## Key Takeaways

- A decoder-only Transformer maps token and position information through repeated blocks to next-token logits.
- Causal self-attention mixes information from the available prefix through learned query, key, and value projections.
- Multiple heads and layers contribute distributed intermediate signals; a single attention head does not directly choose the output token.
- Attention can make relevant earlier text influential, but it does not guarantee correct selection or use of that information.
- Standard prefill attention is quadratic in sequence length, while KV-cached decoding uses linear attention work per new token and linear cache memory.
