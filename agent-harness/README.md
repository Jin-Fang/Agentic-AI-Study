# Agent Harness: A Practitioner's Textbook

*A fact-based synthesis of agent-harness engineering. Substantive factual claims are cited where they appear, not only in the bibliography.*

中文版见：[Agent Harness：实践者教材](../agent-harness-zh/)

---

## Introduction

This book studies the systems that turn model outputs into controlled work. Foundations uses *harness* as a deliberately broad shorthand for responsibilities outside the model. This volume separates that surrounding system into the **agent harness**, **runtime**, **product/application**, **platform/control plane**, and **evaluation harness**. The distinction matters because the component that assembles a prompt need not be the component that owns durable state, executes an action, enforces policy, or grades the outcome. Anthropic likewise distinguishes the agent harness being tested from the evaluation harness that constructs tasks, runs trials, and applies graders ([Anthropic — Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)).

The standing boundary across both volumes is simple: the model proposes tokens or structured actions; external systems own authorization, execution, state, verification, and consequences. A structured tool call is therefore a proposal until the harness validates it and an authorized runtime executes it ([Anthropic — How Tool Use Works](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works)).

---

## How to Read This Book

This is the second book in a two-part sequence. It assumes the model-side mechanisms covered in [*LLM Foundations for Harness Engineering*](../llm-foundations/): tokens, attention and per-request KV state, context limits, sampling, post-training, retrieval primitives, structured tool-call generation, prompt injection, and model-behavior evaluation. This book starts where that volume stops: production context assembly, retrieval data paths, durable state, tool dispatch, policy enforcement, outcome verification, operations, and fleets.

Read straight through for the dependency order, or use these paths:

- **Core loop and boundaries:** Chapters 1–3, 6–7
- **Retrieval, memory, and long-running state:** Chapters 4–5, 10, 12
- **Routing, workflows, and verification:** Chapters 8–9, 11, 13
- **Human and computer interaction:** Chapters 14–15
- **Production measurement and operations:** Chapters 16–19
- **Cross-book lookup:** [Source Map](./source-map.md) and [Glossary](./glossary.md)

Provider prices, cache behavior, product features, benchmark results, and other time-sensitive examples are labeled by provider, scope, and date. Treat them as verified examples, not permanent definitions.

---

## Chapters

| Chapter | Title | Description |
|---------|-------|-------------|
| [Preface](./00-preface.md) | Preface | Prerequisites and the model/harness responsibility boundary |
| [Ch 1](./01-what-is-an-agent-harness.md) | What Is an Agent Harness? | System layers, the proposal-to-outcome loop, and responsibility ownership |
| [Ch 2](./02-system-prompts-instructions-policy.md) | System Prompts, Instructions, and Policy Boundaries | Instruction priority, prompt assembly provenance, and executable policy |
| [Ch 3](./03-context-as-finite-resource.md) | Context as a Finite Resource | Context transformations, cache boundaries, and tool-catalog strategies |
| [Ch 4](./04-production-retrieval-grounding.md) | Production Retrieval and Grounding | Ingestion, indexing, ACLs, retrieval, grounding, provenance, and evaluation |
| [Ch 5](./05-compaction-memory-context-handoffs.md) | Compaction, Memory, and Context Handoffs | Loss-aware compaction, scoped memory, artifacts, and evidence-bearing handoffs |
| [Ch 6](./06-tools-invocation-lifecycle.md) | Tools and the Invocation Lifecycle | Proposal, validation, authorization, execution, normalization, and outcome checks |
| [Ch 7](./07-sandboxing-runtime-enforcement.md) | Sandboxing, Guardrails, and Runtime Enforcement | Sandboxes, PDP/PEP, mandatory approvals, hooks, and operational safety |
| [Ch 8](./08-model-selection-routing-reasoning.md) | Model Selection, Routing, and Reasoning Budgets | Routing modes, compatibility gates, fallbacks, and reasoning controls |
| [Ch 9](./09-agentic-workflow-patterns.md) | Agentic Workflow Patterns | Deterministic workflows, model-directed loops, and hybrid patterns |
| [Ch 10](./10-state-event-history-production-factors.md) | State, Event Histories, and Production Factors | Execution state, event history, checkpoints, replay, IDs, and recovery |
| [Ch 11](./11-evaluation.md) | Evaluation | Tasks, trials, graders, transcripts, outcomes, reliability, and release evidence |
| [Ch 12](./12-long-running-agents.md) | Long-Running Agents and Multi-Context Tasks | Milestones, artifact handoffs, context resets, resume, and finalization |
| [Ch 13](./13-loop-engineering.md) | Loop Engineering and Verifier Hierarchies | Triggers, verifier selection, stop rules, and bounded autonomy |
| [Ch 14](./14-human-agent-interaction.md) | Human–Agent Interaction | Consultation, mandatory approval, review surfaces, steering, and cancellation |
| [Ch 15](./15-computer-use-multimodal-agents.md) | Computer-Use and Multimodal Agents | Structured computer-tool loops, visual observations, races, safety, and evals |
| [Ch 16](./16-infrastructure-noise.md) | Infrastructure Noise in Agent Evals | Resource confounds, paired experiments, uncertainty, and reporting |
| [Ch 17](./17-trace-driven-iteration.md) | Trace-Driven Iteration | Trace semantics, regression extraction, and controlled harness improvement |
| [Ch 18](./18-agentops.md) | AgentOps: Cost, Privacy, and Production Operations | Budgets, caches, privacy, monitoring, release units, and governance |
| [Ch 19](./19-agent-fleets-control-plane.md) | Agent Fleets, Identity, and the Control Plane | Identity chains, delegated authority, distributed enforcement, lineage, and lifecycle |
| [Ch 20](./20-outlook.md) | Outlook | Durable principles, open problems, and cross-book navigation |
| [Source Map](./source-map.md) | Foundations → Harness Source Map | Model concept to engineering responsibility and chapter |
| [References](./references.md) | References | Full bibliography |
| [Glossary](./glossary.md) | Glossary | Canonical definitions used throughout the book |

---

*The field and provider contracts change quickly. Follow inline citations for the scope and date of each factual claim.*
