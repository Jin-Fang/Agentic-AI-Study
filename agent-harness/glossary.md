# Glossary

Canonical vocabulary used throughout this book. Chapter links lead to the full argument and its inline evidence; key protocol and standards definitions are also cited here.

---

## System Boundaries

**Model** — The probabilistic component that consumes the current input representation and generates tokens or structured output. It proposes; it does not itself own durable state, credentials, external execution, or consequences ([Ch 1](./01-what-is-an-agent-harness.md)).

**Agent** — A model participating in a goal-directed loop with surrounding software that can assemble context, use tools, maintain state, and inspect outcomes.

**Agent harness** — The model-adjacent system that assembles inputs, parses model outputs, and drives one or more agent loops. It is narrower than the whole product, runtime, or fleet platform ([Ch 1](./01-what-is-an-agent-harness.md)).

**Runtime** — The execution substrate for scheduling, queues, durable steps, checkpoints, sandbox processes, cancellation, and retry semantics ([Ch 10](./10-state-event-history-production-factors.md)).

**Product / application** — The user-facing workflow, domain logic, review surface, and business state in which agent work has meaning.

**Platform / control plane** — Shared fleet infrastructure for registry, identity, policy administration and decision, lifecycle, and multi-tenant governance. Enforcement still requires a non-bypassable PEP on or next to each protected data path ([Ch 19](./19-agent-fleets-control-plane.md)).

**Evaluation harness** — The test system that creates task environments, invokes the agent harness for trials, collects complete grading evidence, applies graders, and aggregates results. It is distinct from the production agent harness being evaluated ([Anthropic — Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)).

**Harness engineering** — Iterating on prompts, context policies, tools, runtime controls, state, verification, and operations as one system rather than optimizing a prompt in isolation.

**Context engineering** — Selecting, ordering, transforming, and provenance-tracking the representations supplied to a model call ([Ch 3](./03-context-as-finite-resource.md)).

**ETCLOVG** — A survey taxonomy—Execution, Tools, Context, Lifecycle, Observability, Verification, Governance—used as an organizing lens, not an industry standard ([Ch 1](./01-what-is-an-agent-harness.md)).

---

## Context, Retrieval, State, and Evidence

**Context** — The token or multimodal representation visible to one model call. It is finite and is not durable workflow state.

**Context window** — The model/provider-specific maximum input-plus-output span for one call; practical reliability may degrade before the hard limit ([Foundations Ch 9](../llm-foundations/09-context-window-and-kv-cache.md)).

**Per-request KV cache** — Key/value states reused for previously processed tokens during one generation. It belongs to the inference mechanism described in [Foundations Ch 9](../llm-foundations/09-context-window-and-kv-cache.md).

