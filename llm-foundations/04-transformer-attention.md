# Chapter 4: Transformer and Attention

Most modern LLMs are based on the Transformer architecture introduced in *Attention Is All You Need* ([Vaswani et al., 2017](https://arxiv.org/abs/1706.03762)). Karpathy's intro names the Transformer as the neural network architecture behind these models ([Intro to LLMs, around 00:11:40](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=700s)). For harness engineers, the architecture matters because it explains why context is powerful, expensive, and imperfect.

## Original Transformer vs Decoder-Only LLMs

The original Transformer was an encoder-decoder architecture for sequence-to-sequence tasks such as machine translation. Many modern autoregressive LLMs use a decoder-only variant: they process a prefix and predict the next token under a causal mask.

This distinction matters because "Transformer" is a family pattern, not one exact product shape. A causal language model cannot attend to future tokens during training or generation. Its attention is constrained so each position can use earlier positions, which matches the next-token objective.

Modern LLMs also use details that are easy to skip in a high-level explanation:

- **Multi-head attention** lets different heads attend to different relationships in parallel.
- **Position information** tells the model where tokens occur. Modern systems may use learned positions, sinusoidal positions, rotary position embeddings, or other variants.
- **Causal masking** prevents the model from seeing the answer token while learning to predict it.

For harness work, the takeaway is not to memorize architecture variants. It is to remember that context is made usable by a specific sequence-processing computation, and that model families can differ in how they represent position, length, and attention.

## From Tokens to Vectors

The model begins by mapping token IDs to vectors called embeddings. A token such as `hello`, a newline, or a code fragment becomes a point in a high-dimensional space. Position information is added so the model can distinguish the same token appearing in different places.

The model then passes these vectors through many repeated layers. Each layer updates the representation of every token by mixing information from other tokens and applying learned transformations.

Karpathy describes the Transformer as the specific kind of neural network used in this setting, with tokens flowing through repeated blocks until the network produces predictions for the next token ([Deep Dive, around 00:23:24](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1404s)). The important harness-level point is that the network is not reading a document into explicit variables. It is transforming a sequence of vector states.

Every token position carries a representation that is gradually refined. Early layers may represent local syntax or token identity. Later layers can represent more abstract relationships useful for prediction. The exact internal features are not fully interpretable, but the process is still mechanical: vector transformations conditioned on the provided context.

## Attention: Looking Back Through Context

Self-attention lets each token representation gather information from other tokens in the context. In a causal language model, a position can attend to earlier positions but not future positions. This is what allows the model to condition the next token on the prompt, previous conversation, retrieved passages, tool results, and examples.

The basic intuition:

- A query asks what information this position needs.
- Keys describe what each earlier position offers.
- Values carry the information to be mixed in.
- Attention weights decide how strongly positions influence each other.

This is not a database lookup. It is a learned, soft, distributed operation. Relevant text can influence generation, but irrelevant or misleading text can also influence generation. Long context increases opportunity and risk at the same time.

The attention block is the part Karpathy points to when explaining how positions communicate inside the Transformer ([Deep Dive, around 00:24:29](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1469s)). In harness terms, attention is why putting evidence into the prompt can work at all. It is also why evidence placement, delimiters, and noise control matter.

A retrieved passage that directly answers the question gives attention something useful to bind to. A retrieved passage that is merely topically related competes with the answer. A long tool log containing thousands of successful test lines may cause the model to attend to irrelevant patterns. Attention is powerful, but it is not selective enough to justify careless context construction.

## MLPs and Layers

Attention moves information across positions. Feed-forward or MLP blocks transform information within each position. Residual connections carry representations across layers. Layer normalization stabilizes training.

The details matter less for harness work than the shape: a model repeatedly mixes context and transforms representations. It does not store a crisp list of facts extracted from the prompt. It builds a distributed activation state conditioned on the entire token sequence.

This helps explain why instruction placement matters. A late, clear instruction may dominate a nearby response. A high-priority instruction at the top may still be diluted by thousands of tokens of noisy context. A retrieved passage can help if it is relevant and compact, but it can hurt if it contains distracting alternatives.

## Dense and Mixture-of-Experts Models

The MLP blocks above hold much of a model's parameters and compute, and they are where model families diverge most. A *dense* model runs every parameter for every token. A *Mixture-of-Experts* (MoE) model replaces some MLP blocks with many parallel expert sub-networks plus a router that activates only a few experts per token. The Switch Transformer showed that this sparse routing lets total parameter count grow without a proportional rise in per-token compute ([Switch Transformers](https://arxiv.org/abs/2101.03961)).

For harness engineers, MoE breaks a convenient assumption: that a model's advertised size predicts its cost and latency. An MoE model may have a very large *total* parameter count but a much smaller *active* parameter count per token. Two consequences follow:

- Model size alone no longer predicts inference cost. When reasoning about latency and price, ask about active parameters, not just total parameters.
- Routing is part of behavior. Different inputs activate different experts, which can make performance uneven across domains and interact with batching and throughput in ways a dense model does not.

This does not change the harness's job, but it changes model selection. A "smaller" dense model and a "larger" MoE model can land at similar cost while behaving differently on your workload. As always, evaluate on the actual task (see [Chapter 13](./13-evaluation-for-llm-behavior.md)) instead of inferring reliability from a parameter count.

## Parameters Are Distributed Across the Network

The model's knowledge and behavior are not located in one obvious place. Karpathy emphasizes that billions of parameters are dispersed throughout the network and collaborate in ways we do not fully understand mechanistically ([Intro to LLMs, around 00:11:57](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=717s)). This is why asking "where does the model store this fact?" usually has no simple answer.

For harness engineering, distributed representation has three consequences:

- You cannot patch a factual error by editing one visible database row inside the model.
- You cannot reliably inspect the model to prove why it generated a specific answer.
- You can often control behavior more effectively by changing inputs, tools, retrieval, and verification than by trying to reason about internal circuits.

Mechanistic interpretability is an active research field, but production harnesses need controls that work now.

## Training and Architecture Are Separate Ideas

The Transformer architecture defines the computation. Training sets the parameters. A randomly initialized Transformer is not useful. A trained Transformer has absorbed structure from data. A post-trained Transformer has additionally been shaped toward assistant behavior.

This distinction avoids confusion. When a model fails to follow a tool schema, the cause might be architecture limits, but it is more often data, post-training, prompt format, or harness design. When a model handles a long document badly, the cause might be context length, but it might also be retrieval noise or instruction placement.

## Attention Cost

Standard attention compares positions with other positions, which makes long context expensive. Modern systems use many optimizations, but context length still affects latency, memory, and cost. The harness should not treat a large context window as permission to paste everything.

Good harnesses use the model's attention deliberately:

- Keep current instructions compact and visible.
- Retrieve small, relevant spans instead of entire corpora.
- Summarize or externalize old state.
- Use files, databases, and caches as memory outside the model.
- Measure whether more context improves outcomes before adding it.

## Key Takeaways

- Transformers convert token sequences into contextual vector representations.
- Attention lets tokens condition on earlier context, but it is soft and fallible.
- Long context is both powerful and costly.
- Harness design should help attention by reducing noise and making relevant evidence easy to use.
