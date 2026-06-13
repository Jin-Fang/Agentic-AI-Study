# Chapter 14: The Operational Mental Model

Harness engineering becomes easier when the model is placed in the right mental box. An LLM is not a database, not a shell, not a browser, not a long-term memory store, and not an autonomous worker by itself. It is a conditional token generator with broad learned competence. The harness turns that generator into a useful system.

## The Model-Harness Map

Use this map when deciding where a responsibility belongs:

| Need | Model Role | Harness Role |
|------|------------|--------------|
| Understand a task | Interpret provided context | Provide clear instructions and relevant state |
| Use facts | Reason over supplied evidence | Retrieve, cite, refresh, and verify sources |
| Compute exactly | Suggest approach or code | Execute tools and validate outputs |
| Remember across turns | Consume summarized state | Persist state outside the model |
| Take action | Emit proposed tool call | Authorize, execute, log, and rollback |
| Stay safe | Follow trained policies | Enforce permissions and sandboxing |
| Improve reliability | Generalize from examples | Run evals and regression tests |

The model is a reasoning and generation component. The harness is the operating environment.

## Capability Is Jagged

Model capability is uneven, not a single dial. The same model that solves a hard, multi-step proof can fail a trivially easy task right next to it: it can write a working sorting algorithm but miscount the letters in a word, or design a database schema but botch simple arithmetic. This "jagged" or Swiss-cheese profile means competence on one task says little about the holes nearby.

The practical consequence: do not extrapolate from "it's strong on this" to "it won't fail on that." Find the failure-prone subtasks empirically (see [Chapter 13](./13-evaluation-for-llm-behavior.md)) and put a harness control on each one — a tool for exact counting or arithmetic, a validator for format, a verification step for facts — rather than trusting the model to clear the whole task because it looks capable. The earlier chapters name the specific holes: tokenization breaks character-level and arithmetic tasks (see [Chapter 2](./02-tokenization.md)), and parametric memory is uneven across popular and rare facts (see [Chapter 5](./05-training-data-and-scaling.md)).

## Design From Failure Modes

Each LLM property implies a harness control:

- Token limits imply context budgeting.
- Probabilistic decoding implies validation and regression tests.
- Parametric knowledge implies retrieval for fresh or private facts.
- Hallucination implies source discipline and verification.
- Long tasks imply external state and compaction.
- Tool power implies permission boundaries.
- Model upgrades imply eval suites.

This is the practical bridge from LLM foundations to harness engineering.

## Cost Mental Model

Cost shows up in every chapter; this section collects it into one model so a workflow can be priced before it ships.

