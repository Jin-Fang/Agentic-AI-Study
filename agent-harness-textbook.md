# Agent Harness: A Practitioner's Textbook

*A fact-based synthesis of contemporary writing on harness engineering, drawn from the [Awesome Harness Engineering](https://github.com/walkinglabs/awesome-harness-engineering) reading list. Every substantive claim is referenced inline.*

---

## Preface

This book is about the system that surrounds a language model when it is asked to do real work. That system has a name now — *the harness* — and a small but rapidly maturing body of literature describing how to build it. The chapters below stitch that literature into a single narrative. Readers who want to follow any thread back to its source will find the original article cited at the relevant claim.

The premise of the field is simple. As Vivek Trivedy of LangChain puts it: "Agent = Model + Harness. **If you're not the model, you're the harness.**" ([LangChain — The Anatomy of an Agent Harness](https://blog.langchain.com/the-anatomy-of-an-agent-harness/)). Everything else — system prompts, tools, sandboxes, memory, sub-agents, control flow, evaluation infrastructure — is the harness. The work of designing it well is what we will study.

---

## Chapter 1: What Is an Agent Harness?

### 1.1 The Model + Harness Equation

A raw language model takes text in and produces text out. That is the entirety of its native capability. To turn that into an agent — something that can browse a codebase, run tests, write to a database, talk to a user, recover from errors, and sustain progress across hours of work — every additional capability must be built around the model. LangChain enumerates the harness as system prompts, tools and their descriptions, bundled infrastructure (filesystem, sandbox, browser), orchestration logic such as sub-agent spawning and model routing, and hooks or middleware for deterministic execution like compaction, continuation, and lint checks ([LangChain — The Anatomy of an Agent Harness](https://blog.langchain.com/the-anatomy-of-an-agent-harness/)).

This framing matters because it forces the design question into the open. Out of the box, a model cannot maintain durable state across interactions, execute code, access real-time knowledge, or set up environments and install packages to complete work; these are all harness-level features ([LangChain — The Anatomy of an Agent Harness](https://blog.langchain.com/the-anatomy-of-an-agent-harness/)). Even basic chat — the appearance of a model "remembering" what was just said — is a harness pattern: a while-loop that tracks previous messages and appends new ones to context.

HumanLayer's working definition is essentially the same equation, viewed from the perspective of someone configuring a coding agent: "coding agent = AI model(s) + harness," where the harness is the agent's runtime, or its peripherals — what the model uses to interact with its environment ([HumanLayer — Skill Issue: Harness Engineering for Coding Agents](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents)).

### 1.2 Bounded Contexts: Inner and Outer Harness

The word "harness" is used loosely, and writers from Thoughtworks have noted that it covers different layers depending on whom you ask. Birgitta Böckeler proposes thinking of three concentric rings: the model at the core, the coding agent's *builder harness* in the middle (the system prompt and tools shipped by Anthropic, OpenAI, etc.), and the *user harness* on the outside (the AGENTS.md, hooks, skills, and review agents the team adds to fit their codebase) ([Thoughtworks / Martin Fowler — Harness Engineering](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html)). Most working engineers operate primarily in the outer ring.

### 1.3 Why Harnesses Exist: Working Backwards from Model Deficits

LangChain offers a useful derivation: list the agent behaviors you want, then list what models cannot natively do, and the harness components fall out as necessary remediation ([LangChain — The Anatomy of an Agent Harness](https://blog.langchain.com/the-anatomy-of-an-agent-harness/)). Filesystems exist because models can only operate on what is in the context window, and a filesystem provides durable storage, an offload surface, and a collaboration surface for multiple agents and humans. Bash and code execution exist because pre-defining every tool the agent might need is intractable, and giving the model a general-purpose execution channel lets it design its own tools on the fly. Sandboxes exist because that execution has to happen somewhere safe. Memory and search exist because models have no knowledge beyond their weights and current context, so any new information has to be injected. Compaction, tool-result offloading, and skills exist because the context window is finite and degrades as it fills.

Each piece is a response to a specific limitation, and the harness as a whole is the sum of those responses.

### 1.4 The Historical Arc: From Prompt Engineering to Harness Engineering

Anthropic frames the recent shift as a natural progression. In the early days of LLM applications, the dominant work was *prompt engineering*: writing and organizing instructions for one-shot tasks. As applications grew into multi-turn agents that operate over longer time horizons, the relevant work shifted to *context engineering* — strategies for curating and maintaining the optimal set of tokens (information) during LLM inference, including everything that lands in context outside of the prompts themselves ([Anthropic — Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)).

Harness engineering sits one level up from context engineering. It is the practice, as Mitchell Hashimoto has put it, of taking the time to engineer a solution every time the agent makes a mistake, so that it never makes that mistake again ([HumanLayer — Skill Issue: Harness Engineering for Coding Agents](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents) quoting Hashimoto). Where prompt engineering tunes a single prompt, harness engineering iterates on the entire system in which prompts run.

### 1.5 Frameworks, Runtimes, and Harnesses

These three terms are sometimes used interchangeably. LangChain's Harrison Chase distinguishes them as follows ([LangChain — Agent Frameworks, Runtimes, and Harnesses, Oh My!](https://blog.langchain.com/agent-frameworks-runtimes-and-harnesses-oh-my/)):

A *framework* — like LangChain itself, Vercel's AI SDK, CrewAI, the OpenAI Agents SDK, or Google ADK — provides abstractions that make it easier to get started and standardize how applications are built. A *runtime* — like LangGraph, Temporal, or Inngest — provides infrastructure-level concerns: durable execution, streaming, human-in-the-loop support, thread-level and cross-thread persistence. A *harness* — like LangChain's DeepAgents or Anthropic's Claude Agent SDK — sits a level higher again: it ships with default prompts, opinionated tool handling, planning tools, filesystem access, and other "batteries included" features. Lines blur (LangGraph is reasonably described as both runtime and framework), but the distinction is useful when deciding what to adopt.

### 1.6 The Skeptical Counter-Position

The harness-engineering frame is not without dissent. HumanLayer's argument in "Skill Issue" is that most teams blame the model — "GPT-6 will fix it," "we just need better instruction-following" — when the actual issue is harness configuration ([HumanLayer — Skill Issue: Harness Engineering for Coding Agents](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents)). As models improve, existing failure modes will disappear, but smarter models will be given harder problems and continue to fail in unexpected ways, because unexpected failures are a fundamental property of non-deterministic systems. The implication is that harness engineering is permanent work, not scaffolding to be discarded once models get good enough.

LangChain reaches a similar conclusion: as models become more capable, some of what lives in the harness today will be absorbed into the model, but harness engineering will remain useful — both for patching over deficiencies and for engineering systems around model intelligence to make it more effective ([LangChain — The Anatomy of an Agent Harness](https://blog.langchain.com/the-anatomy-of-an-agent-harness/)).

---

## Chapter 2: Context as a Finite Resource

### 2.1 Context Rot and the Attention Budget

The single most important fact about modern language models, for the purposes of this book, is that their performance on a fixed task degrades as the context window fills. Anthropic calls this "context rot" and links it to needle-in-a-haystack benchmarks: as the number of tokens increases, the model's ability to accurately recall information from that context decreases ([Anthropic — Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)). The effect varies in steepness across models but emerges across all of them.

Anthropic's mechanistic explanation: the transformer architecture lets every token attend to every other token, producing n² pairwise relationships for n tokens. As context lengthens, the model's ability to capture those relationships gets stretched thin. Models are also trained on data distributions where shorter sequences are more common, so they have less experience with — and fewer specialized parameters for — context-wide dependencies. Position encoding interpolation lets models handle longer sequences than they were trained on, but at the cost of degraded position understanding ([Anthropic — Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)).

The practical conclusion: context is a finite resource with diminishing marginal returns. Anthropic phrases it as an "attention budget" that every new token depletes. HumanLayer puts it more bluntly — even as models support longer context windows, you will always get better results with a small, focused prompt and context, and most builders push the "tool-calling loop" idea aside when they realize anything more than 10–20 turns becomes a mess the LLM cannot recover from ([HumanLayer — 12-Factor Agents](https://www.humanlayer.dev/blog/12-factor-agents)).

A bigger context window does not help with this in the way one might hope. As HumanLayer points out, when a lab offers an extended-context version of a model, you usually get the same model with techniques like YaRN extending the sequence length, not a larger "instruction budget"; for needle-in-a-haystack the bigger window does not make the model better at finding the needle, it just makes the haystack bigger ([HumanLayer — Skill Issue: Harness Engineering for Coding Agents](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents)).

### 2.2 The Anatomy of Effective Context

Given the budget constraint, the goal — Anthropic's phrasing — is "the smallest possible set of high-signal tokens that maximize the likelihood of some desired outcome" ([Anthropic — Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)). Concretely:

System prompts should be at the right *altitude* — neither hardcoded if-else logic for every edge case nor vague high-level guidance, but specific enough to guide behavior while leaving the model strong heuristics. Anthropic recommends organizing prompts into sections (`<background_information>`, `<instructions>`, `## Tool guidance`, etc.) using XML or Markdown delimiters, though formatting matters less as models improve.

Tools define the contract between agent and environment. They should be self-contained, clearly described, and minimally overlapping. The most common failure Anthropic sees is bloated tool sets that cover too much functionality with ambiguous decision points; "if a human engineer can't definitively say which tool should be used in a given situation, an AI agent can't be expected to do better."

Examples (few-shot) should be diverse and canonical, not a laundry list of every edge case. Anthropic's analogy: for an LLM, examples are the "pictures" worth a thousand words.

### 2.3 The KV-Cache: Why Stable Prefixes Pay Off

A practical lever that does not appear in the academic literature on context engineering but is central to production agent design is the KV-cache. Manus argues it is "the single most important metric for a production-stage AI agent" ([Manus — Context Engineering for AI Agents: Lessons from Building Manus](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)).

The mechanics: a typical agent receives input, picks an action from its tool space, executes it, and appends the action and observation to context for the next turn. Context grows with every step while output stays short, making the prefilling-to-decoding ratio extremely skewed — Manus reports an average input-to-output token ratio of 100:1. Identical prefixes can be served from the KV-cache, dropping time-to-first-token and inference cost. Manus cites Claude Sonnet pricing where cached input tokens cost $0.30 per million and uncached cost $3 per million — a 10x difference.

Manus's three rules for keeping the cache hot: keep the prompt prefix stable (a single-token difference invalidates the cache from that point on, so common mistakes like timestamping system prompts to the second are costly); make context append-only, with deterministic JSON serialization (some libraries do not guarantee key ordering, which silently breaks the cache); and mark cache breakpoints explicitly when the inference framework requires it.

### 2.4 Mask, Don't Remove

Manus's second principle is about action spaces. As tool counts grow — and MCP made this easy by letting users plug in hundreds of tools — the impulse is to dynamically load and unload tools mid-iteration. Manus's experiments produce a clear rule: avoid this. Tool definitions live near the front of context, so any change invalidates the cache for everything downstream; and previous turns may reference tools that no longer exist, leading to schema violations or hallucinated calls ([Manus — Context Engineering for AI Agents: Lessons from Building Manus](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)).

The alternative is logit masking: keep all tool definitions in context but, at decoding time, mask the logits for tools that should not be available given the current state. Most provider APIs support this through response prefill (Auto, Required, Specified modes in the Hermes function-calling format). Manus uses consistent action-name prefixes — `browser_*` for browser tools, `shell_*` for shell tools — so an entire group can be enforced or excluded with a simple constraint.

### 2.5 The File System as the Ultimate Context

Even with a 128K-token window, real agentic work overruns context regularly. Observations from web pages and PDFs are huge; performance degrades long before the technical limit; and long inputs are expensive even with caching ([Manus — Context Engineering for AI Agents: Lessons from Building Manus](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)).

Manus's solution, and one Anthropic and LangChain converge on, is to treat the filesystem as the agent's true memory: unlimited, persistent, directly operable by the agent, and indexed by paths the agent can use as references. Manus's compression strategies are deliberately *restorable* — a web page can be dropped from context as long as the URL is preserved, and a document's contents can be omitted if its path remains.

LangChain calls the filesystem "arguably the most foundational harness primitive" because it provides a workspace for reading data, code, and documentation; lets agents offload work incrementally instead of holding it all in context; and acts as a natural collaboration surface for multi-agent and human-agent coordination ([LangChain — The Anatomy of an Agent Harness](https://blog.langchain.com/the-anatomy-of-an-agent-harness/)). Adding git on top brings versioning, rollback, and branching.

### 2.6 Just-in-Time Retrieval

The traditional pattern — embed everything, retrieve top-k chunks, prepend to context — is being supplemented by a *just-in-time* approach. Rather than pre-processing everything up front, agents maintain lightweight identifiers (file paths, queries, links) and dynamically load data into context when needed ([Anthropic — Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)).

Anthropic's Claude Code uses this pattern for large-codebase work: the model writes targeted queries, stores results, and uses `head` and `tail` to analyze large data without loading it all. The metadata of file paths itself is informative — `test_utils.py` in a `tests/` folder implies a different role than the same name in `src/core_logic/`. Folder hierarchies, naming, and timestamps all become signals an agent can use to navigate.

The trade-off: runtime exploration is slower than retrieving pre-computed data, and an agent without proper tool guidance will waste context chasing dead ends. The hybrid pattern is now common — drop a small amount of high-value context up front (Claude Code drops `CLAUDE.md` files into context naively) and let the agent explore for the rest.

---

## Chapter 3: Compaction, Memory, and the Sub-Agent Pattern

Even with disciplined context engineering, long-horizon tasks exceed any single context window. The literature converges on three techniques.

### 3.1 Compaction

Compaction takes a conversation nearing the context window limit, summarizes it, and reinitiates a new context window with the summary ([Anthropic — Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)). In Claude Code, the message history is passed to the model with instructions to preserve architectural decisions, unresolved bugs, and implementation details while discarding redundant tool outputs. The agent continues with the compressed context plus the most recently accessed files.

Anthropic's advice on compaction prompts: tune them on real complex traces, maximize recall first to ensure all relevant information is captured, then iterate on precision to remove the superfluous. The lightest-touch form is tool-result clearing — once a tool has been called and the result acted on, the raw result can usually be discarded.

### 3.2 Structured Note-Taking

The complementary pattern is *agentic memory*: having the agent regularly write notes to disk that can be reloaded later. Anthropic offers Claude playing Pokémon as a clean example — across thousands of game steps, the agent maintains tallies ("for the last 1,234 steps I've been training my Pokémon in Route 1, Pikachu has gained 8 levels toward the target of 10"), develops maps of regions, and tracks combat strategies, allowing it to resume multi-hour training sequences after context resets ([Anthropic — Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)).

Manus's todo.md trick is a specialized form of this — but with a twist explored in the next section.

### 3.3 Recitation: Manipulating Attention Through the End of Context

Manus reports that when its agent handles complex tasks, it creates a `todo.md` file and rewrites it step-by-step as the task progresses, checking off completed items. This is not just for organization. A typical Manus task takes ~50 tool calls on average; in long contexts the model is vulnerable to drifting off-topic or forgetting earlier goals. By repeatedly rewriting the todo list, the agent recites its objectives into the *end* of the context, pushing the global plan into the model's recent attention span and avoiding the well-known "lost-in-the-middle" problem ([Manus — Context Engineering for AI Agents: Lessons from Building Manus](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)).

### 3.4 Sub-Agents and the Context Firewall

The third pattern, and the most architecturally consequential, is sub-agent decomposition. A specialized sub-agent handles a focused task with its own context window, may use tens of thousands of tokens internally, and returns only a condensed 1,000–2,000 token summary to the parent ([Anthropic — Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)). HumanLayer calls this the *context firewall*: the parent thread, responsible for orchestration, never sees the intermediate noise from sub-agent work and stays out of the "dumb zone" for far longer ([HumanLayer — Skill Issue: Harness Engineering for Coding Agents](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents)).

HumanLayer is emphatic about what does and does not work here. Setting up "frontend engineer" and "backend engineer" personas as sub-agents does not work; using sub-agents for context control does. Good sub-agent use cases are tasks with a simple final answer but many intermediate tool calls — locating a definition in the codebase, tracing information flow across services, running broad research.

Sub-agents also help with cost control: HumanLayer uses an expensive model (Opus) for the orchestrator and a cheaper model (Sonnet or Haiku) for sub-agents. There is no need to burn Opus tokens on a `grep`.

Anthropic's multi-agent research system is the canonical example of this pattern at scale. A lead agent analyzes the query and spawns specialized sub-agents to explore aspects in parallel; each sub-agent uses its own context window; results are compressed back to the lead, which synthesizes a final report. The lead-agent-as-Opus, sub-agents-as-Sonnet configuration outperformed single-agent Opus by 90.2% on Anthropic's internal research evaluation ([Anthropic — How We Built Our Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)). The mechanism is largely token economics: in their analysis, three factors explained 95% of performance variance on the BrowseComp benchmark, with token usage alone explaining 80%.

The catch is cost. Multi-agent systems use roughly 15× more tokens than chats and 4× more than single-agent runs in Anthropic's data, so they only make economic sense for high-value tasks where parallelization actually helps. They are not a fit for tightly coupled work — most coding tasks, where sub-tasks share state — and current models are not strong at real-time coordination across agents.

### 3.5 Don't Few-Shot Yourself Into a Rut

Manus offers a counter-intuitive principle: too much consistency in the context can be harmful. Models are excellent mimics — they imitate patterns in context. If the trace is full of similar past action-observation pairs, the model will follow that pattern even when it is no longer optimal, leading to drift, overgeneralization, and hallucination. Manus's example is reviewing a batch of 20 résumés, where the agent falls into a rhythm and starts repeating actions for their own sake ([Manus — Context Engineering for AI Agents: Lessons from Building Manus](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)).

Their fix: introduce small, structured variation — different serialization templates, alternate phrasing, minor reordering, controlled noise. Diversity in the trace keeps attention spread.

### 3.6 Keep the Wrong Stuff In

The complementary principle: do not clean up errors. The natural impulse is to retry failed actions and erase the failed traces. Manus argues this removes evidence the model needs to update its priors away from similar mistakes ([Manus — Context Engineering for AI Agents: Lessons from Building Manus](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)). Leaving failed actions and stack traces in the context lets the model implicitly learn from them. Manus calls error recovery "one of the clearest indicators of true agentic behavior" — and notes it is underrepresented in academic benchmarks, which tend to focus on success under ideal conditions.

HumanLayer formalizes this as Factor 9: compact errors into context. The agent's *self-healing* property — reading an error and adjusting its next call — is one of the genuine benefits of LLM agents, and it works only when the error is visible ([HumanLayer — 12-Factor Agents](https://www.humanlayer.dev/blog/12-factor-agents)). With a counter to limit consecutive identical errors, this pattern is robust.

---

## Chapter 4: Tools and the Agent–Computer Interface

### 4.1 Why Tool Design Is Different

Anthropic introduces the term *agent–computer interface* (ACI) by analogy with HCI: as much engineering should go into how an agent uses tools as goes into how a human uses a screen ([Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)). Three concrete recommendations for tool format:

- Give the model enough tokens to "think" before it has to commit to syntax it cannot easily un-write.
- Keep formats close to what the model has seen in training data.
- Avoid formatting overhead like accurate line-counting in diff headers or excessive string-escaping in JSON-embedded code.

When Anthropic built its SWE-bench agent, it spent more time optimizing tool schemas than the prompt itself. A specific improvement: switching tools from relative to absolute filepaths fixed nearly all path-related errors after the agent moved out of the root directory.

### 4.2 Choosing the Right Tools — and the Right Number

Anthropic's later "Writing Effective Tools for Agents" elaborates on the central trap: more tools do not lead to better outcomes ([Anthropic — Writing Effective Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents)). A common error is wrapping every API endpoint as a tool whether or not it suits an agent. Agents have different *affordances* than traditional software: an agent searching an address book by `list_contacts` has to read every contact token-by-token, brute-force, because its context is limited; the right tool is `search_contacts` or `message_contact`.

Tools should consolidate frequently-chained operations. Rather than `list_users`, `list_events`, and `create_event`, build `schedule_event`. Rather than `read_logs`, build `search_logs`. Rather than `get_customer_by_id` + `list_transactions` + `list_notes`, build `get_customer_context`.

### 4.3 Namespacing

When agents have access to dozens of MCP servers and hundreds of tools, name collisions and ambiguous purpose become critical failure modes. Anthropic recommends grouping related tools under common prefixes — service prefixes (`asana_*`, `jira_*`) and resource prefixes within those (`asana_projects_*`, `asana_users_*`). They report that prefix vs. suffix namespacing schemes have non-trivial effects on tool-use evaluations and that the right scheme is workload-specific ([Anthropic — Writing Effective Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents)).

Manus uses the same pattern for action-space control: by giving all browser tools a `browser_` prefix and all shell tools a `shell_` prefix, they can mask large groups of tools at once with simple logit constraints ([Manus — Context Engineering for AI Agents: Lessons from Building Manus](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)).

### 4.4 Returning Meaningful Context

Tool responses should prioritize relevance over flexibility, and natural-language identifiers over technical ones. Anthropic finds that resolving alphanumeric UUIDs to semantically meaningful labels (or even 0-indexed IDs) significantly improves Claude's precision and reduces hallucinations ([Anthropic — Writing Effective Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents)). Where both are needed — natural names for the agent, technical IDs for downstream calls — a `response_format` enum with `concise` and `detailed` modes works well: concise responses can be a third the size of detailed ones in their Slack examples.

### 4.5 Token-Efficient Responses

Tool responses are a major source of context bloat. Anthropic restricts Claude Code's tool responses to 25,000 tokens by default, and recommends a combination of pagination, range selection, filtering, and truncation with sensible defaults ([Anthropic — Writing Effective Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents)). Truncated responses should include guidance steering the agent toward more efficient strategies (small targeted searches over one broad search, for instance), and error responses should be helpful, not opaque tracebacks.

HumanLayer's "back-pressure" practice in their own codebase is a direct application of this: their build and test hooks swallow output on success, surfacing only errors. Early on they had the agent run the full test suite after every change, and 4,000 lines of passing tests would flood the context window, causing the agent to lose track of the actual task and start hallucinating about test files ([HumanLayer — Skill Issue: Harness Engineering for Coding Agents](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents)).

### 4.6 Prompt-Engineering Tool Descriptions

Anthropic positions this as one of the most effective levers, and reports that it took precise refinements to tool descriptions for Claude Sonnet 3.5 to achieve state-of-the-art on SWE-bench Verified ([Anthropic — Writing Effective Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents)). The advice: write the tool description as you would for a new junior engineer joining the team. Make implicit context explicit (specialized query formats, niche terminology, relationships between resources). Use unambiguous parameter names — `user_id` rather than `user`. Run many examples in a workbench, look at the mistakes, and iterate.

A concrete debugging example: when Anthropic launched Claude's web search tool, traces revealed that Claude was needlessly appending `2025` to the `query` parameter, biasing results. Fixing it required no model retraining — only a clearer tool description.

### 4.7 Code Execution as a Meta-Tool

A more recent shift: instead of presenting MCP tools as direct calls, present them as a code API that the agent invokes by writing code. Anthropic's "Code Execution with MCP" makes the case that for agents with hundreds of tools across dozens of MCP servers, the standard pattern of loading every tool definition into context up front and passing every intermediate result through the model is wasteful ([Anthropic — Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)).

The alternative: expose MCP servers as a filesystem of TypeScript files, one per tool, each file containing a typed wrapper around `callMCPTool`. The agent discovers tools by listing directories and reading the specific tool files it needs. In Anthropic's Google Drive → Salesforce example, this drops token usage from 150,000 to 2,000 — a 98.7% saving.

The benefits compound:

- **Progressive disclosure**: tools are loaded only when needed, addressing the up-front context cost.
- **Context-efficient results**: the agent can filter a 10,000-row spreadsheet to five matching rows in the execution environment before any data crosses into the model's context.
- **Better control flow**: loops, conditionals, and error handling use familiar code patterns, saving on time-to-first-token because the runtime evaluates the conditions, not the model.
- **Privacy-preserving operations**: intermediate results stay in the execution environment by default; only what the agent explicitly logs reaches the model. PII can be tokenized at the MCP-client boundary so it never reaches the model at all.
- **State persistence and skills**: agents can save working code as reusable functions backed by `SKILL.md` files, building up a toolbox over time.

Cloudflare reported similar findings under the name "Code Mode," reinforcing the conclusion: LLMs are good at writing code, and developers should let them ([Anthropic — Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)).

The catch: code execution requires sandboxing infrastructure, which has its own operational and security cost.

### 4.8 Iterative Tool Refinement With Evals

Anthropic's recommended workflow for tool development has four stages ([Anthropic — Writing Effective Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents)):

1. **Prototype** the tools in a local MCP server, test by hand, collect intuition.
2. **Build an evaluation** with realistic tasks (multiple tool calls, real data, no toy sandboxes), each paired with verifiable success criteria.
3. **Run the evaluation** programmatically, instructing agents to output reasoning blocks before tool calls so chain-of-thought is visible. Track top-level accuracy and metrics like total runtime, tool call counts, total tokens, and tool errors.
4. **Analyze results** by reading transcripts, paying attention to what agents *don't* say (LLMs do not always say what they mean), and refactor tools accordingly.

Anthropic ran this loop on their own internal Slack and Asana tools and found that a Claude-optimized version of human-written tools outperformed expert manual implementations on held-out test sets — a result that validates the loop and is an early instance of agents improving their own tools.

---

## Chapter 5: Sandboxing, Guardrails, and Safe Autonomy

### 5.1 The Permission Fatigue Problem

Coding agents that run with no oversight are dangerous; coding agents that ask permission for every action are unusable. Anthropic frames this as approval fatigue: "Constantly clicking 'approve' slows down development cycles and can lead to 'approval fatigue,' where users might not pay close attention to what they're approving, and in turn making development less safe" ([Anthropic — Beyond Permission Prompts: Making Claude Code More Secure and Autonomous](https://www.anthropic.com/engineering/claude-code-sandboxing)). The solution is structural: define boundaries within which the agent can act freely, and only ask for permission when those boundaries are crossed.

In their internal usage, sandboxing safely reduces permission prompts by 84%.

### 5.2 Filesystem and Network Isolation Must Be Paired

Claude Code's sandbox enforces two boundaries simultaneously, and Anthropic argues both are required. Filesystem isolation prevents a prompt-injected agent from modifying sensitive files; network isolation prevents it from leaking data or downloading malware. Without network isolation, a compromised agent could exfiltrate SSH keys; without filesystem isolation, a compromised agent could escape the sandbox and reach the network ([Anthropic — Beyond Permission Prompts](https://www.anthropic.com/engineering/claude-code-sandboxing)).

The implementation builds on OS-level primitives — Linux bubblewrap and macOS seatbelt — and covers not just direct Claude Code interactions but any subprocess. Network access is funneled through a Unix domain socket to a proxy that enforces domain restrictions and handles user confirmation for newly requested domains. The runtime is open-sourced.

Claude Code on the web extends this to a cloud sandbox where sensitive credentials (git credentials, signing keys) are never inside the sandbox with the agent at all. A custom proxy handles git interactions, attaching scoped credentials only after validating that the operation is permitted (e.g., pushing only to the configured branch).

### 5.3 Hooks and Middleware as Deterministic Enforcement

The sandbox is one form of programmatic guardrail; hooks and middleware are another, finer-grained one. Claude Code supports user-defined commands or scripts that run automatically on lifecycle events — at agent start, after a tool call, on stop, and so on ([HumanLayer — Skill Issue: Harness Engineering for Coding Agents](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents)). LangChain's middleware concept is structurally equivalent.

Common uses are notifications (sounds when an agent finishes), automated approvals or denials (deny migration commands; ask the user to run them instead), integrations (post a Slack message, open a PR), and verification (run typecheck and build on stop, surface errors to the agent so it has to fix them before finishing). HumanLayer's example hook runs Biome and TypeScript in parallel on every Claude stop, exits silently on success, and on failure surfaces only the errors with exit code 2, telling the harness to re-engage the agent.

LangChain reports this kind of middleware was central to lifting their deepagents-cli from Top 30 to Top 5 on Terminal-Bench 2.0. Their `PreCompletionChecklistMiddleware` intercepts the agent before exit and reminds it to run a verification pass against the task spec; a `LocalContextMiddleware` runs at start to map the working directory and discover available tools; a `LoopDetectionMiddleware` tracks per-file edit counts and prompts the agent to reconsider after N edits to the same file, breaking "doom loops" of small variations on a broken approach ([LangChain — Improving Deep Agents with Harness Engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/)).

### 5.4 Feedforward and Feedback: A Cybernetic View

Thoughtworks' Birgitta Böckeler offers a higher-level taxonomy ([Thoughtworks — Harness Engineering](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html)). Outer-harness controls fall into two directions:

- **Guides (feedforward)** anticipate the agent's behavior and steer it before it acts. They increase the probability of good output on the first attempt — instructions in AGENTS.md, skills, reference documentation, language-server hints.
- **Sensors (feedback)** observe after the agent acts and help it self-correct. Tests, linters, type checkers, AI code review.

A harness with only feedforward guides keeps issuing rules but never learns whether they work; a harness with only feedback sensors keeps catching the same mistake without preventing recurrence. Both are needed.

Within each direction there is a second axis:

- **Computational** controls — linters, type checkers, structural tests — are deterministic, run in milliseconds to seconds, and produce reliable results.
- **Inferential** controls — semantic analysis, AI code review, LLM-as-judge — handle nuance but are slower, more expensive, and non-deterministic.

The two axes are independent. Coding conventions in AGENTS.md are inferential feedforward. ArchUnit tests checking module boundaries on commit are computational feedback. A `/code-review` skill is inferential feedback. A pre-bootstrap script that sets up the project structure is computational feedforward. A well-engineered harness mixes all four.

### 5.5 Three Regulation Categories

Böckeler further distinguishes harnesses by what they regulate ([Thoughtworks — Harness Engineering](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html)):

- **Maintainability harness** — internal code quality, duplication, complexity, coverage, style. The easiest category, with a long history of pre-existing tooling.
- **Architecture fitness harness** — performance, observability, debuggability. Captures cross-cutting "fitness functions" of the application.
- **Behavior harness** — does the application functionally behave the way it should? This is the unsolved category. Today, most teams rely on functional specs as feedforward and AI-generated test suites as feedback, occasionally augmented with mutation testing — and Böckeler is candid that trusting AI-generated tests "is not good enough yet."

The point of these categories is to make it possible to assess harness coverage. A harness that is strong on maintainability but weak on behavior gives a false sense of safety.

### 5.6 Timing: Keep Quality Left

Continuous integration teaches that the earlier you find issues the cheaper they are to fix, and the same holds for harness design. Fast computational sensors (linters, fast tests) should run before commit; expensive computational and inferential sensors (mutation testing, broader code review) run post-integration in the pipeline; continuous-drift sensors (dead-code detection, dependency scanners, log-anomaly judges) run outside the change lifecycle altogether ([Thoughtworks — Harness Engineering](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html)).

The OpenAI Codex team's harness, as Böckeler notes, follows the same shape: layered architecture enforced by custom linters and structural tests, plus recurring "garbage collection" passes that scan for drift and have agents suggest fixes.

### 5.7 Harnessability and Ambient Affordances

Not every codebase is equally amenable to harnessing. A strongly-typed language brings type-checking sensors for free; clear module boundaries afford architectural constraint rules; opinionated frameworks like Spring abstract away details the agent does not have to worry about ([Thoughtworks — Harness Engineering](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html)).

Ned Letcher's term *ambient affordances* captures this: properties of the environment itself that make it legible, navigable, and tractable to agents. Greenfield teams can engineer affordances in from day one; legacy teams face the inverse — the harness is most needed where it is hardest to build.

Anticipating the future, Böckeler suggests *harness templates* — bundled guides and sensors per service topology (CRUD service in JVM, event processor in Go, dashboard in Node) — that ride along with existing service templates. Ashby's Law of Requisite Variety makes the case formally: a regulator must have at least as much variety as the system it governs, so committing to a constrained topology is itself a variety-reduction move that makes a comprehensive harness more achievable.

---

## Chapter 6: Agentic Workflow Patterns

### 6.1 Workflows vs. Agents

Anthropic distinguishes two architectures within the broader category of "agentic systems" ([Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)):

- **Workflows** orchestrate LLMs and tools through predefined code paths.
- **Agents** dynamically direct their own processes and tool usage.

The first principle they push is to find the simplest solution and only add complexity when needed. Many use cases do not need agents at all — single LLM calls with retrieval and in-context examples are usually enough. Workflows give predictability and consistency for well-defined tasks; agents are right when flexibility and model-driven decision-making are needed at scale.

### 6.2 The Augmented LLM

The basic building block is the *augmented LLM*: a model with retrieval, tools, and memory. Modern models can actively use these — generating their own queries, selecting tools, deciding what to retain ([Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)). MCP is one increasingly common way to expose these augmentations.

### 6.3 Compositional Workflow Patterns

From simplest to most flexible:

**Prompt chaining** decomposes a task into sequential steps, each LLM call processing the previous output, with optional programmatic gates. Use it when a task can be cleanly decomposed and you want to trade latency for accuracy by making each call simpler. Example: write a marketing copy, then translate it.

**Routing** classifies an input and dispatches it to a specialized follow-up. Use when distinct categories benefit from separate handling and classification can be done reliably. Example: route customer service queries to refund-handling, technical-support, or general-question pipelines.

**Parallelization** runs LLM calls simultaneously and aggregates outputs. Two variants — *sectioning* breaks into independent subtasks, *voting* runs the same task multiple times. Use for speed or when multiple perspectives improve confidence (vulnerability review across multiple prompts, content-moderation with multiple votes).

**Orchestrator-workers** has a central LLM that dynamically breaks down tasks, delegates to worker LLMs, and synthesizes results. Differs from parallelization because subtasks are not pre-defined. Use for complex tasks where the subtask shape depends on input — coding agents touching many files, research over many sources.

**Evaluator-optimizer** has one LLM generating, another critiquing, in a loop. Use when there are clear evaluation criteria and iterative refinement provides measurable value. The two indicators: human feedback measurably improves output, and an LLM can plausibly produce that feedback. Examples: literary translation with critic, multi-round research with relevance evaluator.

### 6.4 Three Principles for Agent Implementation

Anthropic ends with three rules ([Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)):

1. **Maintain simplicity** in agent design.
2. **Prioritize transparency** by explicitly showing the agent's planning steps.
3. **Carefully craft the agent–computer interface** through tool documentation and testing.

Frameworks help you start fast but introduce abstraction layers that obscure the underlying prompts and tool calls. Anthropic recommends starting with direct API calls and only reaching for a framework when the patterns demand it.

### 6.5 The Micro-Agent Pattern

HumanLayer's pragmatic version of the same insight ([HumanLayer — 12-Factor Agents](https://www.humanlayer.dev/blog/12-factor-agents)): the "loop until done" pattern hits a wall around 10–20 turns, after which agents lose coherence. What works is sprinkling small, focused agents into a broader deterministic DAG. Their deploybot example has deterministic code handling staging deployment, e2e tests, and the actual prod deploy commands; the LLM only intervenes to interpret human plaintext feedback ("can you deploy the backend first?") and propose updated steps. By keeping the agent's domain to 5–10 steps, error spin-outs become rare.

The principle generalizes: when the model gets smarter, agents may grow to handle more steps, but the small-focused-agent approach lets you ship results today and expand scope incrementally as model capabilities allow.

---

## Chapter 7: Long-Running Agents and Multi-Context-Window Tasks

### 7.1 The Shift-Change Problem

Anthropic's "Effective Harnesses for Long-Running Agents" frames the core challenge with a metaphor: imagine a software project staffed by engineers working in shifts, each one arriving with no memory of what happened before ([Anthropic — Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)). Because context windows are limited and most projects exceed one window, agents need a way to bridge sessions.

Compaction alone is not enough. Even with the Claude Agent SDK's automatic compaction, Opus 4.5 in a loop will fail to build a production-quality app from a high-level prompt like "build a clone of claude.ai." The failures cluster in two patterns: the agent tries to one-shot the app and runs out of context mid-implementation, leaving the next session to clean up; or, after some features are built, a later agent declares the job done.

### 7.2 The Initializer + Coding Agent Pattern

Anthropic's solution decomposes the work into two roles ([Anthropic — Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)):

The **initializer agent** runs once with a specialized prompt. It produces:
- An `init.sh` script that runs the development server.
- A `claude-progress.txt` log to be updated each session.
- An initial git commit.
- A comprehensive feature-list file (in JSON; Markdown was tried first but the model was more likely to inappropriately edit it). For the claude.ai clone the list ran to over 200 features, each marked `passes: false` initially.

Each entry in the feature list is a JSON object with category, description, steps to verify, and a `passes` boolean. The coding agent is allowed to flip `passes` but is told strongly that removing or editing features is unacceptable.

The **coding agent** runs every subsequent session with a different prompt that asks it to make incremental progress. Each session begins with a structured warm-up:

1. Run `pwd` to confirm the directory.
2. Read git logs and the progress file to see what was last worked on.
3. Read the feature-list file and pick the highest-priority unfinished feature.
4. Run `init.sh` to start the dev server, then run a basic end-to-end test before implementing anything new.
5. Implement one feature.
6. Verify end-to-end (Anthropic uses the Puppeteer MCP for browser-driven verification, since the agent is otherwise prone to declaring features done after passing unit tests but failing in practice).
7. Commit with a descriptive message and update the progress file.

The pattern's benefit is that the agent is forced into a clean state at session boundaries — the kind of state appropriate for merging to a main branch — which means the next agent can start work without first cleaning up the previous one's mess.

### 7.3 Generator–Evaluator (GAN-Inspired)

A follow-up by Prithvi Rajasekaran extends the pattern to the holy-grail problem of building production-quality apps from short prompts ([Anthropic — Harness Design for Long-Running Application Development](https://www.anthropic.com/engineering/harness-design-long-running-apps)). The motivating observation: when asked to evaluate their own work, agents reliably skew positive even when output is mediocre. Separating the agent doing the work from the agent judging it is a strong lever, because tuning a separate skeptical evaluator is more tractable than making a generator critical of its own output.

Inspired by Generative Adversarial Networks, the architecture is three agents:

- **Planner** expands a 1–4 sentence prompt into a full product spec, deliberately staying at the product/architecture level rather than detailed technical design (so errors do not cascade), and is encouraged to weave AI features into the spec.
- **Generator** implements the spec one feature at a time using a React + Vite + FastAPI + SQLite stack, with git for version control.
- **Evaluator** uses the Playwright MCP to click through the running application as a user would, testing UI, API endpoints, and database state, then grades against a rubric covering product depth, functionality, visual design, and code quality. Each criterion has a hard threshold, and a single failure causes the sprint to fail with detailed feedback.

The two coordinate via *sprint contracts*: before each sprint, the generator proposes what it will build and how success will be verified; the evaluator reviews until they agree; the generator then builds against the agreed contract. Communication is file-based — one agent writes a file, another reads and responds.

The cost is significant. For a "create a 2D retro game maker" prompt, the solo run took 20 minutes and cost $9, producing an app that looked plausible but where the game itself did not work — entities appeared on screen but nothing responded to input. The full harness took 6 hours and cost $200, producing a working game maker with sprite editor, level editor, AI-assisted level generation, and playable mode. The 20× cost premium bought a working application instead of broken stubs.

### 7.4 Self-Verification Is the Headline Lever

LangChain's Top-30-to-Top-5 case study reaches the same conclusion via a different route ([LangChain — Improving Deep Agents with Harness Engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/)). With trace analysis, they identified the most common failure pattern: the agent wrote a solution, re-read its own code, decided it looked fine, and stopped. They added structured guidance to the system prompt — Plan, Build with verification in mind, Verify by running tests and comparing output to spec, Fix — and a `PreCompletionChecklistMiddleware` that intercepts the agent before exit and forces a verification pass.

This pattern echoes the "Ralph Wiggum loop" that has spread through the developer community: a hook that intercepts the agent's exit attempt and reinjects the original prompt in a clean context window, forcing the agent to continue against its goal ([LangChain — The Anatomy of an Agent Harness](https://blog.langchain.com/the-anatomy-of-an-agent-harness/)).

LangChain's combined changes — context middleware mapping the cwd and tooling, build-verify guidance, loop detection, and a "reasoning sandwich" of high-low-high reasoning compute — improved the score by 13.7 points (from 52.8% to 66.5%) with no model change.

### 7.5 Context Resets vs. Compaction

Anthropic's harness-design follow-up makes an explicit distinction ([Anthropic — Harness Design for Long-Running Application Development](https://www.anthropic.com/engineering/harness-design-long-running-apps)). Compaction summarizes earlier parts of a conversation in place; the same agent continues with a shortened history. A *context reset* clears the context entirely and starts a fresh agent, with a structured handoff carrying the previous agent's state and next steps.

The two address different problems. Compaction preserves continuity. Resets cure "context anxiety" — a tendency Anthropic observed in Sonnet 4.5 where the agent began wrapping up work prematurely as it neared what it believed to be its context limit. Resets give the agent a clean slate; the cost is that the handoff artifact must carry enough state for the next agent to resume cleanly.

When Opus 4.5 largely fixed the context-anxiety behavior on its own, Anthropic was able to drop context resets from the harness entirely. This is an explicit example of the model-harness coupling discussed in chapter 11.

### 7.6 Multi-Agent Research Systems

For tasks with parallel structure — research with many independent threads to explore — the orchestrator-worker pattern from chapter 6 applies. Anthropic's research feature uses Claude Opus 4 as the lead agent and Claude Sonnet 4 as sub-agents ([Anthropic — How We Built Our Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)). The lead analyzes the query, develops a strategy, and spawns parallel sub-agents that each search and return condensed findings; the lead synthesizes; a citation agent then attributes claims to sources.

Eight prompt-engineering principles surface from their experience:

1. **Think like the agent**: simulate prompts in the Console with the exact tools to see step-by-step behavior.
2. **Teach the orchestrator how to delegate**: give sub-agents an objective, output format, tool guidance, and clear task boundaries — vague delegation produces duplicate or misinterpreted work.
3. **Scale effort to query complexity**: explicit rules in the prompt (1 agent / 3–10 calls for fact-finding; 2–4 sub-agents / 10–15 calls each for comparisons; 10+ sub-agents for complex research) prevent over-investment.
4. **Tool design and selection are critical**: explicit heuristics ("examine all available tools first, match tool usage to user intent, prefer specialized tools over generic ones") prevent the agent from sending itself down wrong paths.
5. **Let agents improve themselves**: a tool-testing agent that uses a flawed MCP tool, observes the failure, and rewrites the description produced a 40% decrease in task completion time on subsequent uses.
6. **Start wide, then narrow**: prompt agents to begin with short broad queries and progressively refine — the natural tendency is the opposite.
7. **Guide the thinking process**: extended thinking serves as a controllable scratchpad for planning; interleaved thinking helps sub-agents evaluate quality and refine queries between tool calls.
8. **Parallel tool calling transforms speed**: spinning up sub-agents in parallel and having sub-agents call multiple tools in parallel cut research time by up to 90% on complex queries.

### 7.7 Production Reliability for Stateful Agents

Anthropic's research-system post documents engineering challenges that emerge once agents run for long periods ([Anthropic — How We Built Our Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)):

- **Errors compound**: minor system failures can be catastrophic without checkpoint-and-resume infrastructure. Anthropic combines AI adaptability (letting the agent know when a tool is failing and trusting it to adapt) with deterministic safeguards like retry logic and regular checkpoints.
- **Debugging needs new tooling**: because agents are non-deterministic between runs, full production tracing — observing decision patterns and interaction structures without reading conversation contents — is the primary diagnosis surface.
- **Deployment needs coordination**: rolling out a code change while many agents are running requires *rainbow deployments* that gradually shift traffic from old to new versions while keeping both alive.
- **Synchronous execution creates bottlenecks**: in their current architecture, the lead agent waits for sub-agents to finish before proceeding, simplifying coordination but blocking the system on the slowest sub-agent. Asynchronous execution would unlock more parallelism but adds challenges in result coordination, state consistency, and error propagation.

---

## Chapter 8: Twelve Factors for Production Agents

HumanLayer's "12 Factor Agents" is a manifesto rather than an architecture. The twelve principles, drawn from many production deployments ([HumanLayer — 12-Factor Agents](https://www.humanlayer.dev/blog/12-factor-agents)):

1. **Natural Language to Tool Calls**: the atomic pattern is converting user phrasing into a structured JSON call that deterministic code executes.
2. **Own Your Prompts**: do not outsource prompt engineering to a framework's black box. Write prompts as first-class code so they can be tested, evaluated, and tuned.
3. **Own Your Context Window**: standard message-format is one option; custom XML-tagged event logs that pack history into a single user message are another. The aim is maximum information density with minimum tokens.
4. **Tools Are Just Structured Outputs**: a tool call is a model emitting JSON that names an intent and parameters. Deterministic code decides what to do with it.
5. **Unify Execution State and Business State**: don't separate "current step / next step / retry count" from "what happened in the conversation." Infer execution state from a single event log.
6. **Launch / Pause / Resume with Simple APIs**: agents are programs; they should support standard lifecycle operations, including pause-between-tool-selection-and-execution.
7. **Contact Humans with Tool Calls**: rather than relying on the model's choice of plain-text vs. structured output, give it explicit `request_human_input` tools with structured options (urgency, format, choices).
8. **Own Your Control Flow**: hijack the loop to break for approval, summarize tool results, run LLM-as-judge over outputs, manage memory, log and trace, rate-limit, or sleep durably.
9. **Compact Errors into Context Window**: leaving errors visible enables self-healing; with a counter on consecutive errors, escalate to a human after a threshold.
10. **Small, Focused Agents**: keep individual agent scope to 3–10, maybe 20 steps. Larger context = worse performance.
11. **Trigger from Anywhere**: enable launches from Slack, email, SMS, webhooks, crons. Combined with factor 7, this enables the *outer loop* — agents kicked off by events that contact humans for help when they reach critical points.
12. **Make Your Agent a Stateless Reducer**: a fold over events. Pure, serializable, replay-able.

The deeper claim binding these together is that "agents, at least the good ones, don't follow the 'here's your prompt, here's a bag of tools, loop until you hit the goal' pattern. Rather, they are comprised of mostly just software" ([HumanLayer — 12-Factor Agents](https://www.humanlayer.dev/blog/12-factor-agents)). The factors are mostly software-engineering hygiene applied to a stateful, non-deterministic component.

---

## Chapter 9: Evaluation

### 9.1 Why Evals

Without evals, debugging is reactive: wait for complaints, reproduce manually, fix, hope nothing else regressed ([Anthropic — Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)). Teams cannot distinguish real regressions from noise, automate testing of changes against many scenarios, or measure improvements. They also adopt new models slowly — without evals, taking advantage of a new model means weeks of manual testing, while evaluated teams can verify strengths and tune prompts in days.

Anthropic positions evals as compounding infrastructure: the costs are visible up front, the benefits accumulate over the agent's lifecycle. Their advice: start early, even with 20–50 simple tasks. Effect sizes in early agent development are large, so small samples suffice; mature agents need larger evals to detect smaller effects.

### 9.2 The Anatomy of an Evaluation

Anthropic's vocabulary ([Anthropic — Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)):

- A **task** has defined inputs and success criteria.
- A **trial** is a single attempt at a task — multiple trials per task because outputs vary.
- A **grader** scores some aspect of performance; tasks can have multiple, each containing assertions.
- A **transcript** (trace, trajectory) is the full record of a trial.
- An **outcome** is the final environmental state at end of trial — distinct from the agent's text response. (A flight-booking agent's "your flight is booked" is the response; whether a row exists in the SQL database is the outcome.)
- An **evaluation harness** (distinct from the agent harness) is the infrastructure that runs the eval end-to-end.
- An **agent harness** (or scaffold) is the system being evaluated alongside the model. *"When we evaluate 'an agent,' we're evaluating the harness and the model working together."*

### 9.3 Three Types of Graders

- **Code-based**: string match, binary tests, static analysis, outcome verification, tool-call verification, transcript analysis. Fast, cheap, objective, reproducible — but brittle to valid variations.
- **Model-based**: rubric scoring, natural-language assertions, pairwise comparison, multi-judge consensus. Flexible, scalable, handles open-ended tasks — but non-deterministic, requires human calibration.
- **Human**: SME review, crowdsourced judgment, A/B testing. Gold-standard quality — but expensive and slow.

Anthropic recommends deterministic graders where possible, model-based where necessary, human for periodic calibration. They also caution against grading the *path* the agent took rather than what it produced — agents regularly find valid approaches the eval designer did not anticipate, and grading paths makes the eval brittle.

### 9.4 Capability vs. Regression Evals

Two distinct purposes ([Anthropic — Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)):

- **Capability evals** ask "what can this agent do well?" They start at low pass rates, targeting tasks the agent struggles with, giving teams a hill to climb.
- **Regression evals** ask "does the agent still handle what it used to?" They should run near 100%, protecting against backsliding.

After an agent matures, capability evals with high pass rates *graduate* into the regression suite. Tasks that once measured "can we do this at all?" then measure "can we still do this reliably?"

### 9.5 Pass@k vs. Pass^k

For agents whose behavior varies between runs, two metrics with opposite slopes ([Anthropic — Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)):

- **pass@k**: probability of at least one correct solution in k attempts. Rises as k increases — more shots on goal means higher odds of success.
- **pass^k**: probability that *all* k trials succeed. Falls as k increases — demanding consistency across more trials raises the bar.

A 75% per-trial success rate gives pass^3 of about 42% and pass^10 close to zero, but pass@10 approaches 100%. The right metric depends on the product: one success matters in code search, every success matters for a customer-facing agent.

### 9.6 The Eight-Step Roadmap

Anthropic's distilled roadmap to going from no evals to evals you trust ([Anthropic — Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)):

0. **Start early** — 20–50 tasks from real failures.
1. **Begin with what you already test manually** — pre-release checks and bug-tracker queue items.
2. **Write unambiguous tasks with reference solutions** — two domain experts should reach the same verdict; a 0% pass rate across many trials usually means a broken task, not an incapable agent.
3. **Build balanced problem sets** — both cases where a behavior should and should not occur. One-sided evals create one-sided optimization.
4. **Build a robust eval harness with a stable environment** — isolate trials, no shared state. Anthropic observed Claude gaining unfair advantage from inspecting git history left over from previous trials.
5. **Design graders thoughtfully** — deterministic where possible, partial credit for multi-component tasks, calibrated LLM-as-judge with structured rubrics, escape hatches for "Unknown" to avoid hallucination, anti-hacking design.
6. **Read transcripts** — failures should look fair; if scores stop climbing, the question is whether the agent regressed or the eval itself is now unfair.
7. **Monitor for capability eval saturation** — an eval at 100% provides no improvement signal. SWE-Bench Verified started at 30% and is now nearing 80%, with deceptive small score increases now hiding large capability gains.
8. **Maintain through open contribution** — domain experts and product teams should contribute eval tasks; product managers, customer success, salespeople can use Claude Code to file evals as PRs.

### 9.7 What Real Evals Look Like for Different Agent Types

- **Coding agents**: deterministic graders are natural — does the code run, do the tests pass? SWE-bench Verified runs the test suite from a fixed GitHub issue; Terminal-Bench tests end-to-end tasks like building a Linux kernel from source.
- **Conversational agents**: success is multidimensional — ticket resolved (state check), conversation under 10 turns (transcript constraint), tone appropriate (LLM rubric). Often require a second LLM to simulate the user (τ-Bench, τ²-Bench).
- **Research agents**: groundedness checks (claims supported by sources), coverage checks (key facts included), source-quality checks (authoritative sources, not first-retrieved). Require frequent calibration against expert humans.
- **Computer-use agents**: real or sandboxed environment, URL/page-state checks, backend state verification (was an order actually placed, or did just a confirmation page appear?). WebArena and OSWorld are the canonical examples.

### 9.8 Reading Transcripts Is the Skill

A repeated theme: do not take eval scores at face value until someone reads the transcripts. Anthropic recounts a case where Opus 4.5 initially scored 42% on CORE-Bench, but investigation revealed rigid grading penalizing "96.12" when the expected answer was "96.124991…", ambiguous task specs, and stochastic tasks that were impossible to reproduce exactly. After fixing the grading bugs and running with a less constrained scaffold, the score jumped to 95% ([Anthropic — Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)). Similarly, METR found tasks in their time-horizon benchmark that asked agents to optimize to a stated score threshold, but where the grading required exceeding the threshold — penalizing models that followed instructions and rewarding ones that ignored them.

The general rule: failures should seem fair. When scores plateau, the question to ask is whether the eval is measuring what it should.

### 9.9 Evals Are One Layer of Many

Automated evals are not a complete picture. Anthropic compares the situation to the Swiss-cheese model from safety engineering: no single layer catches every issue ([Anthropic — Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)). The complete stack:

- **Automated evals** for fast iteration, regression detection, model upgrades.
- **Production monitoring** for ground truth and unanticipated real-world failures.
- **A/B testing** for validating significant changes once traffic is sufficient.
- **User feedback** for surfacing problems no one anticipated.
- **Manual transcript review** for building intuition about failure modes.
- **Systematic human studies** for calibrating LLM graders or grading subjective output.

---

## Chapter 10: Infrastructure Noise

A practitioner reading benchmark leaderboards needs to know that small score differences carry more uncertainty than the precision of the reported numbers suggests. Anthropic's "Quantifying Infrastructure Noise" documents the size of this effect ([Anthropic — Quantifying Infrastructure Noise in Agentic Coding Evals](https://www.anthropic.com/engineering/infrastructure-noise)).

Static benchmarks score a model's output directly. Agentic coding evals are different: the model writes programs, runs tests, installs dependencies, iterates over many turns. The runtime is not a passive container but an integral component of the problem-solving process. Two agents with different resource budgets are not taking the same test.

### 10.1 The Headline Result

Running Terminal-Bench 2.0 across six resource configurations on a Google Kubernetes Engine cluster — same Claude model, same harness, same task set, varying only the resource floor and ceiling — the gap between the most- and least-resourced setups was 6 percentage points (p < 0.01) ([Anthropic — Quantifying Infrastructure Noise](https://www.anthropic.com/engineering/infrastructure-noise)).

This is more than the typical leaderboard gap between top models. The implication is direct: a 2-point lead on a leaderboard might reflect a real capability gap, or it might reflect that one eval ran on beefier hardware.

### 10.2 The Two Regimes

The data reveals two regimes:

- **From 1× to 3× the per-task resource specs**, scores fluctuated within noise (p = 0.40), but infrastructure error rates dropped monotonically — from 5.8% at strict enforcement to 2.1% at 3× headroom, p < 0.001. Tasks that crashed at 1× would have failed regardless. The extra resources fixed transient memory spikes that were OOM-killing containers, without making the eval itself easier.
- **Above 3×**, scores climbed faster than infrastructure errors declined. From 3× to uncapped, infra errors dropped 1.6 percentage points but success jumped almost 4 points. Extra resources let the agent try approaches that only work with generous allocations: pulling in large dependencies, running memory-intensive test suites, brute-forcing solutions with heavyweight tools.

### 10.3 What This Means for Measurement

Tight resource limits inadvertently reward efficient strategies; generous limits reward agents that exploit available resources. Both are legitimate things to test, but collapsing them into a single score without specifying configuration makes interpretation difficult.

Anthropic's `bn-fit-modify` example illustrates: under generous limits, some models default to installing the entire Python data-science stack (pandas, networkx, scikit-learn) before writing any solution code. Under tight limits, the pod runs out of memory during installation. A leaner strategy exists — implementing the math from scratch using only the standard library — and some models default to it. The resource configuration determines which default succeeds.

The same effect holds outside Terminal-Bench, though with smaller magnitude. Anthropic's SWE-bench experiment with 5× RAM showed scores 1.54 percentage points higher at 5× than 1× across 227 problems — smaller than Terminal-Bench because SWE-bench tasks are less resource-intensive, but non-neutral.

### 10.4 The Recommendation

Evals should specify both a guaranteed allocation (the floor) and a hard ceiling separately, not a single pinned value. A 3× ceiling over per-task specs is a reasonable default for Terminal-Bench: it cut infra errors by two-thirds while keeping the score lift well within noise ([Anthropic — Quantifying Infrastructure Noise](https://www.anthropic.com/engineering/infrastructure-noise)). The exact multiplier depends on benchmark and task distribution and should be reported.

For consumers of benchmark results, the operational rule: leaderboard differences below 3 percentage points deserve skepticism until configuration is documented and matched. A few-point lead might signal a real capability gap, or it might just be a bigger VM.

---

## Chapter 11: Trace-Driven Iteration and Model–Harness Co-Evolution

### 11.1 Traces Are the Feedback Loop

Models today are largely black boxes; their inner mechanisms are hard to interpret. But their inputs and outputs are visible in text, and that is enough to drive systematic improvement. LangChain treats traces as the primary surface for harness debugging: every agent action is stored, including latency, token counts, costs, and tool invocations ([LangChain — Improving Deep Agents with Harness Engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/)).

Their *Trace Analyzer Skill* automates the loop:

1. Fetch experiment traces from LangSmith.
2. Spawn parallel error-analysis agents; the main agent synthesizes findings and suggestions.
3. Aggregate feedback and make targeted changes to the harness.

This is structurally similar to boosting in classical machine learning — iteration focuses on mistakes from previous runs. Human review at step 3 is helpful but not strictly required, mainly to catch changes that overfit to specific tasks at the cost of generalization.

### 11.2 Stress-Test Load-Bearing Components

Anthropic's harness-design follow-up adds a complementary discipline ([Anthropic — Harness Design for Long-Running Application Development](https://www.anthropic.com/engineering/harness-design-long-running-apps)). Every component in a harness encodes an assumption about what the model cannot do on its own. As models improve, those assumptions go stale. The recommended approach: remove one component at a time, run the eval, observe.

When Opus 4.6 launched with significantly stronger long-context retrieval and reduced context-anxiety, Anthropic dropped the sprint construct entirely from their three-agent architecture. The generator now ran coherently for over two hours without sprint decomposition. The evaluator, which had been load-bearing on Sonnet 4.5, became more situational on 4.6 — useful for tasks at the edge of what the generator could do solo, unnecessary overhead within that boundary. The general principle the team articulates: "the evaluator is not a fixed yes-or-no decision. It is worth the cost when the task sits beyond what the current model does reliably solo."

### 11.3 Model–Harness Co-Evolution

Today's frontier coding models are post-trained with their harnesses in the loop ([LangChain — The Anatomy of an Agent Harness](https://blog.langchain.com/the-anatomy-of-an-agent-harness/)). Useful primitives are discovered, added to the harness, and used in training the next generation, which becomes more capable within that harness. This creates a feedback loop with side effects: changing harness logic can produce worse model performance even when the change should be neutral.

The Codex `apply_patch` tool is the canonical example. Codex models are post-trained on this specific patching format, and OpenCode — built as an open-source alternative to Claude Code — had to add an `apply_patch` tool specifically for GPT/Codex models to mimic the Codex harness; Claude and other models still use normal `edit` and `write` tools ([HumanLayer — Skill Issue: Harness Engineering for Coding Agents](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents)).

### 11.4 But the Best Harness Is Not Always the One the Model Was Trained In

The corollary, and the practical license to iterate: the harness a model was trained in is often *not* optimal for a given task. Terminal-Bench 2.0 has been a recurring data point — Opus 4.6 in Claude Code scores at position 33, but the same model in different harnesses places at position 5 (within a noise band of about 4 positions) ([HumanLayer — Skill Issue: Harness Engineering for Coding Agents](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents); [LangChain — The Anatomy of an Agent Harness](https://blog.langchain.com/the-anatomy-of-an-agent-harness/)).

LangChain's case study reaches the same conclusion experimentally. They ran a Claude Opus 4.6 test on an early version of their harness that scored 59.6%, competitive but worse than their tuned Codex configuration. The principles generalized — context preparation, verification — but a few rounds of harness iteration tailored to the model would have closed the gap ([LangChain — Improving Deep Agents with Harness Engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/)).

The pragmatic rule: if you change the model, re-examine the harness. Tune what is now load-bearing, strip what is no longer.

### 11.5 Practical Takeaways

LangChain's distilled principles for harness iteration ([LangChain — Improving Deep Agents with Harness Engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/)):

1. **Context engineering on behalf of agents** — onboard the model into its environment with directory structures, available tools, coding best practices, problem-solving strategies.
2. **Help agents self-verify their work** — models bias toward their first plausible solution; prompt aggressively to verify by running tests.
3. **Tracing as a feedback signal** — debug tooling and reasoning together (models go down wrong paths because they lack a tool *or* the instructions for one).
4. **Detect and fix bad patterns in the short term** — guardrails like loop detection are crutches that will dissolve as models improve, but are useful today.
5. **Tailor harnesses to models** — Claude and Codex prompting guides differ for a reason; principles generalize, specifics do not.

HumanLayer's parallel set ([HumanLayer — Skill Issue: Harness Engineering for Coding Agents](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents)):

What worked: starting simple and adding configuration only after real failures; iterating and throwing away things that did not help; distributing battle-tested configurations across the team via repository-level config; optimizing for iteration speed rather than likelihood of one-shotting; pruning capabilities once you know what you actually need.

What did not work: designing the ideal harness upfront; installing dozens of skills and MCP servers "just in case"; running the full test suite at the end of every session; micro-optimizing which sub-agents could access which tools.

### 11.6 The Misleading Data on AGENTS.md

A worth-reading detail: an ETH Zurich study tested 138 agentfiles across various repos and found that LLM-generated ones actively hurt performance while costing 20% more, that human-written ones helped only 4%, that agents spent 14–22% more reasoning tokens processing context-file instructions, and that codebase overviews and directory listings did not help at all because agents discovered repository structure on their own ([HumanLayer — Skill Issue: Harness Engineering for Coding Agents](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents) citing the ETH Zurich paper).

HumanLayer reads this as confirming their own AGENTS.md guidance — keep files concise, avoid auto-generation, use progressive disclosure rather than dumping every instruction up front, keep contents universally applicable rather than full of conditional rules. Their own CLAUDE.md is under 60 lines.

The general principle: more configuration is not better. Every irrelevant instruction is an instruction the agent must process for no benefit, and the *instruction budget* matters as much as the token budget.

---

## Chapter 12: Outlook

### 12.1 The Field Is Young

The vocabulary of harness engineering — initializer agents, context firewalls, sprint contracts, reasoning sandwiches, ambient affordances, computational vs. inferential controls — was largely coined within the last twelve to eighteen months. Most of the source articles for this textbook were published in 2025 and 2026. The field is moving faster than any single book can document.

LangChain frames the trajectory honestly: as models improve, some of what lives in the harness today will be absorbed into the model. Models will get better at planning, self-verification, and long-horizon coherence natively, requiring less context injection. But the space of interesting harness combinations does not shrink as models improve. It moves ([LangChain — The Anatomy of an Agent Harness](https://blog.langchain.com/the-anatomy-of-an-agent-harness/); [Anthropic — Harness Design for Long-Running Application Development](https://www.anthropic.com/engineering/harness-design-long-running-apps)).

### 12.2 Open Problems

Several recur across the literature:

- **Behavioral harnesses for functional correctness**. Maintainability and architecture-fitness harnesses have decades of pre-existing tooling. Behavior harnesses — does the application functionally do what the user wants? — do not. Today most teams rely on AI-generated tests, and the consensus is that this is not yet good enough ([Thoughtworks — Harness Engineering](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html)).
- **Harness coherence at scale**. As guides and sensors multiply, how do they stay consistent? How do we know when sensors that never fire indicate quality versus inadequate detection? There is no equivalent of code coverage or mutation testing for harness coverage yet.
- **Multi-agent coordination beyond synchronous orchestration**. Anthropic's research system runs sub-agents synchronously; asynchronous coordination would unlock more parallelism but adds challenges in result coordination, state consistency, and error propagation ([Anthropic — How We Built Our Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)).
- **Continual learning at the harness level**. Memory primitives that let agents accumulate knowledge of a codebase or domain over many sessions, rather than starting fresh each time, are an active research area ([LangChain — Improving Deep Agents with Harness Engineering](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/)).
- **Just-in-time tool assembly**. Harnesses that dynamically assemble the right tools and context for a given task, rather than pre-configuring everything, are explored by LangChain among others.
- **Tracing as documentation**. LangChain's observation that "in software, the code documents the app; in AI, the traces do" hints at a different model of system documentation that the field has not fully worked out.

### 12.3 The Standing Advice

A few principles repeat across nearly every article in the corpus:

- **Treat context as a finite resource**. Find the smallest set of high-signal tokens that produces the desired outcome.
- **Do the simplest thing that works**. Agents are expensive; workflows often suffice; many tasks need neither.
- **Read the transcripts**. Everything else flows from this.
- **Iterate on what is load-bearing**. Stress-test components when models change. Strip what is no longer pulling weight; tune what is.
- **Tailor harnesses to models, but tailor principles to the field**. Specific prompts and tools change between models. The shape of the work — context engineering, tool design, evaluation, sandboxing, self-verification — does not.

The field is not yet old enough to have textbooks. This document is an attempt to write one anyway, knowing it will go out of date faster than most. The hope is that the citations make it possible to read the originals as the conversation continues.

---

## References

Foundations:
- Justin Young et al., *Effective Harnesses for Long-Running Agents*, Anthropic, Nov 2025. https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- Prithvi Rajasekaran, *Harness Design for Long-Running Application Development*, Anthropic, Mar 2026. https://www.anthropic.com/engineering/harness-design-long-running-apps
- Vivek Trivedy, *The Anatomy of an Agent Harness*, LangChain, Mar 2026. https://blog.langchain.com/the-anatomy-of-an-agent-harness/
- Birgitta Böckeler, *Harness Engineering for Coding Agent Users*, Thoughtworks / martinfowler.com, Apr 2026. https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html
- Erik Schluntz and Barry Zhang, *Building Effective Agents*, Anthropic, Dec 2024. https://www.anthropic.com/engineering/building-effective-agents
- Kyle Brunet, *Skill Issue: Harness Engineering for Coding Agents*, HumanLayer, Mar 2026. https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents

Context, Memory, and Working State:
- Anthropic Applied AI Team, *Effective Context Engineering for AI Agents*, Anthropic, Sep 2025. https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Yichao 'Peak' Ji, *Context Engineering for AI Agents: Lessons from Building Manus*, Manus, Jul 2025. https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus

Tools and Constraints:
- Ken Aizawa, *Writing Effective Tools for Agents — with Agents*, Anthropic, Sep 2025. https://www.anthropic.com/engineering/writing-tools-for-agents
- Adam Jones and Conor Kelly, *Code Execution with MCP: Building More Efficient Agents*, Anthropic, Nov 2025. https://www.anthropic.com/engineering/code-execution-with-mcp
- David Dworken and Oliver Weller-Davies, *Beyond Permission Prompts: Making Claude Code More Secure and Autonomous*, Anthropic, Oct 2025. https://www.anthropic.com/engineering/claude-code-sandboxing

Specs and Workflow Design:
- Dex Horthy, *12-Factor Agents*, HumanLayer, Apr 2025. https://www.humanlayer.dev/blog/12-factor-agents

Evaluation and Observability:
- Mikaela Grace et al., *Demystifying Evals for AI Agents*, Anthropic, Jan 2026. https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
- Gian Segato, *Quantifying Infrastructure Noise in Agentic Coding Evals*, Anthropic, Feb 2026. https://www.anthropic.com/engineering/infrastructure-noise
- Vivek Trivedy, *Improving Deep Agents with Harness Engineering*, LangChain, Feb 2026. https://blog.langchain.com/improving-deep-agents-with-harness-engineering/

Runtimes, Harnesses, and Reference Implementations:
- Harrison Chase, *Agent Frameworks, Runtimes, and Harnesses, Oh My!*, LangChain, Oct 2025. https://blog.langchain.com/agent-frameworks-runtimes-and-harnesses-oh-my/
- Jeremy Hadfield et al., *How We Built Our Multi-Agent Research System*, Anthropic, Jun 2025. https://www.anthropic.com/engineering/multi-agent-research-system

Reading list:
- *Awesome Harness Engineering*, walkinglabs. https://github.com/walkinglabs/awesome-harness-engineering
