# 术语表

## Agent

智能体。由 harness 驱动的模型系统：反复调用工具、读取观察结果、跨多轮采取行动以达成目标。区别于单次 token 预测——模型在循环中运行，它自己的输出会塑造它下一步看到的内容。

## Attention / Self-Attention

注意力 / 自注意力。让每个 token 位置按相关性加权读取上下文中其他 token 表示的机制。self-attention 是 Transformer 在序列内混合信息的方式。

## Autoregressive Model

自回归模型。一次生成一个 token，并让每个新 token 依赖之前的 token。

## Base Model

大规模预训练之后、面向 assistant 的 post-training 之前的模型。Base model 是强大的文本补全器，但不一定是有帮助的 assistant。

## Byte Pair Encoding

一种 subword tokenization 方法，通过反复合并高频符号对来构建词表。它帮助模型用较小单元处理稀有词和未见词。

## Chain-of-Thought

一种 prompting 模式，让模型在答案前生成中间推理步骤。它能改善某些推理任务，但生产 harness 应控制中间推理如何表示。

## Chat Template

把包含 system、user、assistant、tool 等角色的聊天对话，序列化成模型实际接收的 token 序列的格式。

## Compaction

总结或压缩累积的上下文，以留在 token 预算之内。它腾出了空间，但会改写 prefix，从而与 prefix caching 相冲突。

## Context Engineering

上下文工程。在 token 预算内，刻意决定什么进入上下文、以及以何种形式进入（prompt、工具结果还是检索到的段落）。

## Context Rot

上下文随输入增长而被模型利用得越来越差：既来自单纯的长度，也来自累积的无关材料挤占了真正重要的内容。

## Context Window

模型单次调用中最多能利用的 token 数。它是输入上下文，不是持久记忆。

## DPO

Direct preference optimization。一种 post-training 方法，直接用偏好数据优化模型，无需单独训练的 reward model。

## Embedding

文本、代码、图片或其他数据的向量表示。文本 embedding 常用于语义搜索和检索。

## Fine-Tuning

预训练之后的额外训练。LLM 场景中通常包括基于 demonstrations 的 supervised fine-tuning 或基于偏好的优化。

## Grounding

接地 / 锚定。把生成的论断与所提供的证据绑定，使答案能追溯回 harness 提供的来源段落。

## Hallucination

看起来合理但不被现实或提供证据支持的生成文本。

## Harness

模型周围的软件系统：prompt、工具、检索、记忆、状态、权限、执行、评估和用户交互。

## Hybrid Search

混合检索。把词法或精确检索（如 BM25 或 grep）与向量检索结合起来，使结果既能命中关键词匹配，也能命中语义匹配。

## In-Context Learning

模型在不改变参数的情况下，根据 prompt 中的指令和示例调整行为的能力。

## KV Cache

Transformer inference 中缓存的 key/value 张量，用于避免重复计算之前的上下文。它能提升效率，但不是语义记忆。

## Logits

模型在转换成概率之前，对可能下一个 token 给出的原始分数。

## Mixture-of-Experts (MoE)

一种架构：router 对每个 token 只激活少数 expert 子网络，因此总参数量可以增长而每 token 计算量不必同比上升。激活参数决定每 token 计算量，但总参数仍决定 serving 时的显存占用。

## Next-Token Prediction

模型根据之前 token 预测下一个 token 的训练目标。

## Parameters

模型学得的数值权重。它们编码训练中学到的压缩统计结构和行为。

## pass@k

一种评测指标：用 k 次采样尝试中至少一次解出问题的占比。k 越大，越偏向那些多试几次就能做对的模型。

## Post-Training

预训练之后塑造模型行为的训练，例如 SFT、RLHF、DPO 或 Constitutional AI。

## Pretraining

预训练。在大规模文本语料上做自监督 next-token prediction 的训练，产出 base model。后续每个阶段（fine-tuning、post-training）都在它之上构建。

## Prompt Injection

不可信内容包含类似指令的文本，并以 harness 未预期的方式影响模型行为的失败模式。

## Quantization

量化。用更低数值精度（例如 8 位或 4 位）提供模型服务，以减少内存、加快 inference，代价是一些精度损失。精度变化应当成行为变化重新评测。

## RAG

Retrieval-augmented generation。Harness 检索外部信息，并把它作为上下文提供给模型生成。

## Reasoning Model

推理模型。经过 post-training（通常是在可验证奖励上做 reinforcement learning），学会在回答前生成很长内部推理的模型。用额外的 inference token（test-time compute）换取困难任务上更好的表现。

## Reward Hacking

过度优化一个不完美的 reward 或 grading signal，使分数提高，但真实目标没有改善。

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

## Test-Time Compute

在 inference 时花更多 token、时间和金钱来改进困难答案，区别于训练期 scaling。推理模型是最常见的例子。

## Token

模型处理文本的单位。Token 可以是单词、subword、标点、空白模式或 byte-level 片段。

## Tool Call

模型输出的、由 harness 解释为请求执行外部操作的结构。

## Top-p (Nucleus Sampling)

一种 decoding 设置：从累计概率刚好越过 p 的最小 token 集合中采样。它裁掉不太可能的长尾 token，同时让候选集随模型的置信度自适应。

## Transformer

现代大多数 LLM 使用的基础神经网络架构，核心依赖 attention mechanism，而不是 recurrence。
