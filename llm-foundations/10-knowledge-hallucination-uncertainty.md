# Chapter 10: Knowledge, Hallucination, and Uncertainty

LLMs often sound knowledgeable because pretraining compresses vast amounts of text into model parameters. But parametric knowledge is not the same as a database. It can be stale, incomplete, blended across sources, or wrong.

Karpathy's introduction calls out hallucination as a central failure mode: the model can produce plausible text that is not grounded in reality ([Intro to LLMs, around 00:10:04](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=604s)). For harness engineering, hallucination is not a mysterious personality flaw. It is a predictable consequence of generating likely continuations without an inherent truth oracle.

## Why Hallucination Happens

The model is optimized to predict tokens, and post-training makes those tokens helpful and fluent. Neither objective guarantees factuality. If the context asks for a citation and no citation is available, the model may still continue with something that looks like a citation. If the prompt asks for an answer to an impossible question, the model may infer the most likely answer-shaped text.

Hallucination risk increases when:

- The question requires obscure or fresh facts.
- The prompt implies that an answer must exist.
- The model is asked for exact citations without sources.
- Retrieved context is missing or noisy.
- The task rewards fluency more than verification.
- The model has no tool to check reality.

Karpathy's intro makes this practical with examples where the model produces answer-shaped text despite missing or unreliable knowledge ([Intro to LLMs, around 00:10:04](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=604s)). The model's fluent continuation is not evidence that a fact exists. It is evidence that the text is plausible under the model's learned distribution and current prompt.

This is especially important for harness engineering because harnesses often ask models to produce artifacts that look authoritative: citations, code, changelogs, diagnoses, policy interpretations, test plans, or database explanations. Fluency can hide missing grounding.

## Imitative Falsehoods

Some false answers are not random inventions. A model can imitate common human misconceptions, outdated claims, myths, or false internet patterns because those patterns appear in the training distribution. TruthfulQA was designed to measure this kind of failure: whether a model gives truthful answers rather than mimicking plausible human falsehoods ([TruthfulQA](https://arxiv.org/abs/2109.07958)).

This is one reason "the model has seen a lot of text" is not enough. More scale can make a model better at imitating the data distribution, including parts of that distribution that are false. Post-training, retrieval, and explicit truthfulness evaluation are needed when truth matters.

## Uncertainty Is Not Always Calibrated

Models can express confidence poorly. They may hedge when they are correct and sound certain when they are wrong. Calibration varies by domain, model, prompt, and post-training.

Some research suggests models can partially predict whether they know an answer, but this ability does not generalize perfectly across tasks and prompts ([Language Models Mostly Know What They Know](https://arxiv.org/abs/2207.05221)). Self-reported confidence should therefore be treated as one weak signal, not as verification.

Do not rely on self-reported confidence alone. A harness should build uncertainty controls into the workflow:

- Ask the model to cite provided evidence.
- Require "not found" when sources do not support an answer.
- Use retrieval or tools for facts.
- Run independent verification for high-stakes outputs.
- Compare multiple sources.
- Log evidence used for each answer.

The model can also be over-influenced by the user's framing. If the user asks "Why did X happen?" the model may explain X even if X did not happen. A better harness reframes unsupported assumptions:

```text
Task: Determine whether X happened. If not supported, say so.
Evidence: ...
```

This small change shifts the continuation from explanation to verification.

## Grounding

Grounding means tying generation to supplied evidence or external state. Retrieval-augmented generation is one grounding pattern. Tool use is another. A code execution tool can ground arithmetic. A browser can ground current web facts. A database query can ground account state.

Grounding does not mean the model cannot hallucinate. It means the harness gives the model better evidence and can verify whether the output follows from that evidence.

Grounding quality depends on the whole chain:

1. Is the right source available?
2. Is the user allowed to access it?
3. Did retrieval find the relevant part?
4. Was the retrieved part included clearly?
5. Did the model cite the right evidence?
6. Did the answer stay within the evidence?

Failures at any step can look like "the model hallucinated," but the fix may be retrieval, permissions, chunking, prompt structure, or citation validation.

## Hallucination vs Tool Error

Once tools enter the system, factual errors can come from outside the model. A search API may return stale results. A database query may use the wrong tenant. A browser may fail to load dynamic content. A file reader may read the wrong branch. The model then summarizes bad observations.

The harness should distinguish:

- model invented unsupported content,
- retrieval returned irrelevant content,
- tool output was wrong,
- context omitted the needed source,
- source itself was wrong,
- or final answer failed to cite the source.

Trace logs are the only practical way to make these distinctions.

## Safety, Refusal, and Jailbreaks

Hallucination is a truthfulness failure. Jailbreaks are behavior-control failures. Karpathy's intro shows jailbreak examples to explain that safety behavior can be contextually disrupted ([Intro to LLMs, around 00:46:16](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2776s)). For harness engineers, this means safety cannot depend only on the model declining unsafe text.

Use layered controls:

- classify requests before tool access,
- restrict dangerous tools by policy,
- require confirmation for irreversible actions,
- keep secrets out of prompt context,
- sanitize untrusted documents,
- and log refusal/override events.

The model's refusal behavior is one layer. It is not the whole safety system.

## Citations and Source Discipline

A citation should refer to an actual source the system used. If the model invents a source title, the answer is worse than uncited text because it creates false auditability.

Harnesses can enforce source discipline:

- Retrieve documents with stable IDs.
- Pass snippets with source metadata.
- Require answers to cite only those IDs.
- Validate that cited IDs exist.
- Optionally check that cited snippets contain supporting text.

This shifts citations from a writing style to a system contract.

## Key Takeaways

- Parametric knowledge is compressed and fallible.
- Hallucination is likely continuation without sufficient grounding.
- Self-confidence is not a reliable verifier.
- Harnesses should ground, cite, verify, and allow "not found."
