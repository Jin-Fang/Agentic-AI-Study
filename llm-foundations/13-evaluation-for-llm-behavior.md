# Chapter 13: Evaluating LLM Behavior

LLM systems are probabilistic, context-sensitive, and often embedded in workflows with tools. Evaluation must therefore measure behavior, not just isolated model answers. Broad benchmark efforts such as BIG-bench and HELM are useful because they make model limitations visible across many tasks and metrics, but a harness still needs workload-specific evals ([BIG-bench](https://arxiv.org/abs/2206.04615), [HELM](https://arxiv.org/abs/2211.09110)).

A benchmark score can be useful, but it does not tell you whether your harness can handle your repository, documents, permissions, users, and failure modes. Harness engineers need task-specific evals.

## Benchmark Families and Limits

Different public benchmarks test different slices of behavior. MMLU measures broad academic and professional knowledge across many multiple-choice subjects ([Measuring Massive Multitask Language Understanding](https://arxiv.org/abs/2009.03300)). TruthfulQA targets truthful answering under questions that invite common false beliefs ([TruthfulQA](https://arxiv.org/abs/2109.07958)). HumanEval and MBPP test code generation through executable programming problems ([Evaluating Large Language Models Trained on Code](https://arxiv.org/abs/2107.03374), [Program Synthesis with Large Language Models](https://arxiv.org/abs/2108.07732)).

A newer family of agentic benchmarks tries to test the full tool-loop instead of a single answer. SWE-bench has a model resolve real GitHub issues against a repository, graded by hidden tests. tau-bench scores multi-turn tool use against a simulated user and a policy. GAIA poses tasks that need multi-step reasoning, web browsing, and tools. WebArena and OSWorld put the model in a realistic browser or desktop environment and grade the final state. These are closer to harness behavior than MMLU, but they carry the same caveats: they can be contaminated, they cover their own task distribution rather than yours, and a strong score does not mean the loop works on your tools, permissions, and data.

These benchmarks are useful, but they are not product evals. They can be contaminated by training data, too narrow for a real workflow, or insensitive to permissions, retrieval, tool side effects, latency, and recovery behavior. A model can improve on MMLU while regressing on your tool schema. It can do well on HumanEval while failing inside your repository because local conventions, dependencies, or hidden tests differ.

Use broad benchmarks as background signal. Use workload evals as release signal.

## What to Evaluate

Evaluate the unit that matters. For a simple extraction prompt, the unit may be one model call. For an agent, the unit is the loop: prompt, tool calls, observations, retries, final answer, and side effects.

Useful dimensions include:

- Task success.
- Factual accuracy.
- Citation correctness.
- Tool choice.
- Latency.
- Token cost.
- Error recovery.
- Safety policy compliance.
- Output schema validity.
- Regression against previous versions.

The deep dive's reward-model section is a reminder that evaluation can itself become a learned or approximate system. A reward model scores outputs, but it is only a proxy for human preference ([Deep Dive, around 02:52:39](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10359s)). Model-based grading has the same shape. It can scale review, but it can also miss systematic failures.

Use model graders where they help, but do not confuse a grader's score with ground truth.

### Accounting for stochasticity

Because the system is probabilistic, one pass or fail is not a release signal. Run each golden task several times (for example, 5-20 runs depending on cost) and report a pass rate, not a single outcome. Distinguish pass@k (the task succeeds in at least one of k runs) from pass^k (it succeeds in all k). pass@k flatters a flaky agent; pass^k is the honest metric when the harness must work every time, so prefer it for reliability-sensitive workflows. Treat the pass rate as an estimate with a confidence interval: a task that passes 8/10 has a wide interval, so a small score change between two versions may be noise rather than a regression.

Pin the sampling settings you evaluate at. Record temperature and, where the API supports it, a fixed seed, so a score change reflects a real behavior change and not a different decoding configuration. If a task flips between pass and fail across runs at fixed settings, mark it flaky and triage it: quarantine it from the release gate, or tighten the rubric until the verdict is stable. A flaky eval is itself a finding about an unstable behavior.

## Golden Tasks

A golden task set is a curated collection of representative cases with expected outcomes. It should include ordinary tasks, edge cases, and known historical failures. The expected outcome should be checkable by code, human review, or a clear rubric.

For harness work, golden tasks should include realistic context:

- Real document shapes.
- Real tool outputs.
- Real error messages.
- Real permission boundaries.
- Real stale or conflicting data.

Toy prompts are useful for debugging, but they are not enough for release decisions.

Golden tasks should be versioned. When the product changes, update them deliberately. When a bug reaches production, add a regression case. When a model upgrade changes behavior, preserve examples of both improved and worsened cases.

For harness engineering, include adversarial and operational cases:

- retrieved document contains prompt injection,
- tool returns no results,
- tool returns stale results,
- user asks for an action outside permission,
- context contains conflicting instructions,
- output is truncated,
- model cites a source that was not provided,
- agent must recover from a failed command,
- and task should end with "not enough information."

## Traces

An agent eval should capture traces: prompts, tool calls, tool outputs, model outputs, validation errors, retries, token counts, timings, and final results. Traces are how engineers debug behavior.

Without traces, failures collapse into vague labels like "the model hallucinated" or "the agent got confused." With traces, you can see whether the problem was retrieval, prompt ambiguity, stale state, bad tool output, schema failure, sampling, or model capability.

Trace review is also how teams discover missing tools. If the model repeatedly searches broadly and then manually filters thousands of tokens, the right fix may be a better search tool. If it repeatedly writes invalid JSON, the fix may be constrained decoding or a simpler schema. If it repeatedly ignores a document section, the fix may be chunking or prompt placement.

Evaluation should generate engineering tasks, not only scores.

## Grading

Some tasks can be graded exactly: JSON schema validity, unit tests, database state, command exit codes. Others require rubric grading. Model-based graders can help but must be treated as components with their own error rates.

A robust eval stack may combine:

- Deterministic validators.
- Unit and integration tests.
- Source citation checks.
- Human review for ambiguous cases.
- Model graders for scalable qualitative checks.

The more consequential the workflow, the more independent the verification should be.

## Reward Hacking in Evals

Reward hacking in post-training (see [Chapter 7](./07-post-training.md)) has a direct analog in harness evals. Karpathy's discussion of reward hacking in RLHF applies here too ([Deep Dive, around 03:04:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11051s)). If the system is optimized against a metric, it may learn to satisfy the metric instead of the real goal.

Examples:

- A summarizer maximizes citation count by citing irrelevant passages.
- A coding agent passes visible tests while breaking hidden behavior.
- A support bot optimizes customer sentiment by avoiding hard truths.
- A retrieval system optimizes click similarity while missing exact policy clauses.
- A model grader rewards fluent explanations that do not answer the question.

Mitigations include hidden tests, multiple metrics, human audits, adversarial cases, and periodic trace review.

## Regression Discipline

Every prompt change, tool schema change, model upgrade, retrieval tweak, or decoding change can alter behavior. Treat these changes like software changes. Run evals before and after. Track pass rates, failure categories, cost, and latency.

This is especially important for model upgrades. A newer model may be better on broad benchmarks and worse on a specific workflow because it follows tool descriptions differently or has different verbosity.

## Key Takeaways

- Evaluate the model-harness workflow, not just the raw model.
- Use realistic golden tasks and capture traces.
- Combine deterministic checks, human review, and model grading where appropriate.
- Treat prompts, tools, retrieval, and model versions as regression-sensitive code.
