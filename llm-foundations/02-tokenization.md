# Chapter 2: Tokenization

Before a language model can process text, a tokenizer converts the text into a sequence of integer token IDs. A token may correspond to a whole word, part of a word, punctuation, whitespace together with nearby characters, a byte, or another learned unit. The boundaries are properties of a particular tokenizer, not universal linguistic boundaries.

Karpathy spends time on tokenizer examples because they explain otherwise surprising behavior: leading spaces can change token IDs, capitalization can change segmentation, and rare strings can expand into many pieces ([Deep Dive, around 00:12:07](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=727s)). The direct result of tokenization is sequence length. That length then affects how much text fits in a context window and, depending on the model and service, how much computation, latency, or billed usage a request requires.

## Text to Token IDs

At a high level, the input path is:

```text
text → token pieces → token IDs → embedding vectors
```

The tokenizer performs the first two transformations. It segments text according to a fixed vocabulary and encoding rules, then looks up the integer ID assigned to each piece. The model uses those IDs to select rows from its learned embedding table. It operates on the resulting vectors, not directly on the original characters.

Decoding follows the reverse mapping: token IDs are mapped back to pieces and joined into text. This does not mean every tokenizer round-trips every input perfectly. Optional normalization may change the text before segmentation, and decoding may omit control tokens. Byte-level tokenizers can preserve ordinary input text exactly when their byte mapping and decoding rules are used consistently.

A tokenizer is part of a model's specification. Two models can assign different pieces, IDs, and sequence lengths to the same string. Token IDs therefore have meaning only with the matching tokenizer and vocabulary.

## Why Subword Tokens Exist

A whole-word vocabulary is brittle. Names, inflected words, code identifiers, URLs, scientific notation, emoji, and text from many languages would constantly produce unseen words. A character-only vocabulary can represent such inputs, but it usually creates much longer sequences and gives the model less opportunity to reuse frequent multi-character patterns as single units.

