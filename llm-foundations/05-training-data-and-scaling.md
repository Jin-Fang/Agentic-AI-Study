# Chapter 5: Data and Scaling

Pretraining quality depends on data, model size, and compute. Karpathy's deep dive begins with data collection and filtering, using web-scale datasets as the practical substrate for modern LLMs ([Deep Dive, around 00:01:28](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=88s)). For harness engineers, data matters because it explains both capability and blind spots.

## Web Data Is Not Neutral

Large pretraining corpora contain web pages, books, code, papers, discussions, documentation, and many other text sources. They also contain duplication, spam, low-quality text, outdated facts, toxic material, personal data, and distributional bias. Data pipelines filter, deduplicate, classify, and rebalance these sources, but no pipeline produces a perfect representation of truth.

Karpathy emphasizes that dataset construction is a major part of the work, not a side detail. This is why model behavior can differ across domains. A model may be strong at Python because it saw a large amount of code, weaker at a niche internal DSL because it did not, and unreliable on a private company's current process because that process was never in pretraining data.

The deep dive uses FineWeb as a concrete public example of a web-scale text dataset and discusses how raw Common Crawl-like data must be transformed before training ([Deep Dive, around 00:01:28](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=88s)). The raw web is not a clean book. It contains menus, cookie banners, duplicated templates, spam, broken extraction, boilerplate, and pages in many languages.

Dataset construction therefore includes:

- extracting text from raw web pages,
- filtering low-quality or irrelevant content,
- classifying language,
- deduplicating repeated text,
- removing or reducing spam and boilerplate,
- mixing sources in chosen proportions,
- and converting the final corpus into tokens.

Each of these steps is a modeling decision. They shape what the model later treats as normal.

## Filtering Is Policy Embedded in Data

Karpathy calls out language filtering as one example: if a dataset is focused on English, then non-English content is reduced by design ([Deep Dive, around 00:04:54](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=294s)). Similar decisions happen for adult content, code, mathematical text, copyrighted material, forums, social media, and documentation.

This matters because a model's competence and behavior reflect the mixture it was trained on. A harness engineer should expect domain variation:

- Legal, medical, or finance behavior depends on what high-quality domain text was present and how post-training shaped it.
- Code ability depends on the quality, language distribution, and freshness of code data.
- Multilingual behavior depends on language coverage and tokenizer efficiency.
- Safety behavior depends on both pretraining distribution and post-training refusal/preference data.

When a workflow matters, do not infer reliability from generic model reputation. Test it on the workflow.

## Deduplication and Memorization

Duplication affects training. Repeated text can receive disproportionate weight, making the model more likely to memorize or imitate it. Deduplication reduces this risk and improves data efficiency, but it is imperfect. Some repeated templates are useful; others are noise.

For harnesses, the practical lesson is that model memory is uneven. A model may know a popular library's old API because many copies existed online, while failing on a newer API that appears in fewer places. Retrieval and local inspection are the right controls for this.

## Scaling Laws

The broad empirical lesson of the last several years is that larger models trained on more data with more compute often improve predictably. Kaplan et al. found power-law relationships between loss and model size, dataset size, and compute over large ranges ([Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361)).

Later work showed that compute-optimal training requires balancing parameters and tokens. The Chinchilla paper argued that many earlier large models were undertrained relative to their size, and that using more data for a smaller model can outperform a much larger undertrained model at the same compute budget ([Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556)).

Scaling laws are strongest as statements about aggregate loss and average trends. They are not a guarantee that every benchmark, workflow, or capability improves smoothly. Some apparent "emergent" jumps can be partly caused by metric choice or thresholded scoring rather than a sharp new internal mechanism ([Are Emergent Abilities of Large Language Models a Mirage?](https://arxiv.org/abs/2304.15004)).

This matters for model selection. A larger model may reduce pretraining loss while still being worse for a workflow because of post-training behavior, latency, context handling, tool calling, safety policy, or data freshness. Scaling is a powerful trend, not a substitute for task-specific evaluation.

The harness-level consequence is straightforward: model selection is not just "bigger is better." A smaller, well-trained, well-post-trained model may be better for a specific workflow than a larger model with poor tool-use behavior, weak instruction following, or worse latency.

## Compute Is an Operational Constraint

Training produces parameters, but inference spends compute every time the model is used. Karpathy shows concrete GPU-oriented examples in the deep dive to make the cost visible ([Deep Dive, around 00:40:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=2411s)). For harness work, this means cost is not only a provider billing concern. It changes architecture.

Expensive inference encourages:

- shorter prompts,
- smaller models for easy subtasks,
- caching stable prefixes or tool results,
- retrieval before generation instead of dumping all documents,
- early exits when validation is already sufficient,
- and routing between models based on task difficulty.

The best harness is often not "call the largest model for everything." It is a system that spends model capacity where it changes the outcome.

## Quantization and Numerical Precision

[Chapter 1](./01-llm-as-token-machine.md) estimated model size by multiplying parameter count by bytes per parameter. Quantization changes that second factor. Instead of storing and computing weights at 16-bit precision, a model can be served at 8-bit, 4-bit, or lower, trading some numerical fidelity for a smaller memory footprint and faster inference. Methods such as LLM.int8() and GPTQ showed that large models can be quantized with limited quality loss ([LLM.int8()](https://arxiv.org/abs/2208.07339), [GPTQ](https://arxiv.org/abs/2210.17323)).

For harness engineers, quantization is an operational lever, not a model-internal detail:

- The same model at lower precision is cheaper and faster but may behave slightly differently, especially on edge cases, long outputs, or precise formatting.
- A provider may quantize silently. A model can change behavior without changing its name if its serving precision changes.
- Local deployment often depends on quantization to fit a model into available memory.

The rule is the same as for any model change: treat a precision change as a behavior change and re-run evals (see [Chapter 13](./13-evaluation-for-llm-behavior.md)). A quantized model that passes your golden tasks is fine; assuming it matches the full-precision model without checking is not.

## Data Freshness and Training Cutoffs

Training is episodic. A model is trained on a corpus collected before some point in time, then deployed. Post-training and retrieval can add behavior and information, but the parameters themselves do not automatically update with the world.

This is why a model can know a 2020 paper but not a policy updated yesterday. It is also why local repo inspection beats model memory for current code. Any harness that handles changing facts should have a freshness path: retrieval, browser, database, file read, or user-provided evidence.

## Data Distribution Shapes Competence

Models are strongest where training data and post-training data contain similar patterns. They are weaker where the task requires:

- Fresh information after the training cutoff.
- Private or local state.
- Exact recall of obscure facts.
- Long chains of precise computation.
- Actions in an external environment.
- Domain policies that are not public.

These are harness opportunities. Retrieval supplies fresh and private data. Tools perform exact computation. Sandboxes execute code. Evals measure whether a given model-harness combination handles the domain.

## Contamination and Evaluation

Web-scale data creates benchmark contamination risk. If a model saw test examples during training, benchmark results may overstate generalization. Harness engineers should be careful when using public benchmarks to choose models for internal workflows. Private, task-specific evals are often more informative.

This also affects agent design. A model may know the public shape of a framework but not the current repo's local conventions. The harness should inspect the actual repo, run the actual tests, and provide the actual files rather than relying on parametric knowledge.

## Key Takeaways

- Training data is a major determinant of model behavior.
- Scaling improves models, but compute, data, parameters, and post-training all interact.
- Public model knowledge should not be treated as current local truth.
- Harnesses compensate for data limits with retrieval, tools, verification, and domain-specific evals.
