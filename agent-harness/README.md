# Agent Harness: A Practitioner's Textbook

*A fact-based synthesis of contemporary writing on harness engineering, drawn from the [Awesome Harness Engineering](https://github.com/walkinglabs/awesome-harness-engineering) reading list and the OpenReview survey [Agent Harness Engineering: A Survey](https://openreview.net/pdf?id=3hXEPbG0dh). Every substantive claim is referenced inline.*

中文版见：[Agent Harness：实践者教材](../agent-harness-zh/)

---

## Introduction

This textbook is about the system that surrounds a language model when it is asked to do real work. That system has a name now — *the harness* — and a small but rapidly maturing body of literature describing how to build it.

The premise of the field is simple. As Vivek Trivedy of LangChain puts it: "Agent = Model + Harness. **If you're not the model, you're the harness.**" Everything else — system prompts, tools, sandboxes, memory, sub-agents, control flow, evaluation infrastructure — is the harness. A recent OpenReview survey sharpens this into a systems claim: for long-horizon agents, the harness can be the binding constraint on reliability, not merely a wrapper around model capability. The work of designing it well is what we study here.

---

## Chapters

| Chapter | Title | Description |
|---------|-------|-------------|
| [Preface](./00-preface.md) | Preface | Framing and purpose of the textbook |
| [Ch 1](./01-what-is-an-agent-harness.md) | What Is an Agent Harness? | The Model + Harness equation, the agent loop, inner/outer harness layers, ETCLOVG taxonomy, historical arc |
| [Ch 2](./02-context-as-finite-resource.md) | Context as a Finite Resource | Context rot, attention budgets, KV-cache, filesystem as memory |
| [Ch 3](./03-compaction-memory-subagent.md) | Compaction, Memory, and the Sub-Agent Pattern | Compaction, note-taking, recitation, context firewalls |
| [Ch 4](./04-tools-agent-computer-interface.md) | Tools and the Agent–Computer Interface | Tool design, MCP, protocol boundaries, namespacing, token-efficient responses, code execution as meta-tool |
| [Ch 5](./05-sandboxing-guardrails.md) | Sandboxing, Guardrails, and Safe Autonomy | The security threat model, sandbox roles, permission fatigue, governance, filesystem/network isolation, hooks |
| [Ch 6](./06-agentic-workflow-patterns.md) | Agentic Workflow Patterns | Five compositional workflow patterns, micro-agent approach |
| [Ch 7](./07-long-running-agents.md) | Long-Running Agents and Multi-Context-Window Tasks | Shift-change problem, initializer+coding agent pattern, managed agents, GAN-inspired architecture |
| [Ch 8](./08-twelve-factors.md) | Twelve Factors for Production Agents | HumanLayer's 12-factor manifesto, state reducers, and the framework-to-platform shift |
| [Ch 9](./09-evaluation.md) | Evaluation | Eval anatomy, grader types, pass@k vs pass^k, readiness validation, eight-step roadmap |
| [Ch 10](./10-infrastructure-noise.md) | Infrastructure Noise | Resource configuration effects on benchmark scores |
| [Ch 11](./11-trace-driven-iteration.md) | Trace-Driven Iteration and Model–Harness Co-Evolution | Traces as feedback loops, span telemetry, regression extraction, meta-harness, model–harness coupling |
| [Ch 12](./12-outlook.md) | Outlook | Open problems, cross-layer tradeoffs, and standing principles |
| [References](./references.md) | References | Full bibliography |
| [Glossary](./glossary.md) | Glossary | Quick definitions for key terms used throughout the book |

---

*Most source articles were published in 2025–2026. The field moves fast; check the references for the latest.*
