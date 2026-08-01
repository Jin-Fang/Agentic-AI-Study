# 术语表

## Agent

智能体。把模型调用放入循环的系统：模型可以提出工具调用，外部系统执行该调用，观察结果再进入后续模型调用。执行、授权和持久状态仍位于模型之外。

## Attention / Self-Attention

注意力 / 自注意力。让每个 token 位置按相关性加权读取上下文中其他 token 表示的机制。self-attention 是 Transformer 在序列内混合信息的方式。

## Autoregressive Model

自回归模型。一次生成一个 token，并让每个新 token 依赖之前的 token。

## Base Model

大规模预训练之后、面向 assistant 的 post-training 之前的模型。Base model 是强大的文本补全器，但不一定是有帮助的 assistant。

## Byte Pair Encoding

一种 subword tokenization 方法，通过反复合并高频符号对来构建词表。它帮助模型用较小单元处理稀有词和未见词。

## Chain-of-Thought

一种 prompting 模式，让模型在答案前生成中间推理文本。它能改善某些任务，但这些文本不保证忠实反映产生答案的实际计算过程。

## Chat Template

把包含 system、user、assistant、tool 等角色的聊天对话，序列化成模型实际接收的 token 序列的格式。

## Context Rot

序列变长时，模型利用信息的有效程度可能出现经验性下降。其严重程度取决于模型、任务、长度、信息位置和周围的干扰内容。

## Context Window

模型在一次调用中能够条件化的最大序列长度，通常由 prompt 与已经生成的 token 共享。它是临时工作序列，不是持久记忆。

## DPO

Direct preference optimization。一种 post-training 方法，直接用偏好数据优化模型，无需单独训练的 reward model。

## Embedding

文本、代码、图片或其他数据的向量表示。文本 embedding 常用于语义搜索和检索。

## Epistemic Abstention

认识论弃答。模型因为未知或证据不足而不作答的行为。它是学习到的行为，不是模型内部知识边界的可靠读数。

## Fine-Tuning

预训练之后的额外训练。LLM 场景中通常包括基于 demonstrations 的 supervised fine-tuning 或基于偏好的优化。

## Grounding

基于外部证据约束生成，并把论断与证据关联起来。Grounding 改变模型输入，不会更新模型参数，也不保证模型会忠实使用证据。

## Hallucination

看起来合理但不被现实或提供证据支持的生成文本。

## Harness

模型周围的软件系统。它承担单靠 token 生成无法提供的责任，例如执行、持久状态、权限、验证和现实后果。

## Hybrid Search

混合检索。把稠密向量检索与 BM25 等词法或稀疏检索结合起来。`grep` 一类字面或正则搜索是另一种精确文本信号，也可以与前两者组合。

## In-Context Learning

模型在不改变参数的情况下，根据 prompt 中的指令和示例调整行为的能力。

## KV Cache

Transformer inference 中缓存的 key/value 张量，用于避免重复计算之前的上下文。它能提升效率，但不是语义记忆。

## Logits

模型在转换成概率之前，对可能下一个 token 给出的原始分数。

## Next-Token Prediction

模型根据之前 token 预测下一个 token 的训练目标。

## Parameters

模型学得的数值权重。它们编码训练中学到的压缩统计结构和行为。

## pass@k

一种评测指标：用 k 次采样尝试中至少一次解出问题的占比。k 越大，越偏向那些多试几次就能做对的模型。

## pass^k

一种评测指标：k 次采样尝试全部成功的问题占比。它衡量给定采样条件下的重复可靠性，而不是至少一次成功的机会。

## Post-Training

预训练之后塑造模型行为的训练，例如 SFT、RLHF、DPO 或 Constitutional AI。

## Pretraining

预训练。在大规模文本语料上做自监督 next-token prediction 的训练，产出 base model。后续每个阶段（fine-tuning、post-training）都在它之上构建。

## Prompt Injection

不可信内容包含类似指令的文本，并以 harness 未预期的方式影响模型行为的失败模式。

## Provider Prompt Caching

供应商在多个请求之间复用匹配 prompt 前缀计算的特定功能。它不同于单次请求内的 KV cache，匹配方式、有效期和计费规则均由供应商约定。

## RAG

Retrieval-augmented generation。在 inference 时由外部检索步骤选择信息并加入模型输入；模型权重不会改变。

## Reasoning Model

推理模型。经过 post-training，在困难任务上使用额外 test-time compute 的模型；训练中常使用基于可验证奖励的 reinforcement learning。更多推理 token 可以改善某些任务，但不会创造缺失事实或外部证据。

## Retrieval Embedding

用于相似度搜索的固定长度 query 或 passage 向量。它不同于 Transformer 内部逐 token 使用的表示。

## Reward Hacking

过度优化一个不完美的 reward 或 grading signal，使分数提高，但真实目标没有改善。

## Reward Model

根据偏好数据或其他 proxy objective 给候选输出打分的模型。Reward model 有用，但可能只是人类判断的不完美模拟。

## RLHF

Reinforcement learning from human feedback。用人类偏好数据引导模型行为的一种 post-training 方法。

## Safety Refusal

安全拒答。模型因为请求属于被视为不安全或不允许的类别而拒绝响应的学习行为。它不同于认识论弃答，也不是执行层保证。

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
