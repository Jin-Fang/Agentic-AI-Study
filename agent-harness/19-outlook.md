# Chapter 19: Outlook

### 19.1 The Field Is Young

Much of the vocabulary used in this book — initializer agents, context firewalls, sprint contracts, reasoning sandwiches, ambient affordances, computational vs. inferential controls — entered the mainstream agent-engineering conversation within the last twelve to eighteen months. Some underlying ideas are older, but the shared language is recent. Most of the source articles for this textbook were published in 2025 and 2026. The field is moving faster than any single book can document — and there is a number attached to that pace: METR finds the task-completion *time horizon* of frontier models (the human-task-length they clear 50% of the time) has doubled roughly every seven months (§7.11) ([Kwa et al. — Measuring AI Ability to Complete Long Tasks](https://arxiv.org/abs/2503.14499)). A book about what a harness must supply is, in part, a book about a moving target.

LangChain frames the trajectory honestly: as models improve, some of what lives in the harness today will be absorbed into the model. Models will get better at planning, self-verification, and long-horizon coherence natively, requiring less context injection. But the space of interesting harness combinations does not shrink as models improve. It moves ([LangChain — The Anatomy of an Agent Harness](https://blog.langchain.com/the-anatomy-of-an-agent-harness/); [Anthropic — Harness Design for Long-Running Application Development](https://www.anthropic.com/engineering/harness-design-long-running-apps)).

### 19.2 Open Problems

Several recur across the literature:

- **Behavioral harnesses for functional correctness**. Maintainability and architecture-fitness harnesses have decades of pre-existing tooling. Behavior harnesses — does the application functionally do what the user wants? — do not. Today most teams rely on AI-generated tests, and the consensus is that this is not yet good enough ([Thoughtworks — Harness Engineering](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html)).
- **Harness coherence at scale**. As guides and sensors multiply, how do they stay consistent? How do we know when sensors that never fire indicate quality versus inadequate detection? There is no equivalent of code coverage or mutation testing for harness coverage yet.
- **Control-plane portability**. Registries, identities, policies, gateways, and audit systems now exist, but their schemas and authority models remain platform-specific. Moving an agent between clouds or organizations without losing provenance, policy meaning, or revocation semantics is still hard (Ch 18).
- **Cross-layer governance coherence**. The OpenReview survey highlights that policy, permission prompts, audit logs, constitutional instructions, and runtime hooks often live in separate layers and may interfere rather than compose. Portable policy and audit languages are still missing ([OpenReview — Agent Harness Engineering: A Survey](https://openreview.net/pdf?id=3hXEPbG0dh)).
- **Standardized readiness reporting**. If model scores depend on execution environment, tool surface, context policy, retry rules, and governance gates, benchmark reports need a harness bill of materials. Today there is no widely adopted format for publishing that configuration ([OpenReview — Agent Harness Engineering: A Survey](https://openreview.net/pdf?id=3hXEPbG0dh)).
- **Cost-quality-speed trilemma**. Stronger sandboxes, richer observability, deeper verification, and stricter governance usually increase cost and latency. Mature harnesses need explicit policy for which checks run synchronously, which run offline, and which risks justify expensive controls ([OpenReview — Agent Harness Engineering: A Survey](https://openreview.net/pdf?id=3hXEPbG0dh)).
- **Capability-control tradeoff**. More tools, memory, autonomy, and network reach increase task coverage, but also increase selection errors, prompt-injection surface, provenance risk, and audit burden. Capability and control are one design axis, not separate concerns.
- **Multi-agent coordination beyond synchronous orchestration**. Anthropic's research system runs sub-agents synchronously; asynchronous coordination would unlock more parallelism but adds challenges in result coordination, state consistency, and error propagation ([Anthropic — How We Built Our Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)).
- **Continual learning at the harness level**. Memory primitives that let agents accumulate knowledge of a codebase or domain over many sessions, rather than starting fresh each time, are an active research area ([LangChain — Improving Deep Agents with Harness Engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/)).
- **Human-in-the-loop approval**. Where the harness should pause for a human decision — and how to surface enough context for that decision without flooding the operator — has no settled interface. Approval gates that are too coarse get rubber-stamped; too fine, and they defeat the point of autonomy.
- **Just-in-time tool assembly**. Harnesses that dynamically assemble the right tools and context for a given task, rather than pre-configuring everything, are explored by LangChain among others ([LangChain — Improving Deep Agents with Harness Engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/)).
- **Tracing as documentation**. LangChain's observation that "in software, the code documents the app; in AI, the traces do" hints at a different model of system documentation that the field has not fully worked out ([LangChain — The Anatomy of an Agent Harness](https://blog.langchain.com/the-anatomy-of-an-agent-harness/)).
- **End-to-end supply-chain governance**. Tool integrity is only one piece. Agents also depend on MCP servers, external packages, datasets, retrieval sources, and generated dependency names. Provenance across that full chain is still underdeveloped ([OpenReview — Agent Harness Engineering: A Survey](https://openreview.net/pdf?id=3hXEPbG0dh)).
- **Evaluator integrity under consequence**. Model judges can be influenced by how their verdict will be used, while generators can learn to optimize against known graders. Blinding, abstention, ensembles, and meta-evals help, but no general method makes a semantic verifier both scalable and consequence-independent (Ch 10).

### 19.3 The Standing Advice

A few principles repeat across nearly every article in the corpus:

- **Treat context as a finite resource**. Find the smallest set of high-signal tokens that produces the desired outcome.
- **Do the simplest thing that works**. Agents are expensive; workflows often suffice; many tasks need neither.
- **Read the transcripts**. Everything else flows from this.
- **Iterate on what is load-bearing**. Stress-test components when models change. Strip what is no longer pulling weight; tune what is.
- **Tailor harnesses to models, but tailor principles to the field**. Specific prompts and tools change between models. The shape of the work — context engineering, tool design, evaluation, sandboxing, self-verification — does not.

The field is not yet old enough to have textbooks. This document is an attempt to write one anyway, knowing it will go out of date faster than most. The hope is that the citations make it possible to read the originals as the conversation continues.

---

## Diagram: Open Problems Mindmap

```mermaid
mindmap
  root((Open Problems in Harness Engineering))
    Correctness
      Behavioral harnesses for functional correctness
      AI-generated tests not yet good enough
      No mutation testing equivalent for harnesses
      Evaluator integrity under consequence
    Governance
      Control-plane portability
      Cross-layer policy coherence
      Portable audit and policy languages
      Human approval interfaces
      Supply-chain provenance
    Tradeoffs
      Cost-quality-speed trilemma
      Capability-control tradeoff
    Coordination
      Multi-agent async orchestration
      Result coordination across parallel agents
      State consistency in async systems
    Memory
      Continual learning across sessions
      Domain knowledge accumulation
      Cross-session memory primitives
    Tooling
      Just-in-time tool assembly
      Dynamic context assembly per task
      Harness coherence at scale
    Documentation
      Traces as system documentation
      Harness coverage metrics
      Harness bill of materials
      Sensor effectiveness measurement
```

---

## Key Takeaways

- **The shared vocabulary is young**: many terms became common in 2025–2026, even when the underlying ideas are older.
- **Models absorb harness, but harness moves**: as models improve and take on more native capabilities, the interesting harness work moves to harder problems, not away.
- **Open problems now span the full ETCLOVG stack**: behavioral correctness, evaluator integrity, control-plane portability, harness and governance coherence, readiness reporting, cost-quality-speed, capability-control, async coordination, continual learning, just-in-time tool assembly, and traces-as-documentation.
- **Five standing principles cut across all contexts**: finite context, simplest-that-works, read-the-transcripts, iterate-load-bearing, tailor-to-model.
- **Harness engineering is permanent work**: not scaffolding to discard once models improve, but the ongoing craft of building effective systems around increasingly capable cores.

## Further Reading

- Vivek Trivedy, *The Anatomy of an Agent Harness*, LangChain, Mar 2026. https://blog.langchain.com/the-anatomy-of-an-agent-harness/
- Prithvi Rajasekaran, *Harness Design for Long-Running Application Development*, Anthropic, Mar 2026. https://www.anthropic.com/engineering/harness-design-long-running-apps
- Birgitta Böckeler, *Harness Engineering for Coding Agent Users*, Thoughtworks / martinfowler.com, Apr 2026. https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html
- Jeremy Hadfield et al., *How We Built Our Multi-Agent Research System*, Anthropic, Jun 2025. https://www.anthropic.com/engineering/multi-agent-research-system
- Vivek Trivedy, *Improving Deep Agents with Harness Engineering*, LangChain, Feb 2026. https://blog.langchain.com/improving-deep-agents-with-harness-engineering/
- *Awesome Harness Engineering* reading list: https://github.com/walkinglabs/awesome-harness-engineering
- Thomas Kwa et al., *Measuring AI Ability to Complete Long Tasks*, METR / arXiv, Mar 2025. https://arxiv.org/abs/2503.14499
- *Agent Harness Engineering: A Survey*, OpenReview / TMLR submission, 2026. https://openreview.net/pdf?id=3hXEPbG0dh
