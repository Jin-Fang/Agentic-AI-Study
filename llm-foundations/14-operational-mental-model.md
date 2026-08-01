# Chapter 14: The Operational Mental Model

## A Synthesis of the Book

An LLM is a conditional token generator with broad learned competence. Given an encoded context, it produces a distribution over the next token; repeated selection turns that distribution into text or a structured proposal. Training shapes its parameters, prompting conditions a particular inference, and decoding introduces choices about how a continuation is selected. None of those mechanisms turns the model into a database, a persistent state store, an authority over external facts, or an executor of real-world actions.

The earlier chapters developed that picture in stages. [Chapters 1–7](./01-llm-as-token-machine.md) explained the model's core mechanisms, from tokens and next-token prediction through attention, training, inference, and post-training. [Chapters 8–13](./08-prompting-and-in-context-learning.md) examined prompting, context, knowledge, retrieval, tool calls, and evaluation while marking where model behavior ends and system responsibility begins. This final chapter collects those boundaries into one operational mental model.

## The Model–System Responsibility Boundary

Six model properties determine where the boundary belongs:

| Model Property | What the Model Can Do | What the External System Must Do |
|---|---|---|
| Generation is conditioned only on the encoded current context. | Interpret and transform the representations supplied in that context. | Select, assemble, and serialize the context the model receives. |
| Context is finite, and the model has no persistent state of its own. | Use information that is represented in the current call. | Persist state outside the model and decide what to reintroduce later. |
| Parametric knowledge is incomplete and can become outdated. | Recall learned patterns and reason over supplied evidence. | Obtain authoritative or current facts from external sources. |
| Capability is jagged, and generation is probabilistic. | Produce useful candidate answers across a broad range of tasks. | Verify requirements that demand exactness or reliability; use evaluation to measure behavior rather than assuming that evaluation itself improves it. |
| A tool call is an output, not an external effect. | Propose an action or emit structured arguments. | Authorize, validate, and execute the action, and own its consequences. |
| The model can confuse data with instructions. | Follow learned instruction and safety behavior, lowering—but not eliminating—the probability of unsafe proposals. | Establish trust boundaries and control permissions and real-world effects outside the model. |

The boundary is not a judgment about whether the model is “intelligent.” It follows directly from what computation the model performs and what it does not control.

## Capability Is Jagged

Model capability is uneven, not a single dial. A model may solve a difficult multi-step proof yet miscount the letters in a word, or write a sound database schema yet make a simple arithmetic error. This “jagged” or Swiss-cheese profile means success on one task does not establish reliability on a nearby task.

Tokenization helps explain some character-level weaknesses ([Chapter 2](./02-tokenization.md)), and uneven training coverage helps explain some knowledge gaps ([Chapter 5](./05-training-data-and-scaling.md)). But the important operational lesson is broader: capability claims need representative, repeated evidence, as discussed in [Chapter 13](./13-evaluation-for-llm-behavior.md), and exact requirements still need verification outside the model.

## From Foundations to Agent Harness

This book explains why those external responsibilities exist. The companion [*Agent Harness: A Practitioner's Textbook*](../agent-harness/README.md) explains how systems can implement them:

- Context selection and durable state: [Context as a Finite Resource](../agent-harness/03-context-as-finite-resource.md), [Compaction, Memory, and Context Handoffs](../agent-harness/05-compaction-memory-context-handoffs.md), and [State, Event Histories, and Production Factors](../agent-harness/10-state-event-history-production-factors.md).
- Actions and external effects: [Tools and the Invocation Lifecycle](../agent-harness/06-tools-invocation-lifecycle.md).
- Trust, permissions, and containment: [Sandboxing, Guardrails, and Runtime Enforcement](../agent-harness/07-sandboxing-runtime-enforcement.md).
- Reliability measurement: [Evaluation](../agent-harness/11-evaluation.md).
- Model selection, routing, cost, and operations: [Model Selection, Routing, and Reasoning Budgets](../agent-harness/08-model-selection-routing-reasoning.md) and [AgentOps](../agent-harness/18-agentops.md).

The same boundary applies to multimodal systems: the model receives encoded representations of text, images, audio, or video—not the world itself; representation choices are covered in [Computer-Use and Multimodal Agents](../agent-harness/15-computer-use-multimodal-agents.md), and their trust implications in [Sandboxing, Guardrails, and Runtime Enforcement](../agent-harness/07-sandboxing-runtime-enforcement.md).

## What to Remember

Karpathy ends the deep dive with a pragmatic warning: use these systems as tools, but do not fully trust them ([Deep Dive, around 03:09:24](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11364s), [03:30:42](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=12642s)). The right posture is neither dismissal nor worship. It is to use the model's broad competence while assigning authority, persistence, verification, and consequences to the system that can actually provide them.

If you remember only one sentence, remember this:

**The model predicts tokens; the harness owns context, state, tools, permissions, verification, and consequences.**

## Key Takeaways

- Assign responsibilities to the correct side of the model–system boundary.
- Derive that boundary from model properties, not from the fluency of an output.
- Do not mistake a capable model response for a reliable system.
