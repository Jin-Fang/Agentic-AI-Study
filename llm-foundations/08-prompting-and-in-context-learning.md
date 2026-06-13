# Chapter 8: Prompting and In-Context Learning

Prompting is the act of constructing the model's context so that the desired continuation is likely. In-context learning is the model's ability to adapt behavior from instructions and examples inside the prompt without changing its parameters. GPT-3 made this capability central by showing strong zero-shot, one-shot, and few-shot behavior across many tasks ([Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165)).

This chapter is a turning point. Chapters 1-7 established what the model is: a token machine, shaped by pretraining and post-training, sampled at inference. From here the focus shifts to how that mental model changes harness design. Prompting is the first place those properties become an engineering interface.

For harness engineers, prompting is not a trick. It is runtime programming against a probabilistic interface.

## Instructions, Data, and Examples

A good prompt separates concerns:

- **Instructions** say what to do.
- **Data** provides evidence or input.
- **Examples** show the desired pattern.
- **Constraints** define what not to do.
- **Output contracts** define the shape of the answer.

When these are mixed together, the model has to infer which text is authoritative. That is dangerous when the context contains retrieved web pages, user-provided documents, logs, or tool results.

Harnesses should mark boundaries clearly. A retrieved email is data, not an instruction. A user message is lower priority than system policy. A tool result can contain malicious text and should not be allowed to override the harness.

The deep dive's discussion of conversation tokenization reinforces this: roles are not abstract concepts floating above the model; they become tokens in a serialized prompt ([Deep Dive, around 01:05:03](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3903s)). If a harness collapses everything into one undifferentiated blob, it gives up one of the main ways chat models were trained to interpret priority and authorship.

Practical prompt boundaries include:

- XML-like tags for retrieved documents.
- Explicit source IDs.
- Separate tool-result messages.
- System-level rules outside user-editable fields.
- Clear "task" and "evidence" sections.
- Output schemas separated from examples.

The point is not that the model literally parses XML like a compiler. The point is that clear structure makes the intended continuation easier.

A structured prompt makes these boundaries concrete. The instruction is separate from the evidence, retrieved documents are wrapped in tags with source IDs, one example shows the desired shape, and the output contract is stated explicitly:

```text
System: Answer only from the documents. Cite the source ID. If the
documents do not contain the answer, reply exactly: NOT_FOUND.

<documents>
  <doc id="d1">Refunds are issued within 14 days of delivery.</doc>
  <doc id="d2">Gift cards are non-refundable.</doc>
</documents>

Example:
Question: Can I return a gift card?
Answer: No. Gift cards are non-refundable. [d2]

Question: How long do I have to request a refund?
Answer:
```

The model fills in the final `Answer:` line. Because the data is fenced and the contract is explicit, a document that says "ignore previous instructions" reads as evidence to quote, not as a command to obey.

## Few-Shot Learning

Few-shot examples work because the model is good at continuing patterns. If the context contains several examples of input-to-output mapping, the model can often continue with the same mapping for a new input. This is especially useful for formatting, classification, extraction, and domain-specific style.

Examples cost tokens, so they should be chosen carefully. A harness can retrieve examples dynamically based on task type or failure mode. It can also replace many examples with a validated structured schema when the output format is the main concern.

Few-shot prompting is especially useful when the task is not easily specified in rules. For example:

- classify support tickets into company-specific categories,
- rewrite rough notes into a particular internal tone,
- extract fields from messy documents,
- map natural language requests into tool calls,
- or show how to handle "not enough information."

But examples can also overfit the context. If all examples are positive, the model may assume the new case must also be positive. If examples use outdated policy, the model may continue that policy. If examples contain accidental formatting quirks, the model may copy them.

Treat examples as data dependencies. Version them, review them, and test them.

## Chain-of-Thought and Reasoning Prompts

