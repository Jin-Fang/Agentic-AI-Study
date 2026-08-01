# Preface

## Why This Book

Large language models are easy to call through an API, but a chat interface hides the mechanisms that shape their behavior. Tokenization changes what the model receives. Training determines what patterns are stored in its parameters. A finite context limits what can influence a response. Decoding turns next-token probabilities into generated text. Without a working model of these mechanisms, it is easy to mistake fluent output for current knowledge, reliable reasoning, or verified fact.

This book explains those mechanisms and the boundaries they create. Its purpose is not to make every model response predictable. It is to make model behavior less mysterious and to give readers a precise vocabulary for reasoning about it.

## Goals and Audience

This book is for software engineers and technical readers who use large language models. It follows an engineering-oriented path through LLM fundamentals: tokens, next-token prediction, Transformer attention, training data and scaling, inference and decoding, post-training, prompting, context, knowledge limits, retrieval, tool calls, and evaluation.

By the end, readers should be able to explain model behavior in terms of tokens, training, context, decoding, and external evidence. They should also be able to distinguish a property of the model from a property of the application around it.

## Source Material

The primary teaching material is Andrej Karpathy's [Intro to Large Language Models](https://www.youtube.com/watch?v=zjkBMFhNj_g) and [Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI). The first lecture frames an LLM as two artifacts: parameters and the code that runs them. The second expands this picture to cover data, tokenization, training, inference, post-training, and practical mental models. This book turns those lectures into a written sequence and adds references to foundational papers where they anchor specific concepts.

## Prerequisites and Non-Goals

Readers should be comfortable with basic software engineering ideas such as APIs, tests, and logs. No prior deep-learning mathematics is required. When mathematics is useful, the book introduces only what is needed to understand the mechanism and its consequences.

This book does not teach readers how to train a frontier model, compare every current model provider, or survey every alignment method. Those targets change quickly or require substantially more depth. The focus here is a durable foundation for understanding the models that engineers and technical readers encounter in practice.

## Stable Properties of Language Models

Several model-side facts organize the chapters that follow:

- A language model receives and produces tokens rather than words or meanings directly.
- Its context is finite and is not persistent memory.
- Knowledge learned during training is distributed through parameters; those parameters are not a current, authoritative database.
- Decoding rules select from next-token probabilities, so the way generation is configured is part of the resulting behavior.

Later chapters refine these statements, show where their simple formulations break down, and explain how external evidence can enter a model's context without becoming knowledge stored in its parameters.

## Companion Book

The companion book, [Agent Harness: A Practitioner's Textbook](../agent-harness/), covers the systems built around a model, including context management, tools, sandboxing, workflow patterns, and evaluation. This book establishes the model mechanisms and behavioral boundaries that those system designs must account for. Readers can use either book independently and follow the companion links when a topic crosses that boundary.

For the chapter map and suggested reading path for this book, see the [README](./README.md).
