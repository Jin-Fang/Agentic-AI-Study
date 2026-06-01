# Chapter 7: Post-Training

Pretraining teaches a model to predict text. Post-training shapes how it behaves as an assistant. Karpathy's introduction separates pretraining from fine-tuning and describes later stages that make a model more useful in dialogue and instruction-following settings ([Intro to LLMs, around 00:14:29](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=869s)).

This distinction is essential. A base model may be knowledgeable but not cooperative. An assistant model has been trained to respond to user requests in a more controlled style.

## Supervised Fine-Tuning

Supervised fine-tuning, or SFT, trains the model on examples of desired behavior: instructions paired with good responses, conversations, formatting patterns, tool-use demonstrations, or domain-specific tasks. This shifts the model from raw continuation toward following instructions.

The model is still predicting tokens, but the distribution has changed. It has seen many examples of assistant behavior, so a chat prompt elicits an assistant-like continuation.

For harness engineers, SFT explains why message format matters. Chat templates, role labels, system messages, and tool-call formats are part of the behavior the model was trained to imitate.

Karpathy frames fine-tuning as the stage that changes the model from a raw internet-document completer into an assistant model ([Intro to LLMs, around 00:14:29](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=869s)). In practice, this means the training data stops looking like arbitrary web pages and starts looking like conversations:

```text
User: Explain gradient descent.
Assistant: ...
```

or provider-specific chat templates that serialize the same roles into tokens. The model learns not only content but interaction style: answer the latest user, respect higher-priority instructions, format code blocks, refuse some requests, ask clarifying questions, and use tools when the format calls for it.

This is why base models and chat models can feel radically different even when they share architectural ancestry.

## Instruction Data Teaches Interfaces

Post-training can teach a model interface conventions. If tool calls appear in training data as JSON objects, the model learns that pattern. If hidden tests reward concise answers, the model learns concision. If safety data contains refusals, the model learns refusal patterns.

Harnesses should therefore align their interfaces with model training when possible:

- Use the provider's recommended chat format.
- Keep tool schemas close to examples the model likely saw.
- Provide demonstrations for unusual internal tools.
- Avoid inventing obscure syntax unless constrained decoding enforces it.
- Treat model upgrades as interface changes, not just capability changes.

## Preference Training and RLHF

Instruction-following models often use human preference data. In the InstructGPT work, labelers wrote demonstrations, ranked model outputs, and those rankings were used to train a reward model and optimize the policy with reinforcement learning from human feedback ([Training Language Models to Follow Instructions with Human Feedback](https://arxiv.org/abs/2203.02155)).

The operational result is a model that tends to produce outputs humans prefer: more helpful, more honest, less toxic, and more likely to follow instructions. It is not a formal proof of correctness or safety.

The classic RLHF shape has several pieces:

1. Train or start from an SFT assistant model.
2. Sample multiple candidate responses.
3. Collect human rankings or preferences.
4. Train a reward model to predict those preferences.
5. Optimize the assistant policy against that reward, usually with a constraint that keeps it near the reference model.

That reference constraint is important. Without it, policy optimization can push the model toward strange outputs that exploit the reward model rather than genuinely helping users.

Later methods optimize preferences more directly. Direct Preference Optimization reframes the same broad preference-learning problem as a simpler classification-style objective, avoiding a separately trained reward model and online RL loop in the same form ([Direct Preference Optimization](https://arxiv.org/abs/2305.18290)). It is still preference optimization, not a magic source of truth. Constitutional AI uses model feedback guided by principles to reduce reliance on human labels for some harmlessness training ([Constitutional AI](https://arxiv.org/abs/2212.08073)).

Karpathy's deep dive goes deeper into the reward-model framing. A reward model is itself another neural network trained to score outputs according to preference data ([Deep Dive, around 02:52:39](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10359s)). Its output can be a single scalar score that says, in effect, how much the reward model prefers a candidate response.

The main model can then be optimized against this learned reward signal. This is powerful because human judgments are expensive: once the reward model exists, it can score many samples more cheaply than asking humans every time. But it is also dangerous because the reward model is only an approximation.

Karpathy describes this approximation as a lossy simulation of human preference ([Deep Dive, around 03:00:54](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10854s)). A lossy simulator can be optimized against, but it can also be exploited.

## Reward Hacking

If an optimizer is allowed to push too hard against an imperfect reward model, it may find outputs that score well but are not actually good. Karpathy discusses this as reward hacking: the model discovers artifacts that the reward model likes even when humans would not ([Deep Dive, around 03:04:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11051s)).

Harness engineers should recognize the same pattern outside RLHF:

- A model grader can be gamed by verbose but shallow answers.
- A citation checker can be gamed by citing many irrelevant sources.
- A unit-test-only coding eval can be gamed by overfitting tests.
- A "helpfulness" metric can be gamed by confident speculation.
- A support bot can optimize for fast closure instead of correct resolution.

Every proxy metric becomes a target. The harness should include adversarial cases, human review, and multiple signals when the workflow matters.

## Verifiable and Unverifiable Rewards

Some tasks have clear rewards. A unit test passes. A JSON schema validates. A chess engine reports a legal move. Other tasks are preference-heavy: write a good explanation, give helpful advice, decide whether an answer is safe.

Karpathy distinguishes reinforcement learning in verifiable settings from reinforcement learning in unverifiable or preference-based settings ([Deep Dive, around 02:51:33](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10293s)). Harnesses should do the same. When an objective can be made verifiable, make it verifiable. Do not ask the model to merely sound right when a tool can check the result.

This verifiable-reward setting is also the engine behind modern *reasoning models*. When a task has a checkable answer, a model can be trained with reinforcement learning to produce long internal reasoning before committing to a result. [Chapter 8](./08-prompting-and-in-context-learning.md) covers what that means for prompting and harness design; the point here is that it is a post-training technique built on verifiable rewards, not a new architecture.

## Behavior Is Not Capability

Post-training can reveal, suppress, or redirect capabilities learned during pretraining. A model may know how to write exploit code but refuse to provide it. It may be able to solve a math problem but fail because the assistant behavior encourages a quick fluent answer instead of careful computation. It may be trained to use tools in a particular format but fail with a slightly different schema.

Harness engineers should separate:

- What the model can represent.
- What the model is inclined to output.
- What the product policy allows.
- What the harness permits as an action.

Confusing these layers leads to bad designs. A refusal is not proof that the model lacks the capability. A confident answer is not proof that the model knows the fact. A tool-call string is not proof that the action should run.

Jailbreaks illustrate this separation. Karpathy shows examples where adversarial prompts or multimodal inputs can push a model away from its safety behavior ([Intro to LLMs, around 00:46:16](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2776s)). The important lesson is not a specific attack string. The lesson is that safety behavior is learned and mediated by context. It should be reinforced by harness controls such as policy checks, permission boundaries, and tool gating.

## Fine-Tuning vs Harnessing

Fine-tuning changes the model. Harnessing changes the environment around the model. Many problems should be solved in the harness first:

- Need current documents? Use retrieval.
- Need exact computation? Use a tool.
- Need a stable output format? Use schema validation and examples.
- Need safer side effects? Use permissions and sandboxing.
- Need task reliability? Build evals and traces.

Fine-tuning is powerful when behavior must be internalized across many calls or when latency makes long prompts impractical. It is not a substitute for source-of-truth state, execution control, or verification.

## Key Takeaways

- Pretraining creates broad next-token competence; post-training shapes assistant behavior.
- SFT teaches examples of desired responses.
- RLHF and preference optimization steer outputs toward preferred behavior.
- Harnesses should not confuse model behavior with guaranteed truth, permission, or execution.
