# Chapter 12: Reasoning, Tools, and Agents

LLMs can generate reasoning-like text, but they cannot directly observe or change the world. Tools bridge that gap. A tool lets the harness expose an operation such as search, file read, code execution, database query, browser action, or message send.

Karpathy's introduction discusses tool use and retrieval as ways to augment models beyond pure text generation ([Intro to LLMs, around 00:41:33](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2493s)). Research systems such as ReAct show how language models can interleave reasoning traces with actions and observations ([ReAct](https://arxiv.org/abs/2210.03629)). Toolformer explores training models to decide when and how to call APIs ([Toolformer](https://arxiv.org/abs/2302.04761)).

## Tool Use Is a Protocol

The model does not call a tool by itself. It emits a representation of a call. The harness parses it, validates it, executes it, and returns an observation. This protocol defines the agent loop:

1. The harness sends task context and available tools.
2. The model chooses text or a tool call.
3. The harness validates and executes allowed calls.
4. The harness returns observations.
5. The loop continues until a stopping condition.

Every step is a design surface.

Karpathy's intro makes the point with ordinary human problem solving: when people face tasks, they do not only think internally; they use browsers, calculators, notebooks, image tools, and other aids ([Intro to LLMs, around 00:32:11](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1931s)). Modern assistants follow the same pattern. The model's token generation becomes a controller for external capabilities.

This is why "the model can browse" is shorthand. The model cannot browse in isolation. The product gives it a browser-like tool, decides what pages it may open, converts observations into context, and handles failures.

## Tools Extend the Model Along Different Axes

Tools can compensate for different model limits:

- **Search/retrieval** compensates for stale or missing knowledge.
- **Code execution** compensates for exact computation and repeatable transformation.
- **Browsers** compensate for live web interaction.
- **File tools** compensate for local project state.
- **Image generators** provide a separate generative modality.
- **Vision tools** or multimodal encoders provide visual observation.
- **Databases** provide structured source-of-truth state.

Karpathy's examples include browser-like lookup and image generation as tools around the language model ([Intro to LLMs, around 00:28:20](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1700s), [00:32:42](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1962s)). The harness decides how these tools are represented and when their outputs are trusted.

## Reasoning vs Acting

Reasoning text can help the model plan, decompose, and track state. Actions let it gather new information or change external state. ReAct's core insight is that reasoning and acting reinforce each other: thoughts guide actions, and observations update thoughts.

Harness engineers should not assume that a single final answer is enough for complex tasks. Many tasks require:

- Inspecting local state.
- Trying commands.
- Reading errors.
- Updating plans.
- Retrying after failures.
- Verifying the result.

The harness makes this iterative process possible.

The loop should be explicit enough to debug. If an agent fails, the trace should show:

- what task it believed it was solving,
- what plan it formed,
- what tool it chose,
- what arguments it passed,
- what observation it received,
- how it updated its plan,
- and why it stopped.

Without this trace, a tool-using agent is nearly impossible to improve systematically.

## Tool Design Matters

Bad tools produce bad agents. A model given hundreds of ambiguous tools must spend context and probability mass deciding what each tool does. A model given a few high-affordance tools can work more reliably.

Good tool design includes:

- Clear names.
- Precise descriptions.
- Simple schemas.
- Useful errors.
- Concise outputs.
- Permission boundaries.
- Idempotent dry-run modes where appropriate.
- Stable handles for large artifacts.

The tool output should tell the model what changed and what to do next when something fails.

Tool descriptions should also teach constraints. For example, a `search_docs` tool should say whether it searches titles only or full text, whether it respects permissions, and what "no results" means. A `run_tests` tool should say whether it runs all tests or a subset, and whether success output is suppressed. A `send_email` tool should require confirmation if the action is irreversible.

Good tool APIs are closer to product workflows than raw backend endpoints. `schedule_meeting` is often better than `list_users`, `list_calendars`, `create_event`, and `send_invite` as separate low-level tools unless the agent genuinely needs that control.

## Long-Running Agents

Near the end of the deep dive, Karpathy points toward long-running agents: systems that perform tasks over time, with humans supervising more agents rather than manually doing every step ([Deep Dive, around 03:11:58](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11518s)). Long-running agents are not just longer prompts. They require durable state and operational discipline.

A long-running harness needs:

- a task record,
- checkpoints,
- resumable tool state,
- permissions that survive across steps,
- clear human approval points,
- failure recovery,
- cost budgets,
- and final verification.

The model may be stateless between calls. The agent should not be.

## Safety and Side Effects

The more powerful the tool, the stricter the harness must be. Reading a public page is different from deleting a production database row. The model's fluency should not bypass authorization.

Controls include:

- Sandboxing.
- Allow and deny lists.
- Human approval for dangerous actions.
- Network and filesystem scoping.
- Secrets isolation.
- Audit logs.
- Rollback strategies.

The model can propose. The harness must decide what is allowed.

## Human Supervision

The future agent pattern is not necessarily "no humans." It is often "humans supervise at higher leverage." A harness should make supervision cheap and meaningful:

- summarize what the agent has done,
- expose the evidence behind decisions,
- ask for approval before irreversible actions,
- provide rollback paths,
- and make it clear when the agent is uncertain.

Human-in-the-loop design is part of the harness, not an afterthought.

## Key Takeaways

- Tool use is mediated by a harness protocol.
- Reasoning and acting form an iterative loop for complex tasks.
- Tool schema, naming, output size, and errors shape agent behavior.
- Safety controls belong in the harness, not in model intent alone.
