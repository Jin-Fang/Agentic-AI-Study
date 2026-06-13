# Chapter 3: Next-Token Prediction

The pretraining objective for an autoregressive language model is deceptively simple: given previous tokens, predict the next token. During training, the model sees many windows of text and learns to assign higher probability to the actual continuation. Karpathy explains this by taking windows of tokens from a large dataset and training the model to predict what comes next ([Deep Dive, around 00:15:36](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=936s)).

This objective is simple enough to scale and broad enough to absorb structure from language, code, facts, dialogue, reasoning traces, documentation, and many other text forms.

## Prediction Is Not Memorization

The model is not storing every document verbatim. It is learning statistical structure that helps it compress and predict text. Some memorization can occur, especially for repeated or unique strings, but the useful capability comes from generalization: syntax, facts, styles, procedures, APIs, analogies, and patterns of reasoning.

The GPT-3 paper demonstrated that a sufficiently large autoregressive model can perform many tasks from prompts alone, without task-specific fine-tuning, by conditioning on instructions or examples in the context ([Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165)). That is the phenomenon harness engineers use every day when they give a model a task description, examples, tool results, and a desired output format.

## Why the Objective Produces General Capability

To predict the next token well across web text, books, code, papers, and conversations, a model must learn many latent regularities. It must learn grammar to predict sentences. It must learn facts to continue encyclopedia-like passages. It must learn code structure to predict programs. It must learn dialogue patterns to continue conversations. It must learn some arithmetic and reasoning patterns because those patterns appear in text.

This does not mean the model has human-like understanding in every sense. It means the predictive task pressures the model to build internal representations that are useful for many downstream behaviors.

For harness engineering, the important point is operational: the model is excellent at continuing patterns. If the harness supplies a clean pattern of task, evidence, constraints, and output shape, the model can often continue that pattern productively. If the harness supplies a confused mixture of stale context, irrelevant retrieval, contradictory instructions, and noisy logs, the model will continue that too.

## The Dataset Becomes One Long Token Stream

In the deep dive, the cleaned web dataset is first converted by the tokenizer into a very long sequence of tokens ([Deep Dive, around 00:14:34](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=874s)). Training does not operate on "documents" in the human sense. It samples windows from this token stream.

The model receives a prefix window and is asked to predict the next token at many positions. If the window is:

```text
The capital of France is
```

then the training target at the next position may be the token for ` Paris`. But the same mechanism applies to code, dialogue, mathematical derivations, tables, and Markdown headings. There is no separate symbolic rule engine. The training signal is always expressed through token prediction.

This explains why representation quality matters so much. If a dataset contains messy boilerplate, duplicated pages, spam, or broken extraction artifacts, the model spends capacity learning those patterns too.

## Loss and Gradient Updates

Training uses a loss function: a number that is lower when the model assigns higher probability to the correct next tokens. Concretely it is the average negative log-probability of the correct next token, known as cross-entropy or negative log-likelihood. Its exponential is perplexity, a more intuitive scale: a perplexity of 10 means the model is on average as uncertain as if choosing uniformly among 10 tokens. The same per-token log-probabilities are the logprobs engineers see in model APIs, so the training loss and inference-time logprobs are the same quantity viewed from two sides. Karpathy explicitly frames loss as the single number the training process tries to reduce ([Deep Dive, around 00:35:58](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=2158s)). The optimizer updates model parameters so future predictions become more consistent with the data.

The loop is:

1. Sample a batch of token windows.
2. Run the model to predict token distributions.
3. Compare predictions with the actual next tokens.
4. Compute loss.
5. Backpropagate gradients.
6. Update parameters.
7. Repeat at huge scale.

The "intelligence" is not hand-coded. It emerges from many small parameter updates that make the model better at compressing and predicting the training distribution.

## Compression as a Mental Model

Karpathy uses compression as an intuition: a model that predicts text well has captured structure in the data. It is not lossless compression like a zip file; it is a lossy compression of statistical regularities ([Deep Dive, around 00:50:22](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3022s)). That lossy nature is important.

The model may preserve the broad pattern of an API, the style of documentation, or a famous fact. It may not preserve a rare exact string, the latest version of a policy, or a private repo convention. Harnesses should therefore distinguish "the model has probably seen patterns like this" from "the model has authoritative access to this fact."

## Capability From Prediction, Not Intention

Because the objective is prediction, the model learns behavior before it has explicit goals. A base model can imitate a helpful answer because helpful answers appear in text. It can imitate unsafe text because unsafe text appears too. It can write code because code appears. It can reason through examples because reasoning traces appear.

Post-training later changes which continuations are preferred, but the base capability comes from predictive training. This is why prompt design is powerful: a prompt places the model into a pattern. It is also why prompt design is fragile: the model may continue an unintended pattern if the context suggests one.

## Pretraining Creates Base Models

The result of next-token pretraining is a base model. A base model can complete text, imitate formats, answer some questions, and follow patterns. It is not necessarily a safe or helpful assistant. It may continue a harmful instruction, produce arbitrary completions, or switch styles unexpectedly because it was trained to predict text, not to satisfy a user's intent.

This distinction matters. Many behaviors people associate with "ChatGPT" are not produced by pretraining alone. They come from [post-training](./07-post-training.md), which changes the model's behavior toward instruction following, conversational helpfulness, refusal policies, and preference alignment.

## Harness Implications

Because the model continues context, the harness should make the desired continuation obvious:

- Put the current task near the point where the model must act.
- Separate instructions from data.
- Remove stale or contradictory context.
- Provide examples when output format matters.
- Avoid mixing untrusted text with high-priority instructions.
- Treat retrieved text as evidence, not as authority over system behavior.

The model's pretraining gives it broad competence. The harness turns that competence into controlled work.

## Models Compute With Tokens

Each forward pass does a bounded amount of compute per position, so the model cannot do arbitrarily long computation inside a single token. Asking it to multiply two large numbers "in its head" forces all the work into one step and it often fails. The reliable fixes are to give the model more tokens to spread the work across, or to move the exact computation outside the model. Chain-of-thought and reasoning models do the former: intermediate tokens become scratch space, so a hard problem is solved over many forward passes instead of one. Tool use does the latter: a calculator or code interpreter performs the exact computation and the model reads back the result. This is the shared reason behind all three techniques, covered later in [prompting](./08-prompting-and-in-context-learning.md) and [reasoning, tools, and agents](./12-reasoning-tools-and-agents.md).

## Key Takeaways

- Autoregressive LLMs are trained to predict the next token from previous tokens.
- The objective is simple, scalable, and surprisingly general.
- Base models are not the same as assistant models.
- Harnesses work by shaping the context that the model continues.
