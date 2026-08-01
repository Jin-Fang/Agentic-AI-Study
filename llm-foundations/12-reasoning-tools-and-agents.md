# Chapter 12: Reasoning, Tools, and Agents

An LLM can generate reasoning-like text, but a model call can use only the inputs it receives and cannot by itself cause effects in the world. Tools bridge that boundary: the model emits a representation of a requested operation, an external system performs the operation, and the result becomes new input to a later model call.

Karpathy's introduction discusses tool use and retrieval as ways to augment models beyond pure text generation ([Intro to LLMs, around 00:41:33](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2493s)). Research systems such as ReAct show how language models can alternate between reasoning, actions, and observations ([ReAct](https://arxiv.org/abs/2210.03629)). Toolformer explores training models to decide when and how to call APIs ([Toolformer](https://arxiv.org/abs/2302.04761)).

## Tool Calls Are Model Outputs

Tool use does not change the model's basic nature as a token generator. Given a context that describes available operations and their arguments, the model may generate ordinary text or a structured call representation. Even when constrained decoding guarantees a particular structure, generation still produces a proposed call rather than executing the operation.

This is why “the model can browse” is shorthand. A model does not independently open pages. An external runtime supplies a browser-like operation, executes a selected call, and encodes the resulting page content into a later context.

## A Minimal Call/Result Protocol

The logical protocol needs a call identifier, an operation name, arguments, and a result paired with the same identifier. For example:

```yaml
assistant_call:
  id: c1
  name: get_weather
  arguments:
    city: Paris
```

After an external system executes the operation, it can return:

```yaml
tool_result:
  call_id: c1
  content:
    temp_c: 17
    sky: clear
```

This is vendor-neutral notation for the protocol's external representation, not the literal wire format of every API. Providers may serialize calls and results as typed messages, JSON objects, special-token sequences, or other model-specific structures. Models learn the relevant call patterns during post-training; see [Chapter 7](./07-post-training.md).

A streamed, incomplete representation is not yet a complete call. Once complete, syntax validity, schema conformance, semantic correctness, and authorization are separate questions. Valid JSON can have the wrong fields; schema-conformant arguments can still name the wrong city; and a sensible request can still be forbidden. Only the external system can decide whether and how to execute it.

## The Minimal Agent Loop

A tool-using agent can be reduced to a short loop:

1. An external runtime gives the model the task context and descriptions of available operations.
2. The model generates either a response or a structured call.
3. If it is a call, the runtime decides whether to execute it.
4. The runtime returns the result as an observation in a new context.
5. The model continues until it produces a final response or the runtime stops the loop.

The observation does not update the model's parameters. It changes subsequent generation because it is added to the input context. A sequence of model calls plus external execution can therefore behave like an agent even though each individual model call remains conditional generation.

## What Tools Add

Different operations extend a model along different axes:

- **External knowledge** operations can supply retrieved or current information.
- **Exact computation** operations can perform calculations or repeatable transformations.
- **Environment interaction** operations can read files, open pages, or inspect other live state.
- **External-state operations** can create, update, or send something outside the model.
- **Generative operations** can produce artifacts in another modality.

Native multimodality is not itself a vision tool. A multimodal model may directly receive an encoded image as part of its input, while an external vision or OCR tool performs a separate operation and returns a textual or structured observation. In either case, the model receives a representation, not direct access to the world.

## Reasoning and Acting

Reasoning and acting play different roles. Reasoning-like computation can help select or sequence steps using the current context. An action can obtain information that was absent from that context or can request a change to external state. ReAct emphasizes the feedback pattern: reasoning informs an action, and the resulting observation informs what comes next.

The protocol should not be confused with a faithful chain-of-thought record. Some systems expose reasoning-like text, some keep intermediate reasoning hidden, and some return a short summary or plan. Those are different artifacts; a visible plan is not necessarily a transcript of the computation that produced the action. The reliably observable protocol boundary is the proposed action and the observation returned for it. Recording those two can help distinguish a poor call from a misleading or failed result without claiming access to the model's full reasoning process.

Reasoning models may spend additional test-time compute before responding or acting. That can improve how they use existing context, but it does not create new evidence, execute an operation, or provide persistent state between calls.

## The Model Boundary

Several limits follow directly from this loop:

- Emitting a call does not mean that the operation ran or succeeded.
- A model call does not naturally preserve task state for a later call; any continuity comes from context supplied again or state held externally.
- Tool results become input context and can be incomplete, incorrect, or adversarial. The model does not provide a reliable trust boundary between data and instructions; see [Chapter 8](./08-prompting-and-in-context-learning.md).
- Authorization and external side effects belong to the system that executes the call, not to the model that proposes it.

Those facts are the bridge from model foundations to system design. The companion *Agent Harness* covers [tool interfaces and the invocation lifecycle](../agent-harness/06-tools-invocation-lifecycle.md), [permissions and runtime enforcement](../agent-harness/07-sandboxing-runtime-enforcement.md), [durable state](../agent-harness/10-state-event-history-production-factors.md), [human supervision](../agent-harness/14-human-agent-interaction.md), and [computer use and multimodal agents](../agent-harness/15-computer-use-multimodal-agents.md).

## Key Takeaways

- A tool call is structured model output, not an executed action.
- A minimal agent loop alternates model generation with externally executed calls and returned observations.
- Reasoning can shape an action, while acting can add evidence or change external state.
- Execution, authorization, persistent state, and supervision exist outside the model.
