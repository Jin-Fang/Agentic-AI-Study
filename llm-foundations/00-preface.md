# Preface

Large language models are easy to use and hard to operate. A chat box hides the machinery: tokenization, pretraining, transformer inference, sampling, post-training, context windows, retrieval, and tool use. For a harness engineer, that hidden machinery becomes practical surface area. It determines what should live in the prompt, what should live in a tool, what should be retrieved, what should be verified, and what should never be delegated to the model at all.

This book is written for that engineer.

The goal is not to derive the Transformer from first principles. The goal is to build a reliable operational model. When an agent forgets an instruction, invents a citation, chooses a bad tool, overreacts to irrelevant retrieved text, or produces a different answer after a small prompt change, the harness engineer should have a vocabulary for what happened and a set of concrete controls to try.

The primary teaching material is Andrej Karpathy's [Intro to Large Language Models](https://www.youtube.com/watch?v=zjkBMFhNj_g) and [Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI). The first lecture frames an LLM as two artifacts: parameters and code that runs them. The second expands this into data, tokenization, training, inference, post-training, and practical mental models. This book turns those lectures into a written, harness-oriented sequence and adds references to foundational papers where they anchor specific concepts.

## What This Book Assumes

You should be comfortable with software engineering ideas such as APIs, state, tests, logs, caching, and permissions. You do not need to know deep learning math. When a mathematical idea matters for engineering, the book explains the operational consequence instead of treating the equation as the point.

## What This Book Does Not Do

This book does not teach how to train a frontier model. It does not compare every current model provider. It does not provide a survey of every alignment method. The field changes too quickly for that to be the right shape.

Instead, it focuses on invariants that matter for harness work:

- A language model reads and writes tokens.
- The context window is finite, expensive, and not the same thing as memory.
- Model knowledge is compressed into parameters and should not be treated as a database.
- Sampling is part of behavior, not an implementation detail.
- Retrieval and tools are harness responsibilities.
- Evaluation must measure the combined model-harness system.

## Relationship to Agent Harness

The companion book, [Agent Harness: A Practitioner's Textbook](../agent-harness/), starts from the outside of the model: tools, context engineering, sandboxing, workflow patterns, and evals. This book starts from the inside edge: what the model is doing when the harness calls it.

The two books should be read together. Harness engineering without LLM fundamentals becomes cargo-cult prompt design. LLM fundamentals without harness engineering stops at a model that can talk but cannot safely do work.

