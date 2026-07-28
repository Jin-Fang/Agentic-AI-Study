# Agent Harness: A Practitioner's Textbook

*A fact-based synthesis of contemporary writing on harness engineering, drawn from the [Awesome Harness Engineering](https://github.com/walkinglabs/awesome-harness-engineering) reading list and the OpenReview survey [Agent Harness Engineering: A Survey](https://openreview.net/pdf?id=3hXEPbG0dh). Every substantive claim is referenced inline.*

中文版见：[Agent Harness：实践者教材](../agent-harness-zh/)

---

## Introduction

This textbook is about the system that surrounds a language model when it is asked to do real work. That system has a name now — *the harness* — and a small but rapidly maturing body of literature describing how to build it.

The premise of the field is simple. As Vivek Trivedy of LangChain puts it: "Agent = Model + Harness. **If you're not the model, you're the harness.**" Everything else — system prompts, tools, sandboxes, memory, sub-agents, control flow, evaluation infrastructure — is the harness. A recent OpenReview survey sharpens this into a systems claim: for long-horizon agents, the harness can be the binding constraint on reliability, not merely a wrapper around model capability. The work of designing it well is what we study here.

---

## How to Read This Book

This is the second book in a two-part sequence. It assumes the model fundamentals covered in the companion volume, [*LLM Foundations for Harness Engineering*](../llm-foundations/) — tokens, attention and the KV-cache, the context window, sampling, post-training, retrieval, the agent loop and tool-call protocol, prompt injection, and pass@k vs pass^k. Where this book names a Foundations concept, it points back (e.g. "see Foundations ch 9") rather than re-deriving it. Read that volume first if those terms are unfamiliar.

The chapters are a single narrative pass over the ETCLOVG taxonomy and can be read straight through. If you arrive with a specific goal: context budget is Ch 2–3; tools and MCP are Ch 4; safety and sandboxing are Ch 5; evaluation and iteration are Ch 10–12; and the production checklist is Ch 9.

---

## Chapters

| Chapter | Title | Description |
|---------|-------|-------------|
| [Preface](./00-preface.md) | Preface | Framing and purpose of the textbook |
| [Ch 1](./01-what-is-an-agent-harness.md) | What Is an Agent Harness? | The Model + Harness equation, the agent loop, inner/outer harness layers, ETCLOVG taxonomy, historical arc |
| [Ch 2](./02-context-as-finite-resource.md) | Context as a Finite Resource | Context rot, attention budgets, KV-cache, filesystem as memory |
| [Ch 3](./03-compaction-memory-subagent.md) | Compaction, Memory, and the Sub-Agent Pattern | Compaction, note-taking, recitation, context firewalls, memory architectures, poisoning and trust escalation, multi-agent failure taxonomy |
| [Ch 4](./04-tools-agent-computer-interface.md) | Tools and the Agent–Computer Interface | Tool design, MCP and private connectivity, programmatic tool calling, A2A, namespacing, token-efficient responses, code execution as meta-tool |
| [Ch 5](./05-sandboxing-guardrails.md) | Sandboxing, Guardrails, and Safe Autonomy | Threat model, containment patterns, permission fatigue, agentic readiness, identity and governance, filesystem/network isolation, hooks, operational safety |
| [Ch 6](./06-agentic-workflow-patterns.md) | Agentic Workflow Patterns | Five compositional workflow patterns, micro-agent approach, reasoning and self-correction patterns (Reflexion, ToT, LATS, ReWOO) |
| [Ch 7](./07-long-running-agents.md) | Long-Running Agents and Multi-Context-Window Tasks | Shift-change problem, initializer+coding agent pattern, managed agents, GAN-inspired architecture, durable execution and checkpointing, the METR time-horizon metric |
| [Ch 8](./08-loop-engineering.md) | Loop Engineering | Designing the outer loop: triggers and nested loops, the verifier as bottleneck, stop rules, the Ralph lineage, building blocks, the maturity ladder |
| [Ch 9](./09-twelve-factors.md) | Twelve Factors for Production Agents | HumanLayer's 12-factor manifesto, state reducers, and the framework-to-platform shift |
| [Ch 10](./10-evaluation.md) | Evaluation | Eval anatomy, grader types, evaluator integrity, pass@k vs pass^k, readiness validation, eight-step roadmap |
| [Ch 11](./11-infrastructure-noise.md) | Infrastructure Noise | Resource configuration effects on benchmark scores |
| [Ch 12](./12-trace-driven-iteration.md) | Trace-Driven Iteration and Model–Harness Co-Evolution | Traces as feedback loops, span telemetry, regression extraction, bounded self-improvement, meta-harness, model–harness coupling |
| [Ch 13](./13-system-prompts-and-instructions.md) | System Prompts and Instruction Architecture | The instruction layer, the instruction hierarchy, dynamic assembly, prompt versioning, the right altitude |
| [Ch 14](./14-model-selection-routing-reasoning.md) | Model Selection, Routing, and Reasoning Models | Per-step model choice, routing, cascades and fallbacks, AI gateways, reasoning models and test-time compute |
| [Ch 15](./15-human-agent-interaction.md) | Human–Agent Interaction | Permission fatigue vs blind trust, mixed-initiative, approval as a tool call, review surfaces, steering, supervising fleets |
| [Ch 16](./16-computer-use-and-multimodal-agents.md) | Computer-Use and Multimodal Agents | Operating GUIs, screen encodings, visual grounding, action spaces, the widest attack surface, environmental evals |
| [Ch 17](./17-cost-privacy-and-operations.md) | AgentOps — Cost, Privacy, and Production Operations | Lifecycle operations, budgets, cost attribution, semantic caching, data governance, multi-tenancy, releases, monitoring, governance frameworks |
| [Ch 18](./18-agent-fleets-identity-control-plane.md) | Agent Fleets, Identity, and the Control Plane | Agent identity and registry, delegated authorization, gateways and policy enforcement, fleet lifecycle, lineage, audit, and non-repudiation |
| [Ch 19](./19-outlook.md) | Outlook | Open problems, cross-layer tradeoffs, and standing principles |
| [References](./references.md) | References | Full bibliography |
| [Glossary](./glossary.md) | Glossary | Quick definitions for key terms used throughout the book |

---

*Most source articles were published in 2025–2026. The field moves fast; check the references for the latest.*
