# Glossary

Concise definitions for terms used throughout this textbook. The chapter reference points to where each term is discussed in depth; for the source behind a definition, follow that chapter's inline citations and the [References](./references.md).

---

## Core Concepts

**Agent** — A language model plus the system that lets it do real work: browse a codebase, run code, call tools, recover from errors, and sustain multi-step tasks. Captured by the equation *Agent = Model + Harness* (Ch 1).

**Agent harness** — Everything engineered around the model: system prompts, tools and their descriptions, bundled infrastructure, sub-agent orchestration, control flow, hooks/middleware, and evaluation infrastructure (Ch 1).

**Agent loop** — The core execution cycle: assemble context → model emits a tool call or a final answer → harness executes the call → append the result to context → repeat until done (Ch 1).

**Augmented LLM** — A model equipped with retrieval, tools, and memory, able to generate its own queries, select tools, and decide what to retain. The basic building block of an agent (Ch 1, 6).

**ACI (agent–computer interface)** — The design surface between an agent and its tools, by analogy with HCI: as much engineering should go into how an agent uses tools as into how a human uses a screen (Ch 4).

**Builder harness** — The system prompt and tools shipped by an AI lab as part of a coding-agent product; the middle of the three concentric harness rings (Ch 1).

**User harness** — The AGENTS.md files, hooks, skills, and review agents a team adds on top of a coding agent to fit its own codebase; the outer ring (Ch 1).

**Harness engineering** — Iterating on the whole system around the model — not just one prompt — so that each observed failure is permanently engineered out (Ch 1).

**Binding-constraint thesis** — The claim that long-horizon agent reliability is often limited by harness layers — execution, tools, context, lifecycle, observability, verification, and governance — rather than by model capability alone (Ch 1, 12).

**ETCLOVG** — A seven-layer taxonomy for agent harness engineering: Execution environment, Tool interface, Context, Lifecycle, Observability, Verification, and Governance (Ch 1).

**Context engineering** — Curating the smallest set of high-signal tokens in the context window during inference; the practice one level below harness engineering (Ch 1, 2).

**MCP (Model Context Protocol)** — An open client–server standard for exposing tools, resources, and prompts to agents, so any compatible client can discover and call them without bespoke integration (Ch 4).

**A2A (Agent-to-Agent protocol)** — A protocol boundary for delegation among opaque agentic applications; complementary to MCP, which primarily exposes tools and context to one agent runtime (Ch 4).

**Protocol boundary** — The integration line a tool or agent standard crosses: model-to-function, agent-to-external-capability, agent-to-agent, or agent-to-repo/environment (Ch 4).

**Tool call** — Structured output (typically JSON) in which the model names a tool and its arguments. Deterministic harness code decides what to do with it (see Foundations ch 12) (Ch 4, 9).

**Structured output** — Model output constrained into a machine-readable shape, usually JSON or XML, so software can parse it reliably. Tool calls are the agent-specific case (see Foundations ch 12) (Ch 1, 4, 9).

---

## Context and Memory

**Context window** — The finite span of tokens a model can attend to in a single inference call (see Foundations ch 9). In a harness it is a budget every system prompt, tool result, and history turn competes for (Ch 2).

**Context rot** — The degradation of a model's ability to recall and use information accurately as the context grows longer (see Foundations ch 9). The harness angle: it is the binding operating constraint, framed here as an attention budget (Ch 2).

**Attention budget** — The framing of context as a finite resource that every added token spends (Ch 2).

**KV-cache** — A cache of the key/value tensors for already-processed tokens (see Foundations ch 9). Identical context prefixes can be served from it, cutting time-to-first-token and cost roughly tenfold; in a harness, prefix stability becomes a production cost lever (Ch 2).

**Prefill / decode** — Prefill is processing the input prompt; decode is generating output tokens (see Foundations ch 9). Agentic workloads are heavily prefill-skewed (~100:1 input-to-output) (Ch 2).

**Lost-in-the-middle** — The tendency of models to attend less reliably to information in the middle of a long context than to its start or end (see Foundations ch 9) (Ch 2, 3).

