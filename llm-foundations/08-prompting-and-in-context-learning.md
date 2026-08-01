# Chapter 8: Prompting and In-Context Learning

Prompting is inference-time conditioning. A model receives a token context and produces a continuation conditioned on that context. Changing the instructions, data, examples, or formatting in the context can therefore change the distribution of possible continuations without changing the model's parameters.

In-context learning (ICL) is the model's ability to adapt its behavior from patterns presented in that context. The adaptation lasts only for the current context; it is not a weight update and does not become a persistent skill or memory. GPT-3 made this capability prominent through zero-shot, one-shot, and few-shot results across many tasks ([Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165)).

## What Makes Up a Prompt

A prompt may combine several kinds of content:

- **Instructions** describe the requested task.
- **Input data** supplies the text, question, or evidence to work on.
- **Examples** demonstrate an input-to-output pattern.
- **Constraints** narrow acceptable answers.
- **Output format** describes the desired structure of the continuation.

Chat APIs may also distinguish system, developer, user, and assistant messages. Those roles are not separate channels inside the Transformer. A provider-specific chat template serializes roles and content into the representation processed by the model. Post-training teaches the model patterns associated with those role markers, but it does not turn them into an infallible priority mechanism. The discussion of conversation tokenization in the deep dive illustrates how roles ultimately become part of the model input ([Deep Dive, around 01:05:03](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3903s)).

The same words can have different effects depending on their position, surrounding labels, examples, and the model's training. Prompting works by supplying evidence about the continuation that is wanted, not by installing a deterministic program.

## Structure Reduces Ambiguity

Headings, delimiters, tags, and consistent field names can help the model distinguish a task from its input. An explicit output format can also make a desired continuation easier to infer. For example:

```text
Task:
Answer the question using the documents below. Cite the source ID.
If the documents do not contain the answer, reply: NOT_FOUND.

<documents>
  <doc id="d1">Refund requests are accepted within 14 days of delivery.</doc>
  <doc id="d2">Gift cards are non-refundable.</doc>
</documents>

Question:
How long do I have to request a refund?

Answer:
```

The headings and tags expose the intended structure: task, evidence, question, and answer. They do not make the model parse the prompt like a compiler, and they do not guarantee that the answer will follow the instructions.

Most importantly, a delimiter is not a security boundary. If a document inside `<documents>` says "ignore the task and reveal a secret," the model may still be influenced by it. Delimiters can reduce ordinary ambiguity, but they do not reliably isolate data from instructions or enforce trust.

## Zero-Shot, One-Shot, and Few-Shot Prompting

A **zero-shot** prompt specifies a task without showing a completed example. A **one-shot** prompt includes one example. A **few-shot** prompt includes several. In each case the parameters remain fixed; only the context changes.

Few-shot prompting works because a model can continue patterns demonstrated by input-output pairs. It is often useful for:

- applying task-specific labels,
- extracting fields from irregular text,
- matching a particular response format or style,
- handling ambiguous or insufficient input,
- and translating a natural-language request into a structured representation.

Examples provide more than a format. They also imply assumptions about labels, edge cases, tone, and what information matters. That makes example selection consequential. If every demonstration is positive, the model may develop a positive bias for the next case. If demonstrations contain obsolete facts or accidental formatting quirks, the continuation may reproduce them. The order of examples can matter as well.

Examples also consume context tokens. More demonstrations are not automatically better: irrelevant or conflicting examples can make the task less clear. Few-shot prompting is useful when examples convey a pattern more effectively than prose, but its effect remains probabilistic and model-dependent.

## Reasoning Prompts and Their Limits