Chain-of-thought prompting shows that large models can improve on multi-step reasoning tasks when prompted to generate intermediate reasoning steps ([Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://arxiv.org/abs/2201.11903)). The harness-level lesson is not simply "ask the model to think step by step." The deeper lesson is that task decomposition can help.

The limits matter. Chain-of-thought gains depend on model scale, task type, prompt design, and decoding. Smaller or poorly post-trained models may not benefit. Visible reasoning text is also not guaranteed to be faithful to the model's actual internal computation; it is an output artifact that may help, mislead, or rationalize.

One related technique is self-consistency: sample several reasoning paths and choose the most consistent answer rather than trusting the first greedy path ([Self-Consistency Improves Chain of Thought Reasoning in Language Models](https://arxiv.org/abs/2203.11171)). This can improve reasoning benchmarks, but it multiplies cost and still needs a reliable way to select or verify answers.

In production systems, visible reasoning may be inappropriate, too verbose, or unavailable. A harness can still support decomposition through:

- Planning fields.
- Scratchpads hidden from the end user.
- Tool loops.
- Checklists.
- Subtasks delegated to smaller calls.
- Verification passes.

The point is to give the system room to do intermediate work without confusing intermediate text with final output.

## Reasoning Models and Test-Time Compute

Chain-of-thought began as a prompting trick. It has since become a training target. *Reasoning models* are post-trained, often with reinforcement learning on verifiable rewards (see [Chapter 7](./07-post-training.md)), to generate long internal reasoning before answering. Instead of the harness telling the model to "think step by step," the model has learned to spend extra tokens on intermediate work when a problem is hard. DeepSeek-R1 documented this pattern openly, showing that strong reasoning behavior can be elicited largely through RL on checkable problems ([DeepSeek-R1](https://arxiv.org/abs/2501.12948)).

The underlying idea is *test-time compute*: spending more tokens, and therefore more time and money, at inference to improve hard answers. This is a different scaling axis from the training-time scaling of [Chapter 5](./05-training-data-and-scaling.md), and it changes several harness assumptions:

- **Do not hand-prompt reasoning the model already does.** Forcing verbose chain-of-thought onto a reasoning model can waste tokens or conflict with its trained behavior. Follow the provider's guidance for that model.
- **Reasoning tokens are real cost and latency.** A reasoning model can emit thousands of hidden tokens before its first visible word. Budget for it, and expose a reasoning-effort control to the user when the model offers one.
- **The reasoning trace may be hidden, summarized, or unfaithful.** Some providers do not return the raw chain. Treat any exposed reasoning as a debugging aid, not a verified explanation, exactly as [Chapter 10](./10-knowledge-hallucination-uncertainty.md) warns about self-reported confidence.
- **Match the model to the task.** Reasoning models help on math, code, planning, and multi-step analysis. For simple extraction, formatting, or classification, a non-reasoning model is usually faster and cheaper. Route accordingly (see [Chapter 6](./06-inference-and-sampling.md)).

Reasoning models do not remove the need for tools, retrieval, or verification. A longer internal monologue is still ungrounded generation. It can reason more carefully over supplied evidence, but it cannot manufacture facts it was never given.

## Prompting for Tool Use

Tool-use prompting is different from ordinary question answering. The model must decide whether it needs external information, choose the right tool, fill arguments, interpret the observation, and continue. Karpathy's intro uses browser and image-generation examples to show that modern assistants often rely on tools rather than only "thinking in their head" ([Intro to LLMs, around 00:28:20](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1700s), [00:32:06](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1926s)).

Prompts for tool use should clarify:

- when to use the tool,
- when not to use it,
- what each argument means,
- what the tool cannot do,
- what to do when the tool fails,
- and how to report results.

The model should not have to infer all of this from a function name.

## Prompt Injection as Context Confusion

Prompt injection is not magic. It is a context-boundary failure. Untrusted content contains text that looks like instructions, and the model is asked to condition on it. If the harness does not preserve priority and boundaries, the model may follow the wrong text.

Examples:

- A retrieved web page says to ignore previous instructions.
- A user-uploaded document contains hidden assistant-facing commands.
- A tool result includes text that looks like a system message.
- An image contains adversarial text that the model reads through OCR or vision.

The mitigation is not only "write a stronger system prompt." The harness should constrain tools, delimit untrusted content, validate actions, and avoid giving untrusted text direct authority over side effects.

## Prompt Limits

Prompts are not durable memory. They are per-call context. If an instruction is omitted from a later call, the model may not follow it. If a summary compresses away a constraint, the constraint is gone. If old context contradicts new instructions, behavior may degrade.

This is why long-running agents need explicit state outside the prompt: files, databases, task plans, traces, and memory stores. Prompting can present the relevant slice of that state to the model, but it should not be the only place the state exists.

## Key Takeaways

- Prompting shapes the continuation the model is likely to produce.
- In-context learning lets examples influence behavior without changing weights.
- Chain-of-thought demonstrates the value of intermediate decomposition, but harnesses should control how reasoning is represented.
- Prompts are runtime context, not durable state.