**Compaction** — Summarizing a conversation near its context limit and reinitiating a fresh window with the summary. Lossy (see Foundations ch 9) (Ch 3).

**Context reset** — Clearing the context entirely and starting a fresh agent with a structured handoff — distinct from in-place compaction (Ch 7).

**Just-in-time retrieval** — Loading data into context on demand via lightweight references (file paths, queries, links) rather than pre-embedding everything up front (Ch 2).

**Recitation** — Repeatedly rewriting a goal or todo list into the end of context so it stays in the model's recent attention span (Ch 3).

**Structured note-taking (agentic memory)** — Having the agent write progress notes to disk so they can be reloaded after a context reset (Ch 3).

**MemGPT** — A memory architecture that treats the context window as OS-style "main memory" and external stores as "disk," letting the model page information in and out via function calls (virtual context management) (Ch 3).

**Mem0** — A memory layer that dynamically extracts, consolidates, and retrieves salient facts across sessions, with an optional graph variant for entity relations (Ch 3).

**Sleep-time compute** — Processing context offline between requests — anticipating likely queries and precomputing inferences — to cut the compute a later query needs (Ch 3).

---

## Sub-Agents and Workflows

**Sub-agent** — A specialized agent that handles a focused task in its own context window and returns only a condensed summary to its parent (Ch 3).

**Context firewall** — The property of the sub-agent pattern by which the parent never sees a sub-agent's intermediate noise, only its condensed result (Ch 3).

**Orchestrator-workers** — A workflow where a central LLM dynamically decomposes a task, delegates to worker LLMs, and synthesizes their results (Ch 6).

**Evaluator-optimizer** — A workflow where one LLM generates and another critiques, in a loop, until evaluation criteria are met (Ch 6).

**Micro-agent** — A small, focused agent (≈3–20 steps) embedded in an otherwise deterministic workflow, rather than an open-ended "loop until done" agent (Ch 6, 9).

**Multi-agent topology** — The coordination shape of a multi-agent system: orchestrator–worker, hierarchical, blackboard/shared-memory, or debate/voting (Ch 3, 6).

**MAST (Multi-Agent System failure taxonomy)** — An empirical taxonomy of 14 multi-agent failure modes in three categories: specification issues, inter-agent misalignment, and task verification (Ch 3).

**Reasoning / self-correction patterns** — Single-agent deliberation patterns that trade tokens for reliability: Reflexion (self-critique memory), Self-Refine (critique-and-revise), CRITIC (tool-grounded critique), Tree of Thoughts and LATS (branching search), and ReWOO (plan-then-execute) (Ch 6).

---

## Tools and Sandboxing

**Namespacing** — Grouping related tools under common prefixes (`asana_*`, `browser_*`) to prevent name collisions and enable group-level masking (Ch 4).

**Action masking** — Keeping the full tool set stable in context while constraining which actions can be selected in a given state (Ch 2).

**Progressive disclosure** — Loading tool definitions, files, or instructions only when needed, rather than all up front (Ch 4).

**Skill** — A reusable, file-backed capability (often a `SKILL.md` plus supporting code) that an agent can load on demand (Ch 4).

**Code execution (as a meta-tool)** — Presenting tools as a code API the agent invokes by writing code, rather than as direct calls — sharply reducing token cost (Ch 4).

**Shell** — A command-line interface such as Bash or zsh. In agent systems, shell access is powerful because it lets the agent run tests, inspect files, install packages, and compose ad hoc tools (Ch 1, 4, 5).

**Filesystem** — The directories and files the agent can read or write. It acts as workspace, durable memory, and a collaboration surface between agents and humans (Ch 1, 2, 5).

**Sandbox** — An isolated environment, with filesystem and network boundaries, within which an agent can act freely without per-action approval prompts (Ch 5).

**Sandbox liveness** — The sandbox's role as an authorization region: it lets an agent act without per-action approval prompts while staying inside configured boundaries (Ch 5).

**Governance** — Harness mechanisms for identity, permission policy, scoped credentials, human approval, audit logs, and cross-layer security accountability (Ch 5, 18).

