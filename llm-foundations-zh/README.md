# LLM 基础：面向 Harness Engineering 的实践者教材

*这是一份面向 harness engineer 的大语言模型基础教材。它不把重点放在训练前沿模型，而是帮助工程师准确理解模型能力、限制，以及模型周围系统应该承担的责任。*

English version: [LLM Foundations for Harness Engineering](../llm-foundations/)

---

## 为什么需要这本书

Harness engineering 的起点，是看清原始模型在哪里停止工作。模型预测 token；harness 则提供工具、记忆、状态、权限、检索、评估，以及通往真实世界效果的受控路径。要把这套外围系统设计好，工程师需要对模型本身建立足够准确的心智模型。

这本书不是机器学习理论课。它服务的是这些工程问题：prompt 为什么会失效？context window 为什么不是长期记忆？RAG 为什么有时减少幻觉、有时制造噪声？工具调用为什么必须由 harness 管？为什么一次模型升级可能让已有 workflow 退化？

主要素材来自 Andrej Karpathy 的两期 YouTube 讲座：

- [Intro to Large Language Models](https://www.youtube.com/watch?v=zjkBMFhNj_g)
- [Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI)

正文会在关键知识点旁加入视频时间点和基础论文引用。

---

## 章节

| 章节 | 标题 | 重点 |
|------|------|------|
| [前言](./00-preface.md) | 前言 | 本书范围、读者定位，以及和 harness engineering 的关系 |
| [第 1 章](./01-llm-as-token-machine.md) | 把 LLM 看成 token 机器 | 模型是 token 输入、token 输出的组件；harness 从哪里开始 |
| [第 2 章](./02-tokenization.md) | Tokenization | 文本如何变成 token；subword、预算、chat template、多模态表示 |
| [第 3 章](./03-next-token-prediction.md) | Next-Token Prediction | 预训练目标、训练循环、loss，以及为什么简单目标能产生复杂能力 |
| [第 4 章](./04-transformer-attention.md) | Transformer 与 Attention | embedding、attention、MLP、层结构和长上下文的工程直觉 |
| [第 5 章](./05-training-data-and-scaling.md) | 数据与 Scaling | Web 数据、过滤、去重、模型规模、算力和数据新鲜度 |
| [第 6 章](./06-inference-and-sampling.md) | Inference 与 Sampling | logits、temperature、top-p、停止条件、延迟和模型路由 |
| [第 7 章](./07-post-training.md) | Post-Training | SFT、RLHF、reward model、reward hacking 和 assistant 行为 |
| [第 8 章](./08-prompting-and-in-context-learning.md) | Prompting 与 In-Context Learning | 指令、样例、chain-of-thought、工具提示和 prompt injection |
| [第 9 章](./09-context-window-and-kv-cache.md) | Context Window 与 KV Cache | 有限上下文、KV cache、工作记忆、长期记忆和 context rot |
| [第 10 章](./10-knowledge-hallucination-uncertainty.md) | 知识、幻觉与不确定性 | 参数化知识、grounding、引用纪律、安全和 jailbreak |
| [第 11 章](./11-embeddings-and-retrieval.md) | Embeddings 与 Retrieval | 向量检索、RAG pipeline、chunking、reranking 和 context pollution |
| [第 12 章](./12-reasoning-tools-and-agents.md) | 推理、工具与 Agent | 工具调用协议、agent loop、长运行任务和人工监督 |
| [第 13 章](./13-evaluation-for-llm-behavior.md) | 评估 LLM 行为 | golden tasks、trace、grader、reward hacking 和回归纪律 |
| [第 14 章](./14-operational-mental-model.md) | 操作性心智模型 | 从模型基础到 harness 设计决策的统一框架 |
| [素材映射](./source-map.md) | Source Map | 本书主要知识点对应的视频时间点 |
| [术语表](./glossary.md) | 术语表 | 全书关键术语 |
| [参考文献](./references.md) | 参考文献 | 视频、论文和补充材料 |

---

## 阅读建议

第 1-7 章先建立“模型是什么”的基础心智模型。第 8-14 章再讨论这些基础如何影响 harness 设计。

如果你已经在做 agent 或 coding assistant，最应该优先读第 6、9、10、11、12、13 章。
