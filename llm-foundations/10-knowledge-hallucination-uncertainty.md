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

## The Training Mechanism Behind Confident Wrong Answers

There is also a training-side reason the model answers confidently even when it has no knowledge. SFT data is written by labelers who almost always answer confidently and completely; "I don't know" responses are virtually absent ([Deep Dive, around 01:20:32](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=4832s)). The model imitates that style. So when a question lands on a gap in its parametric knowledge, the learned behavior is still to produce a confident, answer-shaped completion rather than to abstain.

The model-side mitigation is to teach abstention explicitly. One approach probes the model's knowledge boundary — automatically asking questions and checking whether the model actually knows the answers — and then adds SFT samples where the correct target for an unknown question is "I don't know." This maps the model's internal uncertainty onto an explicit refusal-to-answer behavior.

The lesson for harness engineers: a model saying "I don't know" is not an emergent property of knowing less. It is an explicitly trained, and incompletely covered, behavior. The training only spans the questions the probing process happened to surface, so the model will still answer confidently on gaps it was never trained to recognize. A harness cannot rely on the model to volunteer "I don't know" — it must build the "not found" path into the workflow itself (see below).

## Knowledge of Self Is Also Hallucinated

The same dynamic applies when a model describes itself. Ask "what model are you?", "when is your training cutoff?", or "can you browse the web?", and the answer is just another likely continuation, shaped by post-training data and whatever the prompt suggests — not a readout from a fact sheet. A model can confidently report the wrong name, a stale cutoff date, or capabilities it does not have in this deployment.

So a harness must not use the model's self-description for routing or compliance. Inject identity, training cutoff, available tools, and capability limits from configuration or the provider's metadata; do not ask the model. The model is a source of generated text, not a source of truth about itself.

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

Grounding means tying generation to supplied evidence or external state. [Retrieval-augmented generation](./11-embeddings-and-retrieval.md) is one grounding pattern. Tool use is another. A code execution tool can ground arithmetic. A browser can ground current web facts. A database query can ground account state.

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

Hallucination is a truthfulness failure. Jailbreaks are behavior-control failures. This section is the book's formal treatment of safety, refusal, and layered control; other chapters reference it rather than repeating the list.

Refusal is a trained behavior, just like "I don't know" above: safety data in post-training teaches the model to decline certain requests, but those refusals are learned patterns, not hard guarantees. Karpathy's intro shows jailbreak examples to explain that safety behavior can be contextually disrupted ([Intro to LLMs, around 00:46:16](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2776s)). A prompt that reframes the request — role-play, hypotheticals, encoded text, or an injected instruction inside an untrusted document — can push the model past a refusal it would otherwise produce. For harness engineers, this means safety cannot depend only on the model declining unsafe text.

Use layered controls, so that no single layer is load-bearing:

- classify requests before granting tool access,
- restrict dangerous tools by policy,
- require confirmation for irreversible actions,
- sandbox tool execution and scope its network and filesystem access,
- keep secrets out of prompt context,
- sanitize untrusted documents before they enter the prompt,
- and log refusal and override events for audit.

The model's refusal behavior is one layer. It is not the whole safety system. The harness, not the model's intent, decides what is allowed to run.

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
- Confident answers and "I don't know" are both trained behaviors; the harness cannot rely on the model to abstain.
- The model's self-description is hallucinated too; inject identity and capability metadata from config, do not ask the model.
- Self-confidence is not a reliable verifier.
- Refusal is one safety layer, not the whole system; use layered controls.
- Harnesses should ground, cite, verify, and allow "not found."
