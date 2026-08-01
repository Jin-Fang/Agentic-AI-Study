# Chapter 3: Next-Token Prediction

The pretraining objective for an autoregressive language model is deceptively simple: given previous tokens, predict the next token. At each position, the model assigns a probability to every token in its vocabulary, and training rewards it for assigning a higher probability to the token that actually follows. Karpathy illustrates this process by taking windows of tokens from a large dataset and repeatedly predicting what comes next ([Deep Dive, around 00:15:36](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=936s)).

This objective supplies the learning signal for pretraining. It does not, by itself, give the model an authoritative store of facts, an intention, or an assistant persona.

## The Next-Token Objective

Suppose a training sequence begins:

```text
The capital of France is Paris.
```

It provides a series of prediction targets:

```text
The                         -> capital
The capital                 -> of
The capital of              -> France
The capital of France       -> is
The capital of France is    -> Paris
```

The actual units are tokens rather than words, so the boundaries may differ from this simplified display. The same objective applies to prose, code, dialogue, mathematical derivations, tables, and Markdown. Whatever the text form, the training target is expressed as a continuation token rather than as a separately programmed symbolic rule.

## Training Text Becomes Token Sequences

Before training, source text is filtered, transformed, and encoded by a tokenizer. The resulting token IDs are arranged into sequences of a length the model can process. Each sequence supplies many prefix-and-target relationships for training.

In Karpathy's small demonstration, the cleaned dataset is represented as one long array of tokens from which training windows are sampled ([Deep Dive, around 00:14:34](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=874s)). That is a useful teaching device, not a universal description of production training. A production pipeline may preserve document boundaries, insert boundary tokens, split long documents, or pack pieces from multiple documents into fixed-length sequences. The exact construction determines which transitions the model encounters.

The important invariant is that training operates on token sequences with next-token targets. It does not require the entire corpus to become one semantically borderless stream.

## Loss and Gradient Updates

For a target token, the loss is its negative log-probability under the model. Assigning a high probability to the correct token produces a low loss; assigning a low probability produces a high loss. Averaging this quantity across predicted positions gives the cross-entropy loss, also called negative log-likelihood in this setting.

Perplexity is the exponential of the average cross-entropy when natural logarithms are used. It puts the loss on an effective-choice scale: a perplexity of 10 corresponds to the same average uncertainty as a uniform choice among 10 possibilities. Karpathy describes loss as the single number the training process tries to reduce ([Deep Dive, around 00:35:58](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=2158s)).

The training loop is:

1. Build a batch of token sequences and their next-token targets.
2. Run the model to produce a probability distribution at each predicted position.
3. Compute the average loss for the target tokens.
4. Backpropagate gradients through the model.
5. Use an optimizer to update the parameters.
6. Repeat across many batches.

No one writes a separate rule for every grammar pattern, fact, or coding convention. Gradient updates change many parameters so that continuations resembling the training distribution become more probable.

## Memorization and Generalization

The objective does not force a clean choice between memorization and generalization. A model can memorize some exact or near-exact sequences, especially when they are repeated or distinctive. It can also learn regularities shared across many examples and apply them to sequences it did not see during training. That second behavior is generalization.

Karpathy uses compression as an intuition: a model that predicts text well has captured structure in the data ([Deep Dive, around 00:50:22](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3022s)). The analogy is lossy rather than zip-like. Parameters can encode broad patterns, associations, and some exact strings without preserving every source as a recoverable record.

This is also why parameterized knowledge is not an authoritative or automatically current source. It reflects the training distribution and its time coverage, can combine conflicting patterns, and does not inherently retain provenance for a generated claim. A plausible continuation is not the same thing as a verified fact.

## Why Prediction Produces Broad Capability

Improving next-token prediction across web pages, books, code, papers, and conversations rewards representations of many latent regularities. Grammar helps predict sentences. Factual associations help predict encyclopedia-like passages. Program structure helps predict code. Dialogue conventions help predict conversations. Arithmetic and reasoning patterns can help predict worked examples.

The GPT-3 paper showed that a sufficiently large autoregressive model can adapt to many tasks from instructions or examples in its context, without a task-specific parameter update ([Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165)). This is in-context learning, discussed further in [Chapter 8](./08-prompting-and-in-context-learning.md).

These results do not establish human-like understanding in every sense, nor do they imply that every capability appears equally or reliably. They show that one predictive objective can produce internal representations that support many downstream behaviors.

## Capability Without Intention

Pretraining changes parameters to reduce prediction loss. It does not give the model an intrinsic commitment to being helpful, truthful, or safe. A base model learns statistical patterns of helpful answers, harmful passages, correct explanations, mistakes, and many other kinds of text. Which pattern it continues depends on its learned distribution and the prefix it receives, not on an independently formed intention.

Changing a prefix can therefore change the distribution of likely continuations. That fact is the basis of prompting and in-context learning, but conditioning on a prefix does not install a new training objective or a durable intent.

## Base Models and Assistant Models

The direct result of next-token pretraining is a base model. It can complete text, imitate formats, answer some questions, and reproduce many learned patterns. It has not necessarily been optimized to respond consistently as a helpful conversational assistant.

[Post-training](./07-post-training.md) further changes the model's output distribution, increasing the probability of behaviors such as instruction following, conversational helpfulness, and learned refusals. Those assistant behaviors are learned response tendencies, not proof of an inner intention and not guarantees of truth or safety.

## Key Takeaways

- Autoregressive language models are pretrained to predict each next token from preceding tokens.
- Training uses bounded token sequences; representing the entire dataset as one long stream is an illustrative implementation, not a universal requirement.
- Cross-entropy loss and gradient updates produce both memorization and generalization.
- Broad predictive capability does not create intrinsic intent or authoritative knowledge.
- Base models come from pretraining; assistant behavior is shaped further by post-training.