**Delegated auth** — A pattern where the agent acts through scoped credentials or a proxy-authorized identity rather than inheriting the user's full ambient authority (Ch 5).

**Supply-chain provenance** — Evidence about the origin and integrity of tools, packages, datasets, MCP servers, and retrieval sources the agent depends on (Ch 5, 18).

**Hook / middleware** — Harness-executed scripts or checkpoints that run automatically on lifecycle events (start, post-tool-call, stop), enforcing rules deterministically (Ch 5).

**Feedforward / feedback** — Feedforward controls (guides) steer the agent before it acts; feedback controls (sensors) observe after it acts and help it self-correct (Ch 5).

**Computational / inferential control** — Computational controls (linters, type checkers) are deterministic and fast; inferential controls (AI review, LLM-as-judge) handle nuance but are slower and non-deterministic (Ch 5).

**Ambient affordances** — Properties of the environment itself (strong typing, clear module boundaries, opinionated frameworks) that make a codebase legible and tractable to agents (Ch 5).

**CI (continuous integration)** — Automated checks that run around code changes, usually tests, linters, builds, and deployment gates. In harness design, CI-like checks become feedback sensors (Ch 5, 10).

**Linter / type checker** — Deterministic tools that detect style, syntax, structural, or type errors before runtime. They are common computational sensors in an outer harness (Ch 5).

**Prompt injection** — An attack in which instructions hidden in content the agent reads (a web page, a file, a tool result) are interpreted by the model as commands (see Foundations ch 8, ch 12) (Ch 5).

**Lethal trifecta** — The dangerous combination, in one agent, of access to private data, exposure to untrusted content, and the ability to communicate externally (Ch 5).

**Circuit breaker** — A reliability wrapper that trips after a threshold of failures so further calls to a failing tool, service, or sub-agent fail fast instead of hanging or retry-storming (Ch 5).

**Kill switch** — A human- or policy-triggered stop that halts an agent or fleet immediately, independent of the agent's own control flow; it lives in the harness because a steered agent cannot be trusted to stop itself (Ch 5).

**Canary token** — A planted fake secret (unused key, decoy file, tripwire URL) whose access or exfiltration raises a high-signal alarm that an agent has been steered — detection for the lethal-trifecta exfiltration path (Ch 5).

**Action budget** — A hard ceiling on tool calls, tokens, wall-clock time, or spend, after which the loop stops and escalates rather than running away (Ch 5, 8, 17).

---

## Evaluation

**Eval harness** — The infrastructure that runs an evaluation end-to-end; distinct from the agent harness being evaluated (Ch 10).

**Readiness validation** — Verification that a specific model-plus-harness configuration is ready for a specific task distribution, environment, budget, and governance regime (Ch 10).

**Failure attribution** — Labeling an agent failure by likely harness layer — for example execution, tool interface, context, lifecycle, observability, verification, or governance — before choosing a fix (Ch 10, 12).

**Task / trial** — A *task* has defined inputs and success criteria; a *trial* is a single attempt at it (Ch 10).

**Grader** — A component that scores some aspect of a trial: code-based, model-based, or human (Ch 10).

**Transcript (trace, trajectory)** — The full record of a trial: every message, tool call, and result (Ch 10, 12).

**Outcome** — The final environmental state at the end of a trial, distinct from the agent's text response (Ch 10).

**Capability eval / regression eval** — Capability evals measure what an agent can newly do (low pass rates, climbing); regression evals protect what it already does reliably (near 100%) (Ch 10).

**pass@k / pass^k** — pass@k is the probability of at least one success in k attempts (rises with k); pass^k is the probability that *all* k trials succeed (falls with k) (see Foundations ch 13) (Ch 10).

**Infrastructure noise** — Variation in benchmark scores caused by the runtime's resource configuration rather than by model capability (Ch 11).

---

## Long-Running Agents and the Field

**Shift-change problem** — The challenge that successive agent sessions arrive with no memory of prior ones, because context windows are limited (Ch 7).

