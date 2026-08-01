# Chapter 13: Evaluating LLM Behavior

LLM behavior is probabilistic and context-sensitive. A change in the prompt, chat template, decoding configuration, or sampled token path can change the result. Even nominally identical requests may not produce identical outputs. Evaluation therefore accumulates evidence across tasks and trials; a single impressive answer or failure is weak evidence.

An eval score is always conditional on a setup: the model checkpoint or served version, the inputs, the decoding configuration, the task distribution, and the grader. It describes observed behavior under those conditions, not an intrinsic, context-free property of the model.

## Benchmarks and Their Limits

Public benchmarks measure particular slices of behavior. MMLU tests broad academic and professional knowledge, TruthfulQA probes answers to questions that invite common misconceptions, and HumanEval and MBPP use executable programming problems to test code generation ([MMLU](https://arxiv.org/abs/2009.03300), [TruthfulQA](https://arxiv.org/abs/2109.07958), [HumanEval](https://arxiv.org/abs/2107.03374), [MBPP](https://arxiv.org/abs/2108.07732)). BIG-bench and HELM illustrate broader efforts to compare models across many tasks and metrics ([BIG-bench](https://arxiv.org/abs/2206.04615), [HELM](https://arxiv.org/abs/2211.09110)).

These scores are useful comparison signals, but their scope is limited. A benchmark may differ from the tasks of interest, emphasize one format, become saturated, or be contaminated by training data. Prompting and decoding choices also affect the measured result. A higher aggregate score does not guarantee improvement on every task, language, or failure mode.

Benchmarks that require tools or an interactive environment measure a model together with the surrounding protocol and system. They can be valuable, but their scores are not measurements of the model alone.

## Representative Tasks

A golden task set is a curated collection of inputs and checkable success criteria. It should cover representative ordinary cases, important edge cases, and known historical failures. A criterion may be an exact answer, a set of required properties, executable checks, or a clear rubric. The set should be versioned so that changes to tasks and expected results remain distinguishable from changes in model behavior.

Toy prompts are useful for diagnosis, but they do not establish performance on a broader distribution. The task set should resemble the inputs and output requirements for which the result will be interpreted. Holding out some tasks also reduces the risk of repeatedly tuning to the visible examples rather than improving the intended behavior.

### Capability and Regression Evals

A **capability eval** asks which tasks a model can perform under a stated prompting and decoding setup. It deliberately includes tasks that are not yet solved reliably, so it can reveal both demonstrated behavior and room for improvement. It provides evidence about elicited capability under those conditions, not proof of everything the model could do under every possible prompt.

A **regression eval** asks whether behavior that previously worked still works after a model, prompt, or decoding change. A capability task that becomes consistently reliable may later serve as a regression case. The two eval types use similar mechanics but answer different questions.

## Repeated Trials

Because behavior can vary from run to run, report the number of trials, the number or rate of successes, and—when comparisons matter—an uncertainty interval. A result such as 8 successes in 10 trials is an estimate with substantial uncertainty; a small difference between two configurations may be noise.

Two commonly used summaries answer different questions:

- **pass@k** is the probability that at least one of \(k\) attempts succeeds. It is relevant when several candidates can be generated and one successful candidate can be selected.
- **pass^k** is the probability that all \(k\) attempts succeed. It is relevant when the same task must succeed repeatedly.

If trials are independent and each has success probability \(p\), then pass@k is \(1-(1-p)^k\), while pass^k is \(p^k\). Real trials may be correlated, so empirical estimates should state how tasks and attempts were sampled. Neither metric is inherently more honest: the appropriate one depends on the behavior contract being studied.

Record the model version, full input, chat template, sampling parameters, and any seed supported by the API. A fixed seed can reduce one source of variation and make paired debugging comparisons easier, but it does not guarantee reproducibility in hosted inference. Backend changes, numerical nondeterminism, and implementation details may still change the output. Use multiple independent trials when the goal is to characterize behavioral variability.

Do not call every pass/fail flip a flaky eval. If the same saved output receives different verdicts, a validator intermittently fails, or task inputs change unexpectedly, the measurement setup or grader is unstable and should be repaired. If repeated model outputs genuinely differ in correctness under the stated setup, the eval has found unstable model behavior; repetition should measure and report it rather than make it disappear.

## Grading

Different outputs require different graders:

- **Deterministic or code-based graders** use exact matching, structured-output validation, or executable checks. They are fast and reproducible but can reject valid variations or test only a narrow property.
- **Human graders** can apply domain judgment to ambiguous or subjective outputs, but they are slower and may disagree when the rubric is underspecified.
- **Model-based graders** can apply natural-language rubrics at scale, but their verdicts are themselves probabilistic model outputs.

These methods can be combined. Use deterministic checks for properties they can actually establish, and calibrate human or model judgments against clearly labeled examples. For example, a valid citation format does not establish that the source exists, and source existence does not establish that it supports the claim.

A grader is a proxy for the intended quality, not ground truth. Reward models in post-training have the same basic limitation: they approximate preferences rather than directly observe them ([Deep Dive, around 02:52:39](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10359s)). Model graders also need their model, prompt, rubric, and disagreement policy recorded.

## Metrics as Proxies

When development is optimized against a visible metric, outputs can improve on the metric without improving the underlying goal. This is the evaluation analogue of reward hacking discussed in [Chapter 7](./07-post-training.md) ([Deep Dive, around 03:04:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11051s)).

For example, a summarizer may increase citation count by attaching irrelevant citations, an answer may maximize keyword overlap while preserving a factual error, or a model grader may reward polished verbosity over correctness. No single metric fully specifies qualities such as truthfulness, usefulness, or clarity.

Use complementary metrics, balanced and held-out cases, and periodic human inspection of examples where graders disagree. When a score rises, inspect whether the newly rewarded behavior is the behavior the metric was intended to represent.

## Where Model Evaluation Ends

Direct model evals can measure properties visible in outputs under supplied context, such as task accuracy, factuality, citation support, and format or schema validity. Preserve the input, output, configuration, and grader result so individual judgments can be inspected.

When success depends on tool execution, error recovery, permissions, side effects, or the final state of an external environment, the unit under evaluation is no longer the model alone. It is a system eval. Agent transcripts and traces, environment-state grading, operational reliability, and release gates belong to the surrounding system; see [Agent Harness, Chapter 11](../agent-harness/11-evaluation.md).

## Key Takeaways

- LLM behavior is probabilistic and context-sensitive, so eval conclusions require representative tasks and repeated trials.
- Public benchmarks provide bounded evidence about their own task distributions, not universal model rankings.
- Capability evals probe what can be elicited; regression evals check whether previously demonstrated behavior persists.
- pass@k and pass^k answer different questions, and a seed does not guarantee reproducible hosted inference.
- Deterministic, human, and model graders all measure proxies and have distinct failure modes.
- Evaluation of tool execution, permissions, side effects, or environment state is system evaluation, not model-only evaluation.
