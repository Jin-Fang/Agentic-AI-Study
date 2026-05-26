# 术语表

## Autoregressive Model

自回归模型。一次生成一个 token，并让每个新 token 依赖之前的 token。

## Base Model

大规模预训练之后、assistant-oriented post-training 之前的模型。Base model 是强大的文本补全器，但不一定是有帮助的 assistant。

## Byte Pair Encoding

一种 subword tokenization 方法，通过反复合并高频符号对来构建词表。它帮助模型用较小单元处理稀有词和未见词。

## Chain-of-Thought

一种 prompting 模式，让模型在答案前生成中间推理步骤。它能改善某些推理任务，但生产 harness 应控制中间推理如何表示。

## Chat Template

把包含 system、user、assistant、tool 等角色的聊天对话序列化成模型实际接收 token 序列的格式。

## Context Window

模型单次调用中能条件化的最大 token 数。它是输入上下文，不是持久记忆。

## Embedding

文本、代码、图片或其他数据的向量表示。文本 embedding 常用于语义搜索和检索。

## Fine-Tuning

预训练之后的额外训练。LLM 场景中通常包括基于 demonstrations 的 supervised fine-tuning 或基于偏好的优化。

## Hallucination

看起来合理但不被现实或提供证据支持的生成文本。

## Harness

模型周围的软件系统：prompt、工具、检索、记忆、状态、权限、执行、评估和用户交互。

## In-Context Learning

模型在不改变参数的情况下，根据 prompt 中的指令和示例调整行为的能力。

## KV Cache

Transformer inference 中缓存的 key/value 张量，用于避免重复计算之前上下文。它提升效率，但不是语义记忆。

## Logits

模型在转换成概率之前，对可能下一个 token 给出的原始分数。

## Next-Token Prediction

模型根据之前 token 预测下一个 token 的训练目标。

## Parameters

模型学得的数值权重。它们编码训练中学到的压缩统计结构和行为。

## Post-Training

预训练之后塑造模型行为的训练，例如 SFT、RLHF、DPO 或 Constitutional AI。

## Prompt Injection

不可信内容包含类似指令的文本，并以 harness 未预期方式影响模型的失败模式。

## RAG

Retrieval-augmented generation。Harness 检索外部信息，并把它作为上下文提供给模型生成。

## Reward Hacking

过度优化一个不完美 reward 或 grading signal，使分数提高但真实目标没有改善。

## Reward Model

根据偏好数据或其他 proxy objective 给候选输出打分的模型。Reward model 有用，但可能只是人类判断的不完美模拟。

## RLHF

Reinforcement learning from human feedback。用人类偏好数据引导模型行为的一种 post-training 方法。

## Sampling

从概率分布中选择输出 token。Temperature 和 top-p 等采样设置会影响创造性、稳定性和方差。

## SFT

Supervised fine-tuning。用期望 input-output 行为样例训练模型。

## Temperature

Decoding 参数，用来改变下一个 token 概率分布的尖锐程度。低 temperature 更确定，高 temperature 更多样。

## Token

模型处理文本的单位。Token 可以是单词、subword、标点、空白模式或 byte-level 片段。

## Tool Call

模型输出的、由 harness 解释为请求执行外部操作的结构。

## Transformer

现代大多数 LLM 的基础神经网络架构，核心依赖 attention mechanism，而不是 recurrence。

