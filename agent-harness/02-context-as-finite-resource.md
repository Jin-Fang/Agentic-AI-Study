# Chapter 2: Context as a Finite Resource

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

## Diagram: Context Budget → KV-Cache → File System as Memory

```mermaid
flowchart TD
    A["Task Begins\n(empty context)"] --> B["Context Budget\n(finite attention window)"]
    B --> C{Budget state?}
    C -->|"Prefix stable"| D["KV-Cache Hit\n(10x cheaper tokens)"]
    C -->|"Prefix changed"| E["KV-Cache Miss\n(full re-computation)"]
    D --> F["Append action + observation\nto context"]
    E --> F
    F --> G{Context nearing limit?}
    G -->|No| C
    G -->|Yes| H["Offload to File System\n(unlimited, persistent memory)"]
    H --> I["Keep lightweight reference\n(URL, file path, query)"]
    I --> J["Just-in-Time Retrieval\nwhen needed"]
    J --> F

    style D fill:#2d6a4f,color:#fff
    style E fill:#d62828,color:#fff
    style H fill:#023e8a,color:#fff
```

---

## Key Takeaways

- **Context rot is real**: model performance degrades as context fills — it is not just a token-count limit but a quality-of-attention limit.
- **The KV-cache is the most important production metric**: stable prefixes are worth more than a larger context window.
- **Mask tools, don't swap them**: dynamically adding/removing tools mid-run breaks the cache and causes schema violations.
- **The filesystem is the agent's true memory**: unlimited, persistent, and directly operable — far superior to in-context storage for long tasks.
- **Just-in-time retrieval beats pre-loading**: maintain lightweight identifiers and load data only when needed.

## Further Reading

- Anthropic Applied AI Team, *Effective Context Engineering for AI Agents*, Anthropic, Sep 2025. https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Yichao 'Peak' Ji, *Context Engineering for AI Agents: Lessons from Building Manus*, Manus, Jul 2025. https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus
- Dex Horthy, *12-Factor Agents*, HumanLayer, Apr 2025. https://www.humanlayer.dev/blog/12-factor-agents
- Kyle Brunet, *Skill Issue: Harness Engineering for Coding Agents*, HumanLayer, Mar 2026. https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents
- Vivek Trivedy, *The Anatomy of an Agent Harness*, LangChain, Mar 2026. https://blog.langchain.com/the-anatomy-of-an-agent-harness/
