# Chapter 2: Tokenization

Before a model can process text, the text is converted into tokens. Tokens may be whole words, word fragments, punctuation, whitespace patterns, bytes, or other subword units. The model does not receive "hello world" as a human sentence. It receives a sequence of token IDs, each pointing into a vocabulary.

Karpathy's deep dive spends time with tokenizer examples because they explain many practical surprises: spacing changes token IDs, capitalization can change segmentation, and rare strings may be broken into many pieces ([Deep Dive, around 00:12:07](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=727s)). For harness work, tokenization is not trivia. It determines cost, latency, context capacity, and sometimes model behavior.

## Why Subword Tokens Exist

A vocabulary of whole words is brittle. New names, code identifiers, URLs, chemical strings, emojis, and multilingual text would constantly fall outside the vocabulary. A character-only vocabulary avoids unknown words but makes sequences very long.

Subword tokenization is the compromise. Byte Pair Encoding and related methods represent frequent strings as larger tokens and rare strings as combinations of smaller tokens. Sennrich, Haddow, and Birch introduced subword units for open-vocabulary neural machine translation, showing that rare and unseen words can be handled by decomposing them into pieces ([Neural Machine Translation of Rare Words with Subword Units](https://arxiv.org/abs/1508.07909)).

Modern LLM tokenizers use this broad idea at massive scale. The exact tokenizer differs by model family, so the same text may consume different token counts in different systems.

## Token Budgets Are Not Word Budgets

Harnesses often reason in terms of "documents," "messages," or "paragraphs," but the model is bounded by tokens. English prose may average roughly a few characters per token, but code, tables, JSON, base64, logs, CJK text, and URLs can behave very differently.

This creates practical design rules:

- Count tokens before sending large contexts.
- Truncate by semantic unit, not by raw character count.
- Avoid dumping logs, tables, or minified JSON directly into prompts.
- Prefer tools that search, filter, and summarize before returning data.
- Test multilingual and code-heavy inputs separately.

A harness that only counts files or characters will eventually overflow context or waste budget.

## Whitespace and Formatting Matter

Tokenizers often encode leading spaces as part of a token. This is why `"world"` and `" world"` can be different tokens. In prose this rarely matters visibly. In code, indentation, newlines, and punctuation create token patterns the model has learned from training data.

This helps explain why models are sensitive to prompt formatting. A prompt written as a clean Markdown task with examples may tokenize into familiar patterns. A dense blob of escaped JSON may still be parseable, but it is farther from the distribution where the model learned to follow instructions naturally.

For tool design, this matters. If the model must emit structured data, choose formats that are both machine-parseable and natural for the model. A small schema with clear fields is easier than deeply nested escaped code inside JSON strings.

Karpathy demonstrates this with tokenizer examples: capitalized and lowercase variants, leading spaces, and small punctuation changes can produce different token sequences ([Deep Dive, around 00:12:33](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=753s)). The exact token IDs are less important than the operational fact: the model's input is a discrete encoded stream, and tiny textual changes can alter that stream.

This is one reason prompt templates should be treated as code. A change that looks cosmetic in Markdown can change token boundaries, shift instructions farther from the answer, or alter the pattern the model is expected to continue.

## Conversation Tokenization

Chat models do not receive a mystical "conversation" object. The conversation is serialized into tokens. Roles such as system, user, assistant, and tool must become a concrete token sequence using a chat template. Karpathy returns to tokenization later in the deep dive to show that conversations themselves are tokenized, not just standalone strings ([Deep Dive, around 01:05:03](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3903s)).

This detail matters for harness design:

- The model learns the provider's chat format during post-training.
- Role boundaries must be preserved when constructing prompts.
- Tool results should be clearly delimited from user instructions.
- Summaries inserted as assistant messages may be interpreted differently from summaries inserted as system or developer context.
- Prompt injection attacks often work by smuggling instruction-like text into data positions.

If a harness builds conversation strings manually, it should understand the target model's expected template. Otherwise, it may accidentally create a distribution shift: the model sees a sequence that looks unlike the conversations it was trained to follow.

## Special Tokens and Tool Protocols

Modern assistants often use special tokens or structured templates for tool calls, refusal behavior, and multimodal inputs. Even when an API hides these details, the model still receives an encoded representation. A tool call may be represented as JSON-like text, special message metadata, or a provider-specific internal format.

This means that a harness is not just passing words to a model. It is building an encoded protocol. The protocol must carry:

- who said what,
- what data came from tools,
- what output shape is expected,
- what actions are available,
- which prior messages are still relevant,
- and which content is untrusted.

Poor serialization can erase these boundaries.

## Multimodal Tokenization

The same token-machine frame extends beyond text. Near the end of the deep dive, Karpathy describes audio and images as inputs that can be tokenized or represented in token-like units: audio can be chunked into representational pieces, and images can be represented with patches ([Deep Dive, around 03:09:57](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11397s)). The implementation details vary by model, but the harness consequence is stable: multimodal input still consumes budget and still needs boundaries.

For example, an image-capable assistant may receive a screenshot as visual tokens plus the user's instruction as text tokens. A harness should not assume the model "sees" like a person. It receives an encoded representation with limits, resolution tradeoffs, and possible blind spots. For computer-use agents, screenshots, DOM text, accessibility trees, and OCR are different encodings of the environment. Each one changes what the model can attend to.

## Tokenization Failure Modes

Common failures include:

- A prompt fits in characters but overflows in tokens.
- A retrieved code block consumes far more context than expected.
- A non-English document is truncated more aggressively than English documents.
- A JSON tool result includes escaped text that is expensive and hard to read.
- A summary deletes role boundaries and causes the model to treat data as instruction.
- A screenshot is downsampled or encoded in a way that hides small but important UI text.

These are not model-intelligence failures. They are representation failures.

## Tokenization and Context Engineering

Every tool result competes for the same token budget as instructions, examples, retrieved documents, previous turns, and intermediate reasoning. Tokenization turns context engineering into an accounting problem.

The harness should make token cost visible:

- Log input and output tokens by step.
- Track which tools produce the largest context payloads.
- Provide concise and detailed response modes.
- Use IDs and handles for large artifacts instead of pasting full content repeatedly.
- Keep source text in files or databases and retrieve slices when needed.

Tokenization is the first reason a harness cannot treat context as an infinite scratchpad.

## Key Takeaways

- Models process token IDs, not raw human words.
- Subword tokenization lets models handle rare strings, but creates surprising token counts.
- Formatting, whitespace, code, and multilingual text can materially change token use.
- Harnesses should count, budget, truncate, and retrieve at the token level.