**Initializer agent** — An agent that runs once to set up a project (init script, progress log, feature list) for the later coding-agent sessions to build on (Ch 7).

**Managed agent** — A platform-managed agent architecture that separates the model-side brain, execution-side hands, and durable session/event log so each can fail, reset, or migrate independently (Ch 7).

**Brain / hands split** — The managed-agent separation between decision-making context (brain) and replaceable execution environment (hands) (Ch 7).

**Sprint contract** — A file-based agreement between a generator and an evaluator agent on what will be built and how success is verified, settled before each build sprint (Ch 7).

**Event log** — An append-only record of messages, tool calls, results, approvals, and errors. Execution state can be derived from it, making agents easier to replay and debug (Ch 9).

**Agent platform** — Infrastructure beyond a local framework: durable workspaces, managed sandboxes, identity, billing, observability, evaluation, governance, and human handoff across many runs and users (Ch 9, 18).

**Checkpoint / resume** — A reliability pattern where an agent periodically saves enough state to restart after failure or context reset without losing work (Ch 7, 9).

**Durable execution** — An infrastructure guarantee that each workflow step is persisted so a crashed or interrupted agent resumes from the last recorded step; non-deterministic model/tool calls are recorded and replayed, not recomputed (Ch 7).

**Time horizon** — METR's capability metric: the human-task length a model completes with 50% reliability; the frontier value has roughly doubled every seven months (Ch 7, 18).

**Stateless reducer** — Modeling an agent as a pure fold over an event log, making it serializable, replayable, and testable (Ch 9).

**Model–harness co-evolution** — The coupling created when frontier models are post-trained with their harnesses in the loop, so that changing either side can degrade performance (Ch 12).

**Span telemetry** — Structured trace data represented as a tree of spans for model calls, tool calls, retrieval, context assembly, permissions, costs, and outcomes (Ch 12).

**OpenTelemetry GenAI semantic conventions** — An emerging standard schema of span and attribute names for LLM and agent telemetry (`invoke_agent`, `chat`, `execute_tool` spans), letting agent traces join the ordinary observability stack (Ch 12).

**Trace-to-eval loop** — Converting real production failures into redacted, reproducible regression cases with outcome assertions (Ch 12).

**Meta-harness** — Treating harness design itself as an optimization object: prompts, tools, retries, context policies, evaluators, and control loops are ablated or searched using eval feedback (Ch 12).

**Cost-quality-speed trilemma** — The tradeoff that stronger execution environments, observability, verification, and governance improve reliability but increase cost and latency (Ch 18).

**Capability-control tradeoff** — The design axis where more authority, tools, memory, and autonomy improve capability while expanding the control, provenance, and audit problem (Ch 18).

**Ralph Wiggum loop** — A hook that intercepts an agent's exit attempt and reinjects the original prompt in a clean context window, forcing it to continue against its goal (Ch 7, 8).

**Loop engineering** — Treating the agent loop itself as the unit of design — specifying the trigger, topology, verifier, and stop rules that surround the model so it can run unattended. The operator-facing view of the outer control loop (Ch 8).

**Trigger (heartbeat)** — What starts a loop pass without a human prompt: a schedule, a webhook, or another agent (Ch 8).

**Verifier (maker–checker)** — The fixed standard that decides "good enough," applied by an agent separate from the one that produced the work, so the maker cannot grade its own homework; the bottleneck of loop design (Ch 8).

**Stop rule** — An explicit condition that ends a loop — success, no-op, or ask-for-approval — plus the three hard stops that bound a runaway: a maximum iteration count, no-progress detection, and a budget ceiling (Ch 8).

**Closed vs. open loop** — A closed loop pins hard, checkable acceptance criteria up front and is safe to leave running; an open loop explores a fuzzy goal and needs an even stronger verifier or it ships confident garbage (Ch 8).

---

## Instructions and Model Selection

**Instruction hierarchy** — The principle that instructions carry different authority by origin — system over developer over user over tool/retrieved content — so a lower-priority instruction cannot override a higher one. Prompt injection is a failure of this hierarchy (Ch 13).

