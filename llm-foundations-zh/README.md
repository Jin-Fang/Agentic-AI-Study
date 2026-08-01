# LLM 基础：面向 Harness Engineering 的实践者教材

*这是一份讲解大语言模型机制与行为边界的实践者教材。*

English version: [LLM Foundations for Harness Engineering](../llm-foundations/)

---

## 为什么需要这本书

大语言模型很容易调用，却不容易准确理解。聊天界面隐藏了影响输出的关键机制：tokenization、next-token prediction、Transformer inference、decoding、post-training 和有限的 context window。本书将这些机制逐一展开，并解释由此产生的实际边界。

这本书不是机器学习理论课，也不教授如何训练 frontier model。它面向需要准确理解 prompt、context、retrieval、sampling、tool call、hallucination 和 evaluation 的软件工程师与技术读者。当一个主题从模型行为进入系统设计时，正文会明确标出边界，并转介配套的 [Agent Harness](../agent-harness-zh/) 教材。

主要素材来自 Andrej Karpathy 的两期 YouTube 讲座：

- [Intro to Large Language Models](https://www.youtube.com/watch?v=zjkBMFhNj_g)
- [Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI)

正文会在关键知识点旁加入视频时间点和基础论文引用。

---

## 章节

| 章节 | 标题 | 重点 |
|------|------|------|
| [前言](./00-preface.md) | 前言 | 本书范围、读者、素材来源和配套教材 |
| [第 1 章](./01-llm-as-token-machine.md) | 把 LLM 看成 token 机器 | token 概率、参数、运行时、应用层和外部副作用 |
| [第 2 章](./02-tokenization.md) | Tokenization | tokenizer 训练与编码、subword、预算、chat template 和字符级能力缺口 |
| [第 3 章](./03-next-token-prediction.md) | Next-Token Prediction | 预训练目标、训练循环、loss，以及为什么它能产生广泛能力 |
| [第 4 章](./04-transformer-attention.md) | Transformer 与 Attention | decoder-only Transformer、self-attention、MLP、分布式表示和 attention 成本 |
| [第 5 章](./05-training-data-and-scaling.md) | 数据与 Scaling | 数据构造、覆盖、去重、scaling laws、算力权衡和 contamination |
| [第 6 章](./06-inference-and-sampling.md) | Inference 与 Sampling | logits、temperature、top-p、自回归循环、停止、约束式 decoding 和可重复性 |
| [第 7 章](./07-post-training.md) | Post-Training | SFT、交互约定、偏好优化、代理奖励、RLVR 和 PEFT |
| [第 8 章](./08-prompting-and-in-context-learning.md) | Prompting 与 In-Context Learning | 指令、示例、推理 prompt、tool-use prompting、prompt injection 和 prompting 边界 |
| [第 9 章](./09-context-window-and-kv-cache.md) | Context Window 与 KV Cache | prefill/decode、KV cache 机制、provider caching、长上下文可靠性和信任边界 |
| [第 10 章](./10-knowledge-hallucination-uncertainty.md) | 知识、幻觉与不确定性 | 参数化知识、错误答案模式、校准、认识论弃答、安全拒答和引用形幻觉 |
| [第 11 章](./11-embeddings-and-retrieval.md) | Embeddings 与 Retrieval | 检索 embedding、稠密与词法检索、最小 RAG、chunking、检索指标和 context pollution |
| [第 12 章](./12-reasoning-tools-and-agents.md) | 推理、工具与 Agent | 结构化工具调用、最小 agent loop、推理与行动，以及模型边界 |
| [第 13 章](./13-evaluation-for-llm-behavior.md) | 评估 LLM 行为 | benchmark、代表性任务、重复试验、grading、代理指标和系统边界 |
| [第 14 章](./14-operational-mental-model.md) | 操作性心智模型 | 紧凑的模型—系统责任边界与配套教材导读 |
| [素材映射](./source-map.md) | Source Map | 本书主要知识点对应的视频时间点 |
| [术语表](./glossary.md) | 术语表 | 全书关键术语 |
| [参考文献](./references.md) | 参考文献 | 视频、论文和补充材料 |

---

## 阅读建议

第 1–7 章解释模型机制。第 8–13 章从模型边界讨论 prompting、context、knowledge、retrieval、tools 和 evaluation。第 14 章把这些限制收束成紧凑的责任映射，并把系统实现问题导向配套教材。

如果你已经在做 agent 或 coding assistant，最应该优先读第 2、6、8、9、10、11、12、13、14 章。