Start with the unit prices. Providers bill input, output, and reasoning tokens at different rates, and output (including a reasoning model's hidden tokens) is usually the most expensive — output tokens also feed back into the next step's input (see [Chapter 6](./06-inference-and-sampling.md)), and a reasoning model can emit thousands of hidden tokens before its first visible word (see [Chapter 8](./08-prompting-and-in-context-learning.md)). Cached prefix tokens are billed separately: a cache read is much cheaper than fresh input, but writing the cache and busting it by editing an early token costs full price (see [Chapter 9](./09-context-window-and-kv-cache.md)). Token count itself depends on tokenization (see [Chapter 2](./02-tokenization.md)), and the advertised model size no longer predicts per-token price once Mixture-of-Experts and deployment-optimal serving enter the picture (see [Chapter 4](./04-transformer-attention.md) and [Chapter 5](./05-training-data-and-scaling.md)).

From unit prices, estimate per-workflow unit cost. For each call, multiply expected input, output, and reasoning tokens by their rates, subtract the share served from cache, then multiply by the number of calls per task. A RAG step that retrieves 8k tokens of context on every turn, or an agent loop that re-sends a growing transcript, can dominate the bill even when each individual answer is short.

Then cap and route. Set a per-task or per-session token budget and decide what happens when it is exceeded: fall back from an expensive model to a cheap one, drop to a tool that answers exactly instead of paying the model to reason, or stop and ask for human input. The same routing that picks a reasoning model for hard problems should pick a small model for simple extraction (see [Chapter 6](./06-inference-and-sampling.md)). Degraded routing is a feature, not a failure: a cheaper path that still completes the task beats an expensive path that blows the budget.

## The Lecture's Final Practical Advice

Karpathy ends the deep dive with a pragmatic warning: use these systems as tools, but do not fully trust them ([Deep Dive, around 03:09:24](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11364s), [03:30:42](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=12642s)). That is also the harness engineer's stance.

The model is useful because it can compress patterns, interpret language, draft code, transform text, reason over supplied evidence, and coordinate tools. It is unsafe to trust blindly because it can hallucinate, misread context, overfit prompts, follow injected instructions, misuse tools, or optimize the wrong proxy.

The right posture is neither dismissal nor worship. It is system design.

## Multimodal and Agentic Extensions

The same foundations extend to multimodal systems. Karpathy describes audio and image inputs as representations that can be tokenized or otherwise fed into the model's sequence-processing machinery ([Deep Dive, around 03:09:57](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11397s)). For harness engineering, this means screenshots, images, audio, video, and documents all need representation choices.

A browser agent might use:

- screenshot pixels,
- OCR text,
- DOM trees,
- accessibility nodes,
- network logs,
- or direct browser actions.

Each representation creates different strengths and blind spots. A screenshot may show visual layout but hide DOM metadata. A DOM tree may expose structure but miss visual overlap. OCR may miss small text. The harness should choose representation based on task and evaluate it.

A few multimodal specifics carry operational weight (see [Chapter 2](./02-tokenization.md) for how images become tokens):

- **Image tokens cost money, and resolution drives the count.** Models tile a large image into patches, so a high-resolution screenshot can cost many times more tokens than a thumbnail. Downscaling saves budget but introduces a "can't read small text" blind spot — fine print, dense tables, and tiny UI labels blur out. When exact text matters, pair the image with OCR or the DOM/accessibility tree instead of asking vision to read pixels.
- **Images are an untrusted-input slot too.** A screenshot or uploaded document can carry hidden instructions — text embedded in the image, faint or off-color, or a caption crafted to read as a command. This is multimodal prompt injection: treat image and audio content with the same delimiting and least-privilege discipline as untrusted text, and never let it authorize a tool call.
- **Audio and video add latency and cost overhead.** They expand into long token sequences and often require transcription or frame sampling before the model sees them, so budget for the extra round trip and consider whether a cheaper representation (a transcript, a few keyframes) answers the task.

Long-running agents add another layer. Karpathy points toward agents that perform tasks over time while humans supervise many of them ([Deep Dive, around 03:11:58](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11518s)). That future depends less on a single clever prompt and more on durable infrastructure: state, tools, evals, permissions, traces, checkpoints, and human control surfaces.

## A Good Harness Makes the Right Thing Easy

The model should not need to infer everything from a messy context. A good harness narrows the action space and presents the right information at the right time.

It should:

- Keep durable state in files, databases, or task records.
- Present compact, current context to the model.
- Expose tools with clear affordances.
- Validate structured outputs.
- Separate untrusted content from instructions.
- Record traces for debugging.
- Run evals before changing prompts, tools, models, or retrieval.

The harness is not only a wrapper. It is the difference between a fluent model call and a system that can do work.

## Checklist for Harness Decisions

When designing a workflow, ask:

- **What is the source of truth?** If it is not the model, retrieve or query it.
- **What must be exact?** Use tools, validators, or tests.
- **What can be approximate?** Let the model draft, rank, summarize, or propose.
- **What is untrusted?** Delimit it and prevent it from controlling tools.
- **What is durable?** Store it outside the prompt.
- **What is expensive?** Measure token and latency cost.
- **What can go wrong?** Add eval cases and traces.
- **What needs approval?** Put a human checkpoint before irreversible effects.

This checklist turns LLM foundations into engineering practice.

## What to Remember

If you remember only one sentence, remember this:

**The model predicts tokens; the harness owns context, state, tools, permissions, verification, and consequences.**

That sentence is the foundation for the companion harness engineering book. It explains why context engineering matters, why tool design matters, why sandboxing matters, and why evaluation must measure the full loop.

## Key Takeaways

- Put each responsibility on the right side of the model-harness boundary.
- Use model properties to derive harness controls.
- Build systems that ground, verify, and constrain model output.
- Treat LLM fundamentals as operational knowledge, not academic background.
