# Chapter 18: Agent Fleets, Identity, and the Control Plane

Loop engineering asks how one autonomous task should start, act, verify, and stop. Production systems now face the next unit of design: many agents, created by many teams, operating across many environments and organizations. The hard questions move upward. Which agents exist? Who published this version? On whose behalf is it acting? Which tools, data, money, and network destinations may it reach? How is a running agent suspended, upgraded, or revoked? What evidence connects an action to the exact identity, policy, model, and artifact that produced it?

The emerging answer is an **agent control plane**. Borrowing the distinction from distributed systems, the *data plane* performs work—model calls, tool calls, code execution, and agent-to-agent messages. The *control plane* declares and enforces the desired operating state around that work: registry, identity, authorization, routing, lifecycle, policy, lineage, and audit. It does not make an individual agent smarter. It makes a fleet governable.

### 18.1 From Agent Program to Agent Fleet

A single agent can be configured with a prompt, several tools, and a local state file. A fleet adds problems that local configuration cannot solve:

- duplicate or abandoned agents with unclear ownership;
- several versions sharing a name but not behavior;
- credentials copied into prompts, sandboxes, or environment variables;
- tool access that outlives the task or user who authorized it;
- policy applied differently across chat, scheduled runs, and A2A delegation;
- incidents where no one can reconstruct which artifact or authority caused an action.

The platform shift in §9.2 anticipated this scope. A fleet needs a source of truth for agents and capabilities, a runtime authority that can mint and revoke task-scoped access, and lifecycle services that reconcile what *should* be running with what *is* running. AgentOps (Ch 17) operates and improves the system across its lifecycle; the control plane supplies the shared governance substrate on which those operations depend.

The boundary should remain explicit:

- **Data plane:** inference, retrieval, tool execution, sandbox processes, messages, and results.
- **Control plane:** definitions, identities, policy decisions, placement, versions, budgets, revocation, and audit.

Keeping policy out of the probabilistic data path where possible is the central design move. The agent may propose an action; deterministic control-plane services decide whether the named identity may perform that operation in this context.

### 18.2 Agent Identity: Who—or What—Is Acting?

User identity alone is insufficient. One user may launch several agents with different purposes and privileges; an agent may run on a schedule after the initiating session ends; one agent may delegate to another; and several versions of an agent may coexist. **Agent identity** is the durable machine identity of the agentic principal, distinct from the human, service account, runtime process, and model it uses.

NIST's concept paper on software-agent identity and authority decomposes the problem into identification, authentication, authorization, delegation, audit, and non-repudiation, while calling out prompt injection and confused-deputy behavior as reasons ordinary service identity is not enough ([NIST — Identity and Authorization for Software Agents](https://www.nist.gov/news-events/news/2026/02/new-concept-paper-identity-and-authority-software-agents)). A practical identity record should answer:

- **Principal:** which agent definition and version is acting?
- **Sponsor:** which person or organization owns it?
- **Delegator:** on whose behalf is this particular run acting?
- **Purpose:** what bounded task or workflow justified the authority?
- **Runtime:** which harness, model, sandbox image, and policy versions are executing?
- **Lifetime:** when was the identity issued, and when does it expire or become revocable?

Do not collapse these into one long-lived API key. A fleet should use workload identity and short-lived task tokens, with explicit delegation chains. The agent authenticates as itself; the authorization decision combines that identity with the delegating user, tenant, purpose, environment, and requested operation. This prevents a low-risk research agent from silently inheriting the full authority of the human who launched it.

### 18.3 The Agent Registry