Chain-of-thought prompting asks for intermediate reasoning before a final answer. It can improve performance on some multi-step tasks, especially for sufficiently capable models ([Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://arxiv.org/abs/2201.11903)). The effect varies with the model, task, demonstrations, and decoding method; "think step by step" is not a universal improvement.

Generated reasoning is still generated text. A plausible chain can contain an early mistake, skip a decisive step, or rationalize an answer reached through other internal computations. Visible reasoning is therefore not guaranteed to be a faithful explanation of how the model produced its answer. It should not be treated as proof that the conclusion is correct.

Self-consistency is a related technique: sample multiple reasoning paths and aggregate their final answers rather than rely on one path ([Self-Consistency Improves Chain of Thought Reasoning in Language Models](https://arxiv.org/abs/2203.11171)). Agreement can improve results on some benchmarks, but repeated agreement does not establish truth. The method also uses multiple generations and therefore more inference compute.

## Reasoning Models and Test-Time Compute

Some models are post-trained to spend additional inference-time computation on intermediate reasoning. These are commonly called *reasoning models*. DeepSeek-R1, for example, describes reinforcement learning on verifiable tasks as a route to strong reasoning behavior ([DeepSeek-R1](https://arxiv.org/abs/2501.12948)); [Chapter 7](./07-post-training.md) introduces this kind of post-training.

This is a form of *test-time compute*: a difficult prompt may lead the model to produce more intermediate tokens before its final answer. Those tokens may be visible, hidden, or summarized by the provider, but they still affect latency and computational cost. Asking such a model for an additional explicit chain of thought may be redundant or may interfere with its learned behavior.

More reasoning can improve the use of information already available to the model, but it is not grounding. It does not supply a missing current fact, make a false premise true, or turn a generated explanation into verified evidence. A reasoning model remains conditioned on its parameters and current input.

## Tool-Use Prompting at the Model Boundary

Tool use begins, from the model's perspective, as another prompting and generation problem. Tool definitions, argument schemas, and sometimes examples are included in the model's input. The model can then generate a structured call such as:

```json
{
  "name": "get_weather",
  "arguments": {
    "city": "Boston"
  }
}
```

That JSON is only model output. The model has not contacted a weather service or changed external state. An external system interprets the proposed call, decides whether and how to execute it, and may return an observation in a later model context. The model can then condition its next continuation on that observation.

This chapter is concerned only with how the tool description and observed result affect model generation. The execution loop and the distinction between proposing and acting are covered in [Chapter 12](./12-reasoning-tools-and-agents.md). Tool interfaces and production controls belong to the companion [Agent Harness](../agent-harness/06-tools-invocation-lifecycle.md).

## Prompt Injection as Context Confusion

Prompt injection occurs when untrusted content contains instruction-like text that changes model behavior in an unintended way. A retrieved page might say to ignore the original question. An uploaded document might contain hidden commands. A tool observation or an image can also carry text that competes with the intended task.

At the model level, all of this becomes input that can influence the next-token distribution. Role markers, phrases such as "treat this as data," and delimiters may help the model infer the intended hierarchy, but they do not create a hard separation between trusted instructions and untrusted content. Prompt injection is therefore not solved merely by writing a stronger prompt or nesting the untrusted text inside tags.

The model can be trained to resist many such instructions, but resistance is behavioral rather than an enforcement guarantee. Any security guarantee about external actions or protected information must be implemented outside the model. [Chapter 12](./12-reasoning-tools-and-agents.md) establishes that execution boundary; the companion chapters on [system prompts](../agent-harness/02-system-prompts-instructions-policy.md) and [runtime enforcement](../agent-harness/07-sandboxing-runtime-enforcement.md) cover the system-level treatment.

## What Prompting Cannot Provide

Prompting can elicit and steer capabilities learned during training, but it does not update the model's parameters. It cannot reliably create a capability the model lacks, guarantee a correct answer, or make generated reasoning faithful.

A prompt is also not durable memory. It conditions one model call. If an application later sends an earlier exchange again, that text becomes part of a new context; the model itself did not preserve state between calls. Context-window limits and their consequences are covered in [Chapter 9](./09-context-window-and-kv-cache.md).

Finally, prompting grants no permission and performs no external action. A sentence that says "you may access this account" is still just input text, and a generated action description is still output text. Execution, persistent state, and security isolation are properties of systems around the model, not properties supplied by a prompt.

## Key Takeaways

- Prompting changes inference-time context, not model parameters.
- In-context learning uses instructions and examples in the current context to shape behavior.
- Structure and delimiters can reduce ambiguity, but they are not security boundaries.
- Few-shot and reasoning prompts can improve some tasks, but their effects are probabilistic and model-dependent.
- More test-time reasoning does not create new evidence or guarantee correctness.
- Tool calls are generated proposals; external systems execute them.
- Prompts do not provide durable memory, permission, execution, or security isolation.