Subword tokenization is a compromise. Frequent strings can receive their own tokens, while less frequent strings are composed from smaller pieces. Sennrich, Haddow, and Birch showed how subword units could support open-vocabulary neural machine translation by decomposing rare and unseen words ([Neural Machine Translation of Rare Words with Subword Units](https://arxiv.org/abs/1508.07909)).

Byte Pair Encoding (BPE), WordPiece, and Unigram are related subword approaches, but they do not learn or segment text in exactly the same way. BPE training typically begins with a base inventory and repeatedly adds a token for a selected adjacent pair. The base inventory depends on the tokenizer: classical formulations may begin with characters or symbols, whereas **byte-level BPE** begins with a representation of bytes.

That distinction matters. A byte-level BPE tokenizer that retains the full byte alphabet can encode arbitrary Unicode text through its UTF-8 bytes, falling back to smaller byte units when no larger learned piece matches. It is not correct to claim that every BPE tokenizer starts from raw bytes or that every subword tokenizer is automatically free of unknown tokens. Other tokenizers may use an unknown token, character coverage rules, or a separate byte-fallback mechanism.

## How a Tokenizer Is Trained and Used

Tokenizer training happens before the tokenizer is used to encode model inputs. A representative text corpus is collected, and choices are made about normalization, whitespace handling, pre-tokenization, the base alphabet, special tokens, and vocabulary size. The training algorithm then learns a vocabulary and, depending on the method, merge rules or token scores. Once model training begins, this tokenizer is normally fixed so that each token ID continues to identify the same embedding row.

For BPE, training counts adjacent units and repeatedly adds selected merges until it reaches a target vocabulary or another stopping condition. Unigram tokenization instead starts with many candidate pieces, learns probabilities for them, and prunes the vocabulary while preserving likely segmentations. These procedures both produce subword vocabularies, but the resulting boundaries need not agree.

At encoding time, a tokenizer generally applies some version of these steps:

1. Normalize the text if the tokenizer defines a normalization rule.
2. Divide or mark the input according to its whitespace and pre-tokenization rules.
3. Segment it using the learned vocabulary and algorithm.
4. Replace each resulting piece with its vocabulary ID.
5. Add any special tokens required by the model's input format.

Implementations may combine or omit steps, so the tokenizer itself is the authority. Its decoder must also be used to interpret generated token IDs correctly.

## Reading Tokenization Examples

Token boundaries must be inspected with a specific tokenizer. The following are possible segmentations, not claims about every model:

| Text | One possible segmentation | What it illustrates |
|---|---|---|
| `world` versus ` world` | different pieces for the two forms | A leading space may be encoded with nearby text. |
| `unhappiness` | `un` + `happi` + `ness` | Familiar subword fragments can compose a less frequent word. |
| `HTTPResponse2` | a mixture of larger fragments and smaller pieces | Case changes, identifiers, and digits can shift boundaries. |
| `你好` | one piece, multiple character pieces, or byte fallback | Language coverage and the tokenizer's base units matter. |

Karpathy demonstrates the same principle with capitalization, leading spaces, and small punctuation changes ([Deep Dive, around 00:12:33](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=753s)). Newlines and indentation can likewise change the sequence produced for code. Debugging tools sometimes display artificial markers for spaces or bytes; those markers describe the tokenizer's internal representation and are not necessarily literal characters in the input.

Small formatting changes therefore can produce different token sequences. They do not guarantee a large behavioral change, but the model is receiving a different sequence of IDs.

## Token Counts Are Not Word Counts

A model's sequence limits are measured in tokens, not words, files, messages, or characters. A rough characters-per-token estimate can be useful for a quick approximation in familiar English prose, but it is not a reliable conversion rule.

Code, tables, numbers, URLs, repeated whitespace, uncommon symbols, and different writing systems can all segment differently. The result also depends on how well a language or text style was represented when the tokenizer was trained. It is therefore unsafe to infer that two passages with the same character or word count will occupy the same number of tokens.

For an exact count, encode the actual text with the tokenizer for the target model and count the returned IDs. A context window usually has to accommodate both the input and generated continuation; [Chapter 9](./09-context-window-and-kv-cache.md) explains that shared sequence limit in detail. Computation and pricing policies are model- and provider-specific consequences of these counts, not properties of tokenization alone.

Text token counts also cannot be used to estimate image, audio, or other multimodal inputs. Those inputs use model-specific encoders and accounting rules.

## Special Tokens and Chat Templates

Special tokens are vocabulary entries reserved for structural or control purposes. Depending on the model, they may mark the beginning or end of a sequence, separate documents, or delimit messages and roles. They are still token IDs, but their interpretation comes from the model's training format rather than from ordinary written language.

A chat API may accept a list of messages, but the model ultimately receives an encoded sequence. A **chat template** renders message roles and contents into the format expected by that model, often inserting special tokens and fixed separators. Assistant models learn these conventions during [post-training](./07-post-training.md).

Karpathy returns to tokenization later in the deep dive to show that a conversation, like any other model input, must be represented as tokens ([Deep Dive, around 01:05:03](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3903s)). The rendered template creates token overhead that is not visible in message content. Counting only the `content` fields—even with the correct text tokenizer—can therefore undercount a request. Exact accounting must use the target model's chat template together with its tokenizer; the format and overhead can change across model families or versions.

## Character-Level Capability Gaps

Tokenization does not present most text as one model position per character. A word may occupy one token, several subword tokens, or a sequence that falls back to characters or bytes. As a result, operations that require stable access to individual characters—counting letters, reversing an unfamiliar string, or tracking exact spelling—can be harder than their surface simplicity suggests.

This is a tendency, not an absolute inability. Models can learn spelling patterns, infer characters contained inside tokens, and sometimes solve these tasks correctly. Tokenization is nevertheless one reason the representation is poorly aligned with character-by-character operations. Karpathy uses spelling and letter-counting examples to illustrate this mismatch ([Deep Dive, around 02:01:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7271s)).

Numbers can also be split into variable-length pieces, but token boundaries are not a complete explanation for arithmetic errors. Training data, the next-token objective, limited learned algorithms, and the difficulty of carrying intermediate state can also contribute.

## Common Token-Counting Pitfalls

Several recurring mistakes follow directly from model-specific encoding:

- Estimating from words or characters and treating the estimate as an exact limit.
- Counting with a tokenizer from a different model family or tokenizer version.
- Counting message contents without applying the chat template and its special tokens.
- Measuring only the prompt even though generated tokens occupy part of the available sequence.
- Assuming prose, source code, URLs, and multilingual text have the same token density.
- Applying a text-token estimate to image, audio, or other multimodal input.

Truncation creates a related problem. A character slice may not correspond to the desired token budget, while a token slice can cut through a sentence or other meaningful unit after decoding. Token counts determine whether a sequence fits; they do not determine which content is semantically safe to remove.

## Key Takeaways

- A tokenizer maps text into model-specific token IDs; embedding lookup turns those IDs into the vectors processed by the model.
- Subword methods balance reusable frequent pieces against the ability to compose unfamiliar strings.
- BPE is a family of methods, and only byte-level variants necessarily begin from byte representations.
- Sequence length depends on the exact tokenizer, text, special tokens, and chat template—not on word count alone.
- Tokenization can make character-level operations less natural, but it is not the sole cause of every spelling or arithmetic error.