An **agent registry** is the inventory and discovery layer for the fleet. It tells humans, orchestrators, gateways, and other agents what exists and which artifact they are about to trust. Google Cloud's Agent Registry models agents alongside MCP servers, endpoints, skills, skill revisions, and publishers; AWS Agent Registry and Microsoft 365's Agent Registry reflect the same move toward a governed catalog rather than scattered deployment URLs ([Google Cloud — Agent Registry Overview](https://docs.cloud.google.com/agent-registry/overview); [AWS — Agent Registry in AgentCore](https://aws.amazon.com/about-aws/whats-new/2026/04/aws-agent-registry-in-agentcore-preview/); [Microsoft — Agent Registry](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/agent-registry?view=o365-worldwide)).

A useful registry entry contains more than a name and description:

- immutable agent and version identifiers;
- publisher and accountable owner;
- supported tasks, input/output contracts, and endpoints;
- tool, MCP, skill, memory, model, and sandbox dependencies;
- requested permissions, data classes, network destinations, and budget class;
- eval and security attestation for the version;
- deployment status, deprecation date, and revocation state;
- lineage to the source, build, configuration, and policy bundle.

Discovery and governance must meet at the registry. Search results should be filtered by what the caller is allowed to invoke, and orchestration should resolve an immutable version rather than a mutable display name. Registration is not approval: a new entry can be visible as a draft without being authorized for production traffic. Promotion should require ownership, eval, security, and policy gates; deprecation should identify dependents before removal.

### 18.4 Runtime Authorization and Delegation

Registration says what an agent *is*. Authorization decides what a particular run *may do now*. This decision must be narrower than the union of everything the agent could ever need.

A robust flow is:

1. A user or service starts a run with a stated purpose and tenant.
2. The control plane resolves an approved agent version.
3. Policy computes the intersection of agent capability, delegator authority, task need, environment, and risk.
4. An identity broker issues short-lived, audience-bound credentials or capability tokens.
5. Proxies attach credentials at the tool boundary; raw secrets do not enter the model context or sandbox.
6. Every use records the identity, delegation chain, policy version, operation, resource, and result.
7. Completion, timeout, policy change, or incident revokes the lease.

AWS AgentCore Identity describes the product form of this pattern: agent identities, credential providers, and delegated access to external resources without embedding user credentials in agent code ([AWS — AgentCore Identity](https://aws.amazon.com/blogs/machine-learning/introducing-amazon-bedrock-agentcore-identity-securing-agentic-ai-at-scale/)). The architectural point is vendor-neutral: authority is issued just in time and presented just at the boundary.

A2A delegation makes the chain explicit. Agent A should not send Agent B a bearer token with all of A's privileges. It should request a narrower token naming B as the audience, the delegated task as purpose, the permitted operation and resource, and a short expiry. If B delegates again, the new authority cannot exceed the intersection of the existing chain. This blocks **trust escalation** (Ch 3): a low-trust worker cannot persuade a privileged parent to launder its result into a high-privilege action without a new policy decision.

### 18.5 The Agent Gateway and Policy Enforcement

The **agent gateway** is the enforcement point on the data-plane path. It can broker model calls, MCP and API tool calls, A2A messages, egress, and sometimes memory access. The gateway is valuable because instructions such as "never send secrets" are probabilistic; a gateway can deterministically deny an unauthorized destination, strip a credential, enforce a budget, or require human approval.

Each request should arrive with a signed or otherwise verifiable execution envelope:

```text
agent identity + version
delegating principal + tenant
task purpose + run/session id
requested action + resource
policy and configuration versions
budget and expiry
trace/span correlation id
```

Policy then returns more than allow or deny. Useful outcomes include **allow**, **deny**, **allow with redaction**, **allow in a stronger sandbox**, **require human approval**, and **allow with a lower budget or read-only scope**. The decision and its inputs become part of the trace. This is how the stake-proportionate interaction of Chapter 15 and the containment matrix of Chapter 5 become consistent across every agent rather than conventions each team reimplements.

Gateway placement matters. A central gateway gives uniform enforcement and visibility but can become a latency bottleneck and single point of failure. Local sidecars reduce latency and survive partial disconnection but make policy distribution and evidence collection harder. Mature designs often separate centralized policy administration from distributed enforcement, with signed policy bundles, fail-closed rules for consequential actions, and carefully chosen fail-open behavior only for low-risk reads.

### 18.6 Fleet Lifecycle: Reconcile, Suspend, Upgrade, Revoke

An agent has more lifecycle states than deployed or stopped. A useful fleet state machine includes **draft**, **evaluated**, **approved**, **deployed**, **suspended**, **deprecated**, **revoked**, and **retired**. Runs have a separate state machine—queued, active, waiting for approval, checkpointed, completed, failed, or canceled—and sandboxes have another (Ch 7). The control plane relates these lifecycles without conflating them.

The governing pattern is reconciliation: compare declared state with observed state and take deterministic action.

- If an agent version is revoked, block new runs, revoke credentials, and suspend or terminate affected in-flight runs according to risk.
- If a policy changes, identify which sessions require re-authorization rather than letting old authority persist indefinitely.
- If a version is upgraded, canary it against a bounded traffic slice while retaining the old version for rollback (Ch 17).
- If an owner leaves or a publisher is compromised, traverse the registry dependency graph to find agents, skills, MCP servers, and schedules that inherit that trust.
- If a run loses its connection, preserve the durable session and reacquire a sandbox or worker rather than duplicating the task (Ch 7).

Fleet kill switches belong here. They should revoke the capability at gateways and identity brokers, not merely send "stop" to a model. Scope matters: operators need to stop one run, one version, one publisher, one tenant, one tool dependency, or the entire fleet without using the broadest switch for every incident.

### 18.7 Lineage, Audit, and Non-Repudiation

Ordinary logs answer "what request hit this service?" Agent audit must answer a longer causal question:

> Which user or service delegated which purpose to which agent version, running under which model, harness, tools, memory, sandbox, and policy; which evidence led to which decision; which authority allowed the side effect; and who approved or overrode it?

The answer is a lineage graph connecting registry artifacts, build attestations, identities, delegation events, session and run IDs, trace spans, policy decisions, human approvals, tool results, memory writes, and final environmental outcomes. Stable content hashes or immutable version identifiers keep a later edit from rewriting the history of what ran.

**Non-repudiation** should be used carefully. A signed event can show that a particular workload identity produced a request and that a policy service authorized it; it cannot prove that a human understood an approval dialog or that a model's natural-language rationale is truthful. Strong audit therefore combines cryptographic integrity with operational evidence: append-only logs, trusted timestamps, credential and policy versions, outcome checks, approval identity, and retention rules. Store enough to investigate, but apply the privacy discipline of Chapter 17—an audit system that indiscriminately preserves prompts, secrets, and personal data creates a second security problem.

Lineage also makes evaluation and improvement safer. A production correction can be traced to the exact artifact that failed, turned into a redacted regression case, and used to promote a new version without mutating the old one (Ch 12). The control plane supplies the custody chain; the eval gate supplies the evidence.

### 18.8 Open Problems in the Control Plane

The control plane is emerging, not settled. The most important open problems are:

- **Portable identity and delegation.** Agent Cards and registries describe capability, but cross-platform standards for principal identity, delegation chains, revocation, and purpose-bound authority remain immature.
- **Policy composition.** User policy, tenant policy, agent policy, tool policy, data-residency rules, and human approvals can conflict. Precedence and explanation need a portable semantics.
- **Memory governance.** Provenance, permission-at-retrieval, expiry, correction, and poisoning defense are not consistently represented across memory products.
- **Cross-organizational lineage.** A2A chains cross audit domains; each organization may expose too little evidence for the other to assess trust, or too much private trace data.
- **Evaluator authority.** A model judge can block a deploy or trigger an incident. Its identity, calibration, conflicts, and appeal path need the same rigor as other privileged decision-makers (Ch 10).
- **Fleet-level supervision.** Risk ranking, alert deduplication, and meaningful human control must scale without turning the operator into a rubber stamp (Ch 15).
- **Control-plane compromise.** Centralized registries, policy services, and identity brokers are high-value targets. Their blast radius demands separation of duties, signed artifacts, minimal trust roots, and independent recovery paths.

The direction is clear even while the standards are not: agents are becoming principals in distributed systems. The mature harness is no longer only a loop around a model. It is a governed relationship among identities, artifacts, policies, environments, evidence, and people.

---

## Diagram: The Agent Control Plane

```mermaid
flowchart TB
    subgraph CP["Control Plane"]
        REG["Registry<br/>agents · tools · skills · versions"]
        ID["Identity & Delegation<br/>agent · sponsor · user · purpose"]
        POL["Policy & Gateway<br/>authorize · redact · approve · deny"]
        LIFE["Fleet Lifecycle<br/>deploy · suspend · upgrade · revoke"]
        AUD["Lineage & Audit<br/>artifacts · decisions · outcomes"]
        REG --> ID --> POL --> LIFE --> AUD
    end

    subgraph DP["Data Plane"]
        RUN["Agent Run<br/>model + harness"]
        BOX["Sandbox / Runtime"]
        TOOL["Tools · MCP · APIs"]
        PEER["Peer Agents / A2A"]
        MEM["Memory"]
        RUN --> BOX
        RUN --> TOOL
        RUN --> PEER
        RUN --> MEM
    end

    CP -->|"identity · policy · version · budget"| DP
    DP -->|"events · evidence · outcome · cost"| CP
    HUMAN["Human Owner / Reviewer"] -->|"delegate · approve · revoke"| CP
```

*The data plane does the work; the control plane decides which identity, artifact, authority, lifecycle, and evidence govern that work.*

---

## Key Takeaways

- **The fleet is the next unit after the loop**: loop engineering governs one task; a control plane governs many agents, versions, environments, and organizations.
- **Separate data plane from control plane**: agents propose and execute work; deterministic services register artifacts, issue authority, enforce policy, reconcile lifecycle, and preserve evidence.
- **Agent identity is distinct from user and runtime identity**: bind every run to an agent version, sponsor, delegator, purpose, environment, and expiry.
- **A registry is a governed source of truth**: include ownership, dependencies, permissions, attestations, deployment state, and immutable lineage—not only discovery metadata.
- **Authority should be just-in-time and purpose-bound**: use short-lived, audience-scoped credentials attached at the tool boundary, with delegation that can only narrow.
- **The gateway turns policy into enforcement**: allow, deny, redact, strengthen isolation, reduce scope, or require approval—and record why.
- **Lifecycle is reconciliation**: independently manage agent definitions, runs, and sandboxes; make suspension, migration, canary, rollback, and revocation first-class.
- **Audit is a causal lineage graph**: connect user delegation, agent and policy versions, evidence, authorization, side effects, and outcomes while minimizing sensitive content.

## Further Reading

- NIST, *Identity and Authorization for Software Agents*, Feb 2026. https://www.nist.gov/news-events/news/2026/02/new-concept-paper-identity-and-authority-software-agents
- Google Cloud, *Agent Registry Overview*, 2026. https://docs.cloud.google.com/agent-registry/overview
- AWS, *AWS Agent Registry in Amazon Bedrock AgentCore (Preview)*, Apr 2026. https://aws.amazon.com/about-aws/whats-new/2026/04/aws-agent-registry-in-agentcore-preview/
- AWS, *Introducing Amazon Bedrock AgentCore Identity: Securing Agentic AI at Scale*, 2026. https://aws.amazon.com/blogs/machine-learning/introducing-amazon-bedrock-agentcore-identity-securing-agentic-ai-at-scale/
- Microsoft, *Agent Registry in the Microsoft 365 Admin Center*, 2026. https://learn.microsoft.com/en-us/microsoft-365/admin/manage/agent-registry?view=o365-worldwide
- Anthropic Safeguards Research Team, *How We Contain Claude*, May 2026. https://www.anthropic.com/engineering/how-we-contain-claude
- Google Cloud, *Agent Executor: Google's Distributed Agent Runtime*, 2026. https://cloud.google.com/blog/products/ai-machine-learning/agent-executor-googles-distributed-agent-runtime/
- AWS, *AgentOps: Operationalize Agentic AI at Scale with Amazon Bedrock AgentCore*, 2026. https://aws.amazon.com/blogs/machine-learning/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedrock-agentcore/
