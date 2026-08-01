# Chapter 10: Knowledge, Hallucination, and Uncertainty

LLMs often sound knowledgeable because pretraining encodes statistical regularities from large text collections into model parameters. Those regularities support recall, explanation, and generalization, but they do not form an authoritative record of facts. A model can produce fluent text that is false, stale, or unsupported even when its tone and format resemble a reliable answer.

Karpathy's introduction presents hallucination as a central failure mode: a model can generate plausible text without having a built-in truth oracle ([Intro to LLMs, around 00:10:04](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=604s)). Hallucination is not limited to cases with no evidence. A model can also misread supplied evidence, cite the wrong part of it, or extend a claim beyond what the evidence supports.

## Parametric Knowledge Is Not a Database

Parametric knowledge is information that can be elicited from patterns encoded in learned weights. It has no database-style guarantee of a unique record, explicit provenance, or current value. A fact may have appeared in several contradictory forms during training, may be weakly represented because it was rare, or may have changed after the relevant training data was collected.

This also means that "stored" is only a metaphor. There is usually no single parameter or row corresponding to one fact. Related names, dates, phrasings, and associations are distributed across the network and interact with the current context. A prompt may successfully elicit one association in one wording and a different or incorrect association in another.

Parametric knowledge can nevertheless be useful. The important boundary is that a plausible answer from the parameters is a prediction, not a read from an authoritative source.

## How Plausible False Answers Emerge

The pretraining objective rewards predicting likely continuations, not checking each claim against reality. Training text also contains mistakes, myths, fiction, outdated material, and confident prose whose truth is not marked. Post-training can make answers more helpful and complete, but helpfulness and completeness do not guarantee factuality.

An answer-shaped prompt further narrows the likely continuation toward an answer-shaped response. If a question presupposes a nonexistent event, book, or theorem, continuing the premise may be statistically easier than challenging it. If an exact citation is requested without a source, a title, author list, venue, and year can all look locally plausible even when the combined reference does not exist.

Risk is especially high when:

- the requested fact is rare or recent;
- the question contains a strong but unsupported premise;
- an exact quotation or citation is demanded without a source;
- the interaction rewards fluent completion or an authoritative format more than acknowledging uncertainty.

The resulting prose may resemble an encyclopedia entry, legal clause, or research citation. That authoritative shape can increase a reader's confidence without increasing the answer's truth.

## A Taxonomy of Model-Level Errors

Several mechanisms can produce a false or unsupported answer:

