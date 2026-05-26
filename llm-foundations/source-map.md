# Source Map

This map links the book's main concepts to the two source lectures. The timestamps are approximate because the source material came from auto-generated YouTube subtitles.

## Intro to Large Language Models

| Timestamp | Topic | Used In |
|-----------|-------|---------|
| [00:00:24](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=24s) | "Two files" framing: parameters plus code to run them | Chapters 1, 14 |
| [00:01:35](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=95s) | Parameters as weights stored on disk; runtime code executes the model | Chapters 1, 6 |
| [00:03:59](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=239s) | Where parameters come from: training rather than manual programming | Chapters 3, 5 |
| [00:05:16](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=316s) | Large GPU training runs and expensive parameter production | Chapters 5, 6 |
| [00:10:04](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=604s) | Hallucination examples and why fluent text can be wrong | Chapter 10 |
| [00:11:40](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=700s) | Transformer neural network architecture | Chapter 4 |
| [00:14:29](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=869s) | Fine-tuning after pretraining | Chapter 7 |
| [00:18:01](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1081s) | Two-stage framing: pretraining and fine-tuning | Chapters 3, 7 |
| [00:22:11](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1331s) | Reinforcement learning from human feedback | Chapter 7 |
| [00:28:20](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1700s) | Tool use, including browser-like tools | Chapter 12 |
| [00:32:42](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1962s) | Context window as finite working context | Chapter 9 |
| [00:33:41](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2021s) | Multimodal systems that see and generate images | Chapters 2, 14 |
| [00:41:33](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2493s) | Retrieval-augmented generation and tool augmentation | Chapters 11, 12 |
| [00:46:16](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2776s) | Jailbreak attacks and safety/refusal behavior | Chapters 7, 10, 12 |

## Deep Dive into LLMs like ChatGPT

| Timestamp | Topic | Used In |
|-----------|-------|---------|
| [00:00:28](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=28s) | What is behind the chat text box | Chapters 1, 14 |
| [00:01:28](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=88s) | Dataset construction and FineWeb as an example | Chapter 5 |
| [00:03:42](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=222s) | Web data filtering and processing | Chapter 5 |
| [00:04:54](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=294s) | Language classification and filtering | Chapter 5 |
| [00:12:07](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=727s) | Tokens and tokenization | Chapter 2 |
| [00:14:34](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=874s) | Dataset becomes a long token sequence | Chapters 2, 3 |
| [00:15:36](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=936s) | Training on windows of tokens | Chapter 3 |
| [00:23:24](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1404s) | Transformer as the neural network used for LLMs | Chapter 4 |
| [00:24:29](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1469s) | Attention block in the Transformer | Chapter 4 |
| [00:26:12](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1572s) | Inference after training | Chapter 6 |
| [00:35:58](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=2158s) | Loss as a training signal | Chapter 3 |
| [00:40:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=2411s) | GPU cost and practical inference/training constraints | Chapters 5, 6 |
| [01:05:03](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3903s) | Tokenization of conversations/chat format | Chapters 2, 8 |
| [01:25:07](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=5107s) | Tool use in modern assistants | Chapter 12 |
| [01:33:39](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=5619s) | Introducing tools to compensate for model limits | Chapters 11, 12 |
| [02:51:20](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10280s) | RLHF and reinforcement learning framing | Chapter 7 |
| [02:52:39](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10359s) | Reward model as a separate neural network | Chapters 7, 13 |
| [03:00:54](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10854s) | Reward model as a lossy simulation of human preference | Chapters 7, 13 |
| [03:04:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11051s) | Reward hacking and limits of optimizing a reward model | Chapters 7, 13 |
| [03:09:24](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11364s) | Use models as tools, not as fully trusted authorities | Chapters 10, 14 |
| [03:09:57](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11397s) | Multimodal models over audio and images | Chapters 2, 14 |
| [03:11:58](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11518s) | Long-running agents and humans as supervisors | Chapters 12, 14 |

