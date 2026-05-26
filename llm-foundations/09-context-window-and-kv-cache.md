# Chapter 9: Context Windows and KV Cache

The context window is the maximum token sequence a model can condition on in one call. Karpathy describes the context window as the model's working context: the text it can currently see while generating ([Intro to LLMs, around 00:32:42](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1962s)). It is tempting to treat a long context window as memory. That is a mistake.

Context is input. Memory is state that persists outside the call.

## Finite Context

Every token in the prompt competes for attention and budget. System instructions, developer instructions, user messages, retrieved documents, tool outputs, examples, and summaries all share the same window. When the window fills, something must be omitted or compressed.

The failure mode is not only hard overflow. Performance can degrade before the window is full. Important constraints may be far from the generation point. Distracting text may receive attention. Summaries may omit details. Retrieved documents may introduce conflicting claims.

Harness design should therefore treat context as a scarce resource.

Karpathy calls the context window a finite, precious resource and connects it to the information the model can use to perform the task ([Intro to LLMs, around 00:32:42](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1962s), [00:44:38](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2678s)). This is the bridge from model mechanics to context engineering. If information is not in the context or available through a tool, the model must rely on parameters or guesswork.

The finite-context constraint creates a design question for every piece of information:

- Does this belong in the prompt now?
- Should it be retrieved only if needed?
- Should it be summarized?
- Should it be stored externally and referenced by ID?
- Should it be checked by a tool instead of read by the model?

Context windows make these questions unavoidable.

## KV Cache

During inference, Transformer attention produces key and value vectors for tokens. Systems cache these vectors so generation can reuse previous computation instead of recomputing the whole prefix every time. This is the KV cache.

The KV cache is an inference optimization, not semantic memory. It helps the model continue the current sequence efficiently. It does not decide what facts matter, does not update long-term state, and does not solve context pollution.

For harness engineers, KV cache matters operationally because long prompts and long outputs consume memory and affect latency. Reusing stable prefixes can improve performance, but stale or bloated prefixes still hurt model behavior.

## Working Memory vs Long-Term Memory

The context window is working memory. Long-term memory must live elsewhere. Karpathy mentions memory and computational tools as augmentations that can help models solve tasks beyond what fits naturally in context ([Intro to LLMs, around 00:42:46](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2566s)). A harness turns that idea into concrete infrastructure.

Long-term memory may be:

- a user profile,
- a vector index,
- a task database,
- notes written to files,
- conversation summaries,
- a repository checkout,
- a browser session,
- or structured state in a workflow engine.

The model reads slices of that memory when needed. It should not be expected to carry all of it in the prompt.

## Context Selection

A harness needs a context-selection policy. For each model call, it chooses what to include:

- the current user request,
- durable task state,
- relevant prior decisions,
- tool availability,
- recent observations,
- retrieved documents,
- examples,
- and output constraints.

Selection is often more important than compression. A short prompt with exactly the right file diff and failing test can outperform a long prompt containing an entire project history.

## Context Rot

As tasks get longer, the context often accumulates irrelevant material: old tool outputs, failed plans, duplicate logs, stale assumptions, and summaries of summaries. This is context rot. The model may spend attention on text that no longer represents the current task.

Good harnesses fight context rot by:

- Keeping a structured task state outside the model.
- Summarizing with explicit constraints and open questions.
- Dropping tool outputs after extracting durable facts.
- Storing large artifacts by handle.
- Rehydrating only relevant slices for each call.
- Separating user-provided content from system instructions.

Another useful rule: do not keep raw tool outputs after their information has been extracted. A 5,000-line log should become "test `x` fails with assertion `y` after call `z`" plus a handle to the full log. The model can request the full log later if needed.

## Context as a Security Boundary

Context is not only a memory budget. It is also a trust boundary. A model may attend to anything in its prompt, including malicious instructions embedded in retrieved pages or documents. As context grows, the attack surface grows.

For harnesses, this means context admission should be permissioned and labeled:

- Do not retrieve documents the user is not allowed to see.
- Mark untrusted content as data.
- Keep tool instructions outside retrieved content.
- Avoid pasting secrets unless absolutely required.
- Prefer handles and scoped tools over raw sensitive context.

Long context is useful, but clean context is more useful.

## Long-Context Models

Long-context models reduce pressure but do not remove the need for context engineering. More room can support larger documents, richer traces, and fewer compactions. It can also encourage careless dumping.

Long context also does not mean uniform use of every token. *Lost in the Middle* showed that models can be much better at using relevant information near the beginning or end of the input than information placed in the middle ([Lost in the Middle](https://arxiv.org/abs/2307.03172)). Different models and context lengths vary, but the lesson is stable: "included somewhere" is not the same as "usable."

For harnesses, evidence placement is a design choice. Put the current task, critical constraints, and decisive evidence where the model is likely to use them. If a long document must be included, consider section summaries, targeted retrieval, citations, and follow-up search instead of assuming the full window will be read with equal reliability.

Measure long-context workflows with realistic tasks. Ask whether the additional context improves success rate, reduces retries, or merely increases cost. Sometimes a search tool plus a small context beats a giant prompt.

## Key Takeaways

- The context window is finite input, not durable memory.
- KV cache accelerates inference but does not solve semantic state.
- Context rot is a major failure mode in long-running workflows.
- Harnesses should externalize state and feed the model relevant slices.