**Provider prompt cache** — A provider contract for reusing eligible prompt prefixes across independent requests. Matching, TTL, billing, and data controls are provider-specific ([OpenAI](https://developers.openai.com/api/docs/guides/prompt-caching); [Anthropic](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)). It is not a synonym for per-request KV cache.

**Application response cache** — Reuse of a final response for an identical, scope-compatible request under application-controlled keys and invalidation.

**Semantic cache** — Reuse of a response for a semantically similar request. Similarity is only one gate; tenant, user/auth scope, model, prompt, tool, retrieval, policy version, freshness, and risk must also be compatible ([Azure semantic caching](https://learn.microsoft.com/en-us/azure/api-management/azure-openai-enable-semantic-caching); [Azure cache policy](https://learn.microsoft.com/en-us/azure/api-management/cache-lookup-policy)).

**Retrieval pipeline** — Source ingestion → parse/chunk → metadata and ACL → versioned index → query → dense/lexical retrieval → fusion/reranking → context assembly → citation/provenance → outcome evaluation ([Ch 4](./04-production-retrieval-grounding.md)).

**Evidence item** — A retrieved unit whose content travels with identifiers such as `source_id`, `source_version`, `chunk_id`, `content_hash`, `index_version`, and `acl_scope` so claims can be traced and permissions rechecked.

**Grounding** — The relationship between an answer or action and supplied evidence. Retrieval correctness, grounding/citation correctness, and final task outcome are separate measurements.

**Compaction** — A lossy context transformation that preserves selected decisions, constraints, open work, artifact pointers, provenance, and uncertainty in a smaller representation ([Ch 5](./05-compaction-memory-context-handoffs.md)). Foundations Ch 9 explains why context is finite; it does not define a compaction algorithm.

**Memory** — An information product stored for possible use in future calls. It needs scope, provenance, authority, freshness, update, access, and forgetting rules.

**Execution state** — Authoritative structured workflow state such as current step, pending action, budget, lease, and approval status ([Ch 10](./10-state-event-history-production-factors.md)).

**Event history** — An ordered durable record of accepted workflow events sufficient for recovery under a stated replay contract. Temporal documents its Event History as the recovery record for workflows ([Temporal](https://docs.temporal.io/workflow-execution/event)).

**Checkpoint** — Recoverable state at a known history position, plus the references, versions, and resume contract needed to continue. It is not the complete causal history.

**Artifact** — An addressable work product such as a file, diff, report, dataset, build, screenshot, or test result.

**Trace** — Observability data composed of spans, events, attributes, status, links, and timestamps; it may be sampled ([OpenTelemetry Trace API](https://opentelemetry.io/docs/specs/otel/trace/api/)). A trace is not automatically an event history, eval trajectory, cost ledger, or audit record.

**Eval transcript / trajectory** — The complete model-, tool-, observation-, artifact-, and outcome-level record retained to grade one trial. It may be derived from tracing only when grader-required evidence is complete ([Ch 11](./11-evaluation.md)).

**Audit record** — A protected accountability record with defined content, identity, timestamps, integrity, access, review, and retention. NIST treats these as explicit control requirements ([NIST SP 800-53 Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)).

**Lineage** — The provenance graph linking identities, versions, inputs, artifacts, policy decisions, approvals, actions, and verified outcomes.

**Context reset** — Starting a new model context from a structured handoff while durable execution state and artifacts remain external.

**Context firewall** — Isolation of a worker's intermediate context from a parent. It reduces context pollution but does not raise the worker's trust or authority; returned claims still need evidence and verification.

---

## Tools, Authorization, and Runtime Enforcement

**Tool call / action proposal** — Structured model output naming a tool and arguments. Application code decides whether and how to execute it ([Anthropic — How Tool Use Works](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works)).

**Invocation lifecycle** — Proposal → stream completion → parse → schema validation → semantic validation → authorization → mandatory approval when required → idempotency/dedup → execution → timeout/cancellation handling → result normalization → observation → outcome confirmation ([Ch 6](./06-tools-invocation-lifecycle.md)).

**Schema validity** — Whether an action matches its declared machine-readable shape. It does not establish semantic correctness, authorization, or safe consequences.

**Semantic validity** — Whether normalized arguments make sense for the current task, resource, and state.

**Execution result** — What an executor returned about an attempted action. It can be successful even when the intended environment outcome did not occur, or unknown after a timeout.

**Outcome** — The verified environment or business state after an action or trial, distinct from the model's claim and the executor's immediate response.

**Idempotency key** — A caller-supplied identifier used by a compatible service to deduplicate equivalent mutation attempts. It reduces duplicate effects but does not replace outcome verification.

**MCP (Model Context Protocol)** — A client/server protocol through which servers expose tools and other capabilities under their implementation and access controls. Tool lists may change, so discovery does not replace authorization at invocation time ([MCP Tools Specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)).

**A2A (Agent-to-Agent protocol)** — A protocol boundary for delegation and coordination among agentic applications; it is not the same boundary as exposing a tool to one agent runtime.

**Sandbox** — An isolated execution environment with explicit filesystem, network, credential, process, and persistence boundaries. It limits blast radius and creates a region where approved actions can proceed ([Ch 7](./07-sandboxing-runtime-enforcement.md)).

**Capability grant** — Scoped authority to perform an operation against a resource under stated identity, purpose, environment, audience, and expiry conditions.

**Delegated authorization** — Short-lived, audience- and purpose-bound authority derived from a user or service. Further delegation may narrow but must not silently widen it.

**Instruction priority** — The intended behavioral ordering of model-visible instructions. It is defense in depth, not authorization or an execution guarantee; hierarchy-evaluation research still measures conflict failures ([Instruction Hierarchy](https://arxiv.org/abs/2404.13208); [IHEval](https://arxiv.org/abs/2502.08745)).

**Model-visible policy** — Instructions and explanations placed in model context to steer behavior and help the model propose compliant actions.

**Executable policy** — Rules evaluated and enforced by external software on a protected action path.

**Policy decision point (PDP)** — The component that computes a policy decision from subject, action, resource, purpose, environment, and policy ([NIST Zero Trust Glossary](https://pages.nist.gov/zero-trust-architecture/glossary.html)).

**Policy enforcement point (PEP)** — The non-bypassable component that applies a policy decision to a request for a protected resource. A prompt is not a PEP ([NIST Zero Trust Glossary](https://pages.nist.gov/zero-trust-architecture/glossary.html)).

**Advisory hook** — A lifecycle hook that adds context, warns, or asks the model to reconsider, without necessarily preventing dispatch.

**Blocking enforcement** — A control through which every relevant action must pass, where denial prevents dispatch and alternate paths cannot bypass it.

**Approval request / consultation** — A model or workflow request for human input. It is useful orchestration but is not by itself a hard safety gate.

**Mandatory approval gate** — A runtime/PEP gate that policy inserts before protected dispatch whether or not the model requested it. Approval binds the reviewed identity, resource, normalized arguments, policy version, constraints, and expiry ([MCP Tools Specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)).

**Lethal trifecta** — Practitioner terminology for the combination of private-data access, untrusted content, and external communication. It is a threat-model heuristic, not a formal security standard ([Ch 7](./07-sandboxing-runtime-enforcement.md)).

---

## Routing and Workflow Control

**Router** — A policy that selects a route target before running the chosen target, using declared quality, cost, latency, capability, and governance features.

**Route target** — A model-plus-adapter-plus-tool-contract-plus-reasoning-policy configuration, not merely a model name.

**Quality cascade** — Trying a lower-cost target, evaluating the result, and escalating to a stronger target when the acceptance signal rejects it.

**Reliability fallback** — Switching after a timeout, rate limit, provider error, or other availability failure, but only after compatibility and side-effect checks.

**Hedging** — Starting more than one compatible attempt to reduce tail latency, with explicit winner, cancellation, cost, and side-effect semantics.

**Human escalation** — Routing uncertainty, incompatibility, policy conflict, or high consequence to a person instead of silently substituting another model.

**Compatibility gate** — A check that fallback targets agree on modalities, context limits, tool protocol/schema, structured output, continuation state, safety policy, latency envelope, and data region ([Ch 8](./08-model-selection-routing-reasoning.md)).

**Reasoning policy** — Provider-specific controls and budgets for reasoning effort, continuation, token accounting, and allowed disclosure. It is not a portable representation of hidden reasoning.

**Deterministic workflow** — External code owns sequencing and state; model calls fill bounded steps.

**Model-directed loop** — The model selects the next proposed action while the harness owns state, authorization, execution, stop rules, and outcome checks.

**Hybrid workflow** — Deterministic structure around bounded model-selected branches or loops.

**Orchestrator–workers** — A pattern in which an orchestrator proposes decomposition and delegates bounded work; external state and handoff contracts preserve evidence and recovery ([Ch 9](./09-agentic-workflow-patterns.md)).

---

## Evaluation and Verification

**Task / trial** — A task defines inputs, environment, constraints, and success criteria; a trial is one attempt at that task.

**Grader** — A code-based, model-based, or human component that measures one declared aspect of a trial.

**Process / trajectory grading** — Checking actions, policy use, tool arguments, budgets, or recovery behavior without assuming the final artifact is correct.

**Artifact grading** — Checking an addressable output such as code, a report, or a dataset.

**Environment-state grading** — Inspecting the actual external state after execution rather than trusting the agent's final message.

**User / business outcome grading** — Measuring the delayed product result that matters to users or the organization.

**pass@k / pass^k** — `pass@k` measures the probability of at least one success among `k` attempts; `pass^k` measures all-`k` consistency. Use the metric that matches the product contract and report uncertainty ([Foundations Ch 13](../llm-foundations/13-evaluation-for-llm-behavior.md); [Ch 11](./11-evaluation.md)).

**Verifier hierarchy** — Schema checks → deterministic tests/linters → environment outcome checks → same-agent critique → independent model grader → human review. Choose by consequence, ambiguity, correlated failure, latency, and cost; an independent agent is not universally required ([Ch 13](./13-loop-engineering.md)).

**Infrastructure noise** — Score variation caused by hardware, resource limits, disk/network behavior, images/dependencies, caches, parallelism, or timeouts rather than the tested agent change ([Anthropic — Infrastructure Noise](https://www.anthropic.com/engineering/infrastructure-noise)).

**Release evidence packet** — The pinned model-plus-harness configuration, per-slice trial results, uncertainty, grader versions and calibration, failures, policy checks, and approval needed for a release decision.

---

## Long-Running Work, Human Interaction, and Computer Use

**Durable execution** — Persisting progress so a run can recover after process, worker, network, or infrastructure failure. Replay reuses recorded model/tool outputs rather than regenerating them ([Ch 10](./10-state-event-history-production-factors.md)).

**Handoff** — A transfer package containing completed work, verified evidence, open risks, next action, artifact pointers, and permission context.

**Stop rule** — Explicit termination on success, budget exhaustion, no progress, repeated failure, policy denial, human cancellation, or terminal environment state.

**Action budget** — Hard limits covering tokens, dollars, tool calls, wall time, external spend, and retries/fallbacks.

**Steering event** — A recorded instruction that changes future planning after a defined acceptance point; it does not retroactively cancel an action already dispatched.

**Cancellation event** — A recorded request to stop future work and cancel compatible in-flight operations; already committed effects may require compensation.

**Computer-use tool loop** — The model proposes a structured computer action; the application executes it; a screenshot or other UI state returns as tool result/observation ([OpenAI](https://developers.openai.com/api/docs/guides/tools-computer-use); [Anthropic](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)).

**Screenshot observation** — Pixel evidence captured at a particular time. It may be stale by execution time and does not itself prove the post-action outcome.

**Surface identity** — The application, process, window/tab, frame, URL/origin, viewport, geometry, and capture version to which an observation and proposed UI action are bound.

**Observation/action race** — The interface changes after observation but before or during dispatch, so an action grounded in state `S0` executes against state `S1`. Freshness checks and observation barriers control the race ([Ch 15](./15-computer-use-multimodal-agents.md)).

**Visual / coordinate grounding** — Mapping an intended UI target to a coordinate, element, or action in the current interface state.

**Accessibility tree** — A structured view of UI roles, labels, states, and relationships; useful when available but not guaranteed to match all visible or actionable state.

---

## Operations, Fleets, and Governance

**Circuit breaker** — A runtime control that trips after a failure threshold so calls to an unhealthy dependency fail fast instead of causing a retry storm.

**Kill switch** — A human- or policy-triggered stop implemented through run lifecycle, credential revocation, and PEP denial rather than a natural-language instruction alone.

**Span telemetry** — Trace spans and attributes for model calls, tool calls, retrieval, context assembly, policy, cost, and outcome.

**Trace-to-eval loop** — Turning a redacted, consent/licensing-reviewed production failure into a reproducible regression task with complete outcome assertions.

**Cost ledger** — Complete, unsampled cost events correlated to runs, actions, providers, tools, and external spend. Sampled traces cannot by themselves support a complete ledger.

**Release unit** — The versioned combination of model, prompts, tool schemas/implementations, retrieval configuration/index, memory policy, sandbox image, policy, graders, and budgets.

**Agent identity chain** — The linked agent version, sponsor, delegator, tenant, purpose, runtime/workload identity, credential audience, expiry, and revocation state.

**Agent registry** — A governed source of truth for agent definitions, versions, owners, capabilities, requested authority, attestations, dependencies, and deployment state.

**Agent fleet** — A governed collection of agent definitions, releases, runs, runtimes, identities, tools, and owners rather than one local agent instance.

**AgentOps** — Operating discipline for service health, agent outcomes, safety/policy events, cost, privacy, release, incidents, and human escalation ([Ch 18](./18-agentops.md)).

**Non-repudiation** — Integrity-protected evidence that attributes a request or authorization to workload and policy identities. It does not prove that a human understood an approval or that a model rationale was truthful.