**Right altitude** — The target specificity for a system prompt: concrete enough to steer behavior reliably, general enough to transfer across cases, avoiding both brittle hardcoded rules and vague guidance (Ch 13).

**Model routing** — Classifying a request's difficulty and dispatching easy ones to a cheap, weak model and hard ones to an expensive, strong one. Pays off only when the routing decision is much cheaper than the saving (Ch 14).

**LLM cascade** — Trying a cheap model first and escalating to a stronger one only when a verifier rejects the cheap answer. Matches strong-model accuracy at lower cost when the escalation signal is reliable (Ch 14).

**Fallback** — Failing over to an alternate model when the primary errors, times out, or is rate-limited, so the agent degrades gracefully (Ch 14).

**AI gateway** — An infrastructure component between the harness and model providers that presents one interface over many models and hosts routing, fallback, budgets, caching, and logging (e.g., LiteLLM, Portkey) (Ch 14, 17).

**Reasoning model** — A model post-trained, often with RL on verifiable rewards, to generate long internal reasoning before answering, spending inference tokens for better performance on hard tasks (Ch 14; *LLM Foundations* Ch 7–8).

**Test-time compute** — Spending more inference tokens, time, and money at answer time to do better on hard problems — a scaling axis distinct from larger models or more hardware (Ch 14).

---

## Human Interaction

**Permission fatigue** — The degradation of oversight when an agent prompts for approval too often, training the human to rubber-stamp without reading (Ch 5, 15).

**Mixed-initiative** — An interaction style in which the system decides per action whether to act autonomously or defer to a human, managing the cost of interruption (Ch 15).

**Approval as a tool call** — Modeling human approval as a tool the agent invokes, so the request becomes a durable, replayable, auditable event that composes with suspend/resume (Ch 15).

**Steering** — Injecting a new instruction into a running agent so it is incorporated on the next turn, redirecting without losing session state (Ch 15).

**Calibrated trust** — The goal of the human interface: the human trusts the agent exactly as much as it deserves on a given task, achieved through transparency and grounded uncertainty rather than fluency (Ch 15).

---

## Computer-Use Agents

**Computer-use agent** — An agent that operates software through its GUI — viewing screenshots and emitting cursor, keyboard, and navigation actions — rather than calling defined APIs (Ch 16).

**Visual grounding** — Translating an intention ("click Submit") into a concrete action (a click at specific coordinates); an error mode with no analog in API tools (Ch 16).

**Set-of-Mark prompting** — Overlaying numbered marks on candidate interactive elements so the model selects a discrete label instead of producing raw coordinates, improving grounding reliability (Ch 16).

**Accessibility tree** — A structured, semantic representation of a UI (roles, labels, states) built for assistive technology; often a more compact and exact screen encoding than raw pixels or DOM (Ch 16).

---

## Cost and Operations

**Per-task budget** — An explicit ceiling on tokens, tool calls, or cost for a single agent run, after which the agent stops and asks rather than looping indefinitely (Ch 17).

**Cost attribution** — Attaching token and dollar cost to each span of a trace, turning "the agent is expensive" into a specific, fixable engineering finding (Ch 17).

**Multi-tenancy / tenant isolation** — Serving many users or organizations from one platform while preventing state bleed (context/memory/cache leaking across tenants) and authority bleed (acting with the wrong tenant's credentials) (Ch 17).

**Canary rollout** — Releasing a harness change to a fraction of traffic and watching production traces and outcome metrics before full deployment, catching cases the eval suite missed (Ch 17).

**Semantic cache** — A cache that serves *similar* (not just identical) requests by embedding the query and returning a stored response above a similarity threshold; can skip whole model calls but risks false hits (Ch 17).

**AI management system (ISO/IEC 42001)** — The first certifiable standard for governing an organization's AI: how to establish, operate, and continually improve an AI management system — the AI analogue of ISO 27001 (Ch 17).

**EU AI Act** — Regulation (EU) 2024/1689, the first comprehensive AI law; it classifies systems by risk tier and imposes binding obligations on high-risk uses (Ch 17).