- **Recall errors** substitute the wrong name, date, relation, or detail.
- **Staleness** reproduces a claim that was once true or common but is no longer current.
- **Conflation** blends attributes of different people, documents, events, or concepts.
- **Imitative falsehoods** reproduce misconceptions and myths found in human-written text. TruthfulQA was designed to test whether models tell the truth instead of imitating plausible human falsehoods ([TruthfulQA](https://arxiv.org/abs/2109.07958)).
- **False-premise compliance** accepts an unsupported premise and generates an explanation around it. For example, "Why did X happen?" steers the continuation toward causes even when whether X happened is still in question.
- **Evidence misuse** contradicts supplied material, selects the wrong passage, or infers more than that material supports.

These categories overlap, and not every false answer reveals which internal mechanism caused it. They are still useful because they show that hallucination is broader than inventing a fact from an empty context.

## Grounding Changes the Input

Grounding supplies external evidence or observations in the model's current input. This can make a supported continuation more likely, but it does not rewrite the model's parameters or guarantee that the evidence will be used correctly. The model can ignore a relevant passage, favor a conflicting parametric association, or make an unsupported inference from a real source.

[Chapter 11](./11-embeddings-and-retrieval.md) explains retrieval-augmented generation and the path by which external text enters a prompt. [Chapter 12](./12-reasoning-tools-and-agents.md) explains the separate boundary between a model generating a proposed action and an external system executing it.

## Uncertainty and Calibration

Uncertainty is not the same as calibration. Operationally, a set of predictions is calibrated at confidence \(q\) when, among representative predictions assigned confidence \(q\), approximately a fraction \(q\) are correct. For example, among answers assigned 70% confidence, about 70% should be correct. Calibration is therefore a property measured over many cases, not a property established by one confident sentence.

Accuracy and calibration are also different. A model can have high average accuracy while assigning 99% confidence to many of its errors, or lower accuracy while reporting probabilities that better match observed frequencies. Calibration can change across domains, question formats, prompts, decoding settings, and post-training.

Three quantities should not be conflated:

- **Verbal confidence** is language such as "probably" or "definitely." It is generated text and can reflect style as much as uncertainty.
- **Token probability** is the model's probability for a particular next token. It measures the likelihood of a surface continuation, not directly the probability that a complete claim is true.
- **Answer-correctness probability** is a task-level estimate that a final answer is correct under a defined evaluation rule. A standard language-model response does not automatically provide this quantity.

Research suggests that models can sometimes estimate whether they know an answer, but this ability does not transfer perfectly across tasks and prompts ([Language Models Mostly Know What They Know](https://arxiv.org/abs/2207.05221)). Self-reported or elicited confidence is therefore evidence about model behavior, not independent verification of the answer.

## Epistemic Abstention Is a Learned Behavior

An **epistemic abstention** declines to answer because the model cannot support an answer with sufficient knowledge or evidence. Phrases such as "I don't know" and "the information provided is insufficient" are output behaviors, not direct readouts from a dedicated uncertainty register.

The tendency to answer rather than abstain comes from more than one source: the next-token objective, answer-like patterns in pretraining data, the wording of the prompt, and post-training preferences can all contribute. Karpathy's deep dive highlights one version of this problem: answer demonstrations commonly contain confident, complete responses and few examples of "I don't know" ([Deep Dive, around 01:20:32](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=4832s)). This can reinforce answer-shaped completion, but SFT alone is not a complete explanation for hallucination.

Post-training can explicitly reward abstention on questions outside a model's demonstrated knowledge boundary. The learned behavior remains incomplete: a model may fail to abstain on an unfamiliar gap, or abstain even when it could answer. An abstention is thus useful behavior, but not proof of a perfectly detected internal knowledge boundary.

## Safety Refusal and Jailbreaks

A **safety refusal** declines a request because it falls into a learned category of unsafe or disallowed behavior. It differs from epistemic abstention: a model may understand a request and still refuse it for safety reasons, while a benign question may call for abstention simply because the answer is unknown.

Safety refusals are shaped by post-training and context, so they are probabilistic behaviors rather than hard guarantees. A **jailbreak** is an attempt to elicit behavior that bypasses those learned safety constraints, for example by reframing the request through role-play, hypotheticals, or encoded instructions. Karpathy's introduction uses jailbreak examples to show that refusal behavior can be disrupted by context ([Intro to LLMs, around 00:46:16](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2776s)).

Jailbreak and prompt injection are related but not synonymous. A jailbreak is defined by the goal of bypassing behavioral constraints and can come directly from a user. [Prompt injection](./08-prompting-and-in-context-learning.md#prompt-injection-as-context-confusion) occurs when untrusted content supplies instruction-like text that changes the model's behavior contrary to the intended task; it may target safety, but it can also redirect an otherwise benign task. They overlap when injected content attempts a safety bypass.

Because refusal is learned behavior, guarantees about access or external actions must exist outside the model. The execution boundary is covered in [Chapter 12](./12-reasoning-tools-and-agents.md), and the detailed system controls belong to the companion [Agent Harness](../agent-harness/README.md).

## Self-Report Is Not Authoritative Metadata

Questions such as "What model are you?", "When is your training cutoff?", or "Can you browse the web?" ask the model to generate another continuation. The answer may reflect post-training examples, the current prompt, or information supplied by the application. It is not an introspective read from the deployment configuration.

A self-report can be correct, especially when accurate metadata is present in context, but the generated statement alone does not establish its accuracy. Model identity, release details, and deployed capabilities are properties of the model artifact and surrounding system, not facts that should be inferred from the model's prose.

## Citation-Shaped Hallucination

Citations are particularly convincing because their format signals evidence. A model can generate a plausible title, author, journal, statute number, URL, or quotation even when no matching source exists. It can also cite a real source that does not support the claim or attach a valid citation to the wrong sentence.

Three questions are independent:

1. **Source existence:** does the cited source exist?
2. **Claim support:** does that source actually support the associated claim?
3. **Citation attachment:** is the citation formatted and placed so that the supported claim is identifiable?

A polished citation answers none of these questions by appearance alone. Retrieval and provenance are introduced in [Chapter 11](./11-embeddings-and-retrieval.md); evaluating factual and citation correctness is covered in [Chapter 13](./13-evaluation-for-llm-behavior.md).

## Model Failure vs System Failure

Once external evidence or observations are involved, an incorrect final answer is not automatically evidence that the model invented it. If a model faithfully summarizes an erroneous observation, the upstream source or system failed even though the final claim is false. If the observation is correct but the model contradicts it or adds an unsupported claim, that part is a model failure. Both can occur in the same answer.

This distinction matters conceptually because grounding changes what the model receives; it does not collapse the model and the surrounding system into one component. Diagnosing the complete evidence, tool, permission, and execution path is a systems topic treated in the companion [Agent Harness](../agent-harness/README.md).

## Key Takeaways

- Parametric knowledge is distributed, fallible, and not an authoritative database.
- Fluent false answers arise from predictive training, imperfect data, answer-shaped prompts, and learned response preferences.
- Hallucination includes recall errors, staleness, conflation, imitative falsehoods, false-premise compliance, and misuse of supplied evidence.
- Calibration is measured across cases; verbal confidence, token probability, and answer-correctness probability are different quantities.
- Epistemic abstention and safety refusal serve different purposes, and both are learned behaviors rather than infallible internal signals.
- Jailbreaks target learned behavioral constraints; prompt injection describes untrusted instructions changing the intended task.
- Model self-reports and citation-shaped text are not authoritative metadata or proof of support.
- A false system output may result from model error, an erroneous external observation, or both.
