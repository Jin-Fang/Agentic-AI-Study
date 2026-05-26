# 素材映射

这份表把本书主要知识点映射到两期源讲座。时间点是近似值，因为原始素材来自 YouTube 自动字幕。

## Intro to Large Language Models

| 时间点 | 主题 | 使用章节 |
|--------|------|----------|
| [00:00:24](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=24s) | “两个文件”：参数和运行参数的代码 | 第 1、14 章 |
| [00:01:35](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=95s) | 参数作为磁盘上的权重；运行时代码执行模型 | 第 1、6 章 |
| [00:03:59](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=239s) | 参数来自训练，而不是人工编程 | 第 3、5 章 |
| [00:05:16](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=316s) | 大规模 GPU 训练和昂贵参数生产 | 第 5、6 章 |
| [00:10:04](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=604s) | 幻觉例子：流畅文本可能是错的 | 第 10 章 |
| [00:11:40](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=700s) | Transformer 神经网络架构 | 第 4 章 |
| [00:14:29](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=869s) | 预训练之后的 fine-tuning | 第 7 章 |
| [00:18:01](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1081s) | 两阶段框架：pretraining 和 fine-tuning | 第 3、7 章 |
| [00:22:11](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1331s) | Reinforcement learning from human feedback | 第 7 章 |
| [00:28:20](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1700s) | 工具使用，包括浏览器类工具 | 第 12 章 |
| [00:32:42](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=1962s) | Context window 是有限工作上下文 | 第 9 章 |
| [00:33:41](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2021s) | 能看图、生成图的多模态系统 | 第 2、14 章 |
| [00:41:33](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2493s) | RAG 和工具增强 | 第 11、12 章 |
| [00:46:16](https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2776s) | Jailbreak attacks 与 safety/refusal 行为 | 第 7、10、12 章 |

## Deep Dive into LLMs like ChatGPT

| 时间点 | 主题 | 使用章节 |
|--------|------|----------|
| [00:00:28](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=28s) | 聊天文本框背后是什么 | 第 1、14 章 |
| [00:01:28](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=88s) | 数据集构建与 FineWeb 示例 | 第 5 章 |
| [00:03:42](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=222s) | Web 数据过滤和处理 | 第 5 章 |
| [00:04:54](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=294s) | 语言分类与过滤 | 第 5 章 |
| [00:12:07](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=727s) | Tokens 和 tokenization | 第 2 章 |
| [00:14:34](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=874s) | 数据集变成很长的 token 序列 | 第 2、3 章 |
| [00:15:36](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=936s) | 在 token window 上训练 | 第 3 章 |
| [00:23:24](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1404s) | Transformer 是 LLM 使用的神经网络 | 第 4 章 |
| [00:24:29](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1469s) | Transformer 中的 attention block | 第 4 章 |
| [00:26:12](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1572s) | 训练后的 inference | 第 6 章 |
| [00:35:58](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=2158s) | Loss 作为训练信号 | 第 3 章 |
| [00:40:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=2411s) | GPU 成本和 practical constraints | 第 5、6 章 |
| [01:05:03](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3903s) | 对话/chat format 的 tokenization | 第 2、8 章 |
| [01:25:07](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=5107s) | 现代 assistant 的工具使用 | 第 12 章 |
| [01:33:39](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=5619s) | 通过工具弥补模型限制 | 第 11、12 章 |
| [02:51:20](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10280s) | RLHF 和 reinforcement learning 框架 | 第 7 章 |
| [02:52:39](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10359s) | Reward model 是独立神经网络 | 第 7、13 章 |
| [03:00:54](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10854s) | Reward model 是人类偏好的有损模拟 | 第 7、13 章 |
| [03:04:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11051s) | Reward hacking 与过度优化 proxy 的限制 | 第 7、13 章 |
| [03:09:24](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11364s) | 把模型当工具使用，不要完全信任 | 第 10、14 章 |
| [03:09:57](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11397s) | 音频和图片上的多模态模型 | 第 2、14 章 |
| [03:11:58](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11518s) | 长运行 agent 和人类监督 | 第 12、14 章 |

