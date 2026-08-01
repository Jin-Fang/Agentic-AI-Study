# LLM Foundations 结构重审与修改清单

## 目标

让 `llm-foundations/` 与 `llm-foundations-zh/` 先完整解释 LLM 本身，再在必要位置说明模型与外围系统的边界；不把《Agent Harness》已经系统讲解的工具设计、权限、状态、编排、可观测性、评估工程和治理提前塞进基础章节。

本清单基于 15 个独立章节审阅结果。第一轮审阅只提出建议，没有修改正文。

## 全书统一编辑规则

1. 第 1–7 章以模型机制为主线，不以 `harness` 或 `harness engineer` 为叙事主语。
2. 第 8–11、13 章可以讨论模型行为对系统的含义，但只讲理解该机制所需的最小边界，不展开完整生产控制。
3. 第 12 章只做“模型生成工具调用、外部系统执行”的边界桥；不写成《Agent Harness》的缩写版。
4. 第 14 章只做全书归纳、责任边界和 companion 导读；不再教授成本、路由、权限、trace、checkpoint 或多模态运行细节。
5. 必要的工程含义集中在章末短段或交叉引用中，不在每个机制段落后重复一份 harness checklist。
6. 已在《Agent Harness》中完整覆盖的内容以删除重复和链接转介为主，不机械搬运。
7. 中英文使用相同标题层级、段落顺序、示例、引用与交叉链接；中文不额外扩写 harness 解释。
8. 每章 `Key Takeaways` 只总结本章教学目标，不在最后一条突然切回 harness 责任清单。

## 跨章节内容归属

| 内容 | LLM Foundations 中的归属 | 详细系统实现 |
|---|---|---|
| token、训练目标、Transformer、sampling、post-training | 第 1–7 章 | 不在 Harness 重复推导 |
| prompting、ICL、CoT、prompt injection 的模型层成因 | 第 8 章 | Harness 第 13、5 章 |
| context window、prefill/decode、KV cache、long-context 行为 | 第 9 章 | context selection、memory、compaction 转 Harness 第 2、3 章 |
| 参数化知识、幻觉、校准、弃答、拒答、引用形幻觉 | 第 10 章 | grounding、安全执行、来源管线转后续章与 Harness |
| embedding、retrieval、最小 RAG、chunking、检索指标 | 第 11 章 | search-as-tool、权限、索引运维、trace 转 Harness |
| tool call、observation、agent loop、reasoning vs acting | 第 12 章 | MCP、工具 API、sandbox、长时状态、监督转 Harness |
| benchmark、重复试验、grader、指标投机 | 第 13 章 | agent eval suite、trace、权限/副作用、release gate 转 Harness |
| 模型属性到系统责任的映射 | 第 14 章 | 实现方法按主题转 Harness |

## 分章修改清单

### 前言 `00-preface.md`

**单一目标**

说明本书教授 LLM 机制与行为边界；外围系统设计由 companion book 承担。

**修改项**

- 原第 3 行：保留“聊天界面隐藏模型机制”，删除完整 harness 定义、组件枚举和 prompt/tool/retrieval/verification 设计问题。
- 原第 5 行：读者从 `harness engineer` 扩为使用 LLM 的软件工程师和技术读者。
- 原第 7 行：用 token、训练、上下文、采样、外部证据解释模型行为，不再用 agent 忘记指令、选错工具等故障定义教学目标。
- 原第 9 行：把 `harness-oriented sequence` 改为面向工程实践的 LLM 基础路线。
- 原第 13 行：先修要求缩为 API、测试、日志等基本软件工程知识。
- 原第 19–26 行：保留 token、有限 context、参数知识、采样四项；把 retrieval/tool 和 model-harness eval 改成模型侧事实。
- 原第 28–32 行：压缩为最后一个“配套教材”短节；删除“两书必须一起读”的强制论断。

**目标纲要**

为什么需要本书 → 目标与读者 → 素材 → 先修与非目标 → 稳定的模型性质 → 配套教材。

### 第 1 章 `01-llm-as-token-machine.md`

**单一目标**

建立 token context → next-token probabilities → decoding loop 的模型边界，并区分 architecture、parameters、runtime 与 application。

**修改项**

- 原第 5 行：`samples` 改为按 decoding rule `selects`，避免把 greedy 也称为 sampling。
- 原第 7 行：删除“模型本身不是 agent”，改为参数化函数定义。
- 原第 11 行：修正 `same parameter file after post-training`；post-training 会产生更新后的参数/checkpoint。
- 原第 13 行：保留“参数不是数据库”，删除 current policy、invoice、私有文档、source-of-truth 处方。
- 原第 17–24 行：保留四层区分，将 `Product` 改为中性的 `Application layer`，删除 tools/memory/safety 目录。
- 原第 28 行：保留“生成动作描述不等于动作已发生”。
- 原第 30–38 行：删除 JSON tool-call walkthrough、权限、执行、observation、compaction、eval；转介第 12 章与 Harness 第 1、3、5、10 章。
- 原第 44–53 行：删除 harness engineer 杠杆清单和 fine-tuning/harnessing 对照，只保留多数使用者调用已有 checkpoint。
- 原第 57–69 行：删去 RAG、agent loop、computer use、memory 等产品类型巡礼；只说明相同模型可被不同应用包装。
- 原第 71–77 行：改为“模型输出只是产品行为的一部分”，不要禁止使用 `model behavior`。
- 删除原 `Harness Implications`。
- 结尾只导航第 2、3、4、6 章，并用一句链接 companion。

**目标纲要**

Tokens in, probabilities out → sequence generation → architecture/parameters/runtime → parameters 来源 → 参数不是数据库 → token 不产生外部副作用 → model call 与 application 的区别 → 要点。

### 第 2 章 `02-tokenization.md`

**单一目标**

解释 subword tokenizer 如何把文本变成 token ID，并据此理解序列长度、格式差异和字符级能力缺口。

**修改项**

- 原第 5 行：去掉 harness 主语；将 tokenization 的直接结果写成序列长度，成本/时间作为间接结果。
- 原第 13 行：修正 BPE 表述；区分 BPE 家族与 byte-level BPE，不宣称所有 tokenizer 都从 raw byte 开始。
- 补充 tokenizer training、encode、token ID、embedding lookup、decode、model-specific tokenizer 的基本流程。
- 原第 19–29 行：保留 token budget、不同文本类型和语言的计量差异；删除“工具先过滤总结”等系统建议。
- 原第 33–41 行：保留空格、大小写、标点、缩进改变切分；把训练分布、schema 设计、prompt template 治理移至第 7、8、12、13 章。
- 将 `Conversation Tokenization` 与 special token 合并成短节，只讲 chat template 和不可见 token 开销。
- 删除 role priority、tool result delimiting、prompt injection、手工拼对话等展开。
- 将 `Special Tokens and Tool Protocols` 改为 `Special Tokens and Chat Templates`；工具协议移第 12 章。
- 多模态只留一句“不能用文本 tokenizer 推算”，详细表示移第 14 章或 Harness 第 16 章。
- `Tokenization Failure Modes` 收紧为 token count pitfalls；删除 tool/context-security/computer-use 示例。
- 字符级能力缺口改为非绝对表述；数字切分不是算术错误的唯一原因。
- 删除 `Tokenization and Context Engineering` 清单；仅链接第 9 章。

**目标纲要**

Text to token IDs → 为什么用 subword → tokenizer 如何训练与编码 → 实际切分示例 → token count 不是 word count → chat templates 与 special tokens → 字符级能力缺口 → 常见计量陷阱 → 要点。

### 第 3 章 `03-next-token-prediction.md`

**单一目标**

解释 next-token cross-entropy 预训练如何产生广泛统计能力，以及它为什么不自动产生意图、权威知识或 assistant 行为。

**修改项**

- 原第 11 行：GPT-3 few-shot 只用于说明 ICL；删除 tool results、output format 等 harness 枚举。
- 删除原第 19 行 context quality/harness 处方。
- 将 `The Dataset Becomes One Long Token Stream` 改为训练文本变成 token sequences；明确 Karpathy 的长流是演示，生产训练可保留文档边界或 packing。
- logprobs/API 细节后移第 6 章或改成中性数学联系。
- 原第 55 行：保留参数知识非权威实时来源，删除 harness 命令式建议。
- 原第 59 行：修正“后来拥有目标”的暗示；base model 学到行为模式，但没有内在帮助、安全或求真意图。
- 原第 61 行：只说明 prefix 改变 continuation distribution，并链接第 8 章。
- 删除整个 `Harness Implications`。
- 删除 `Models Compute With Tokens` 中 CoT、reasoning model、calculator、code interpreter 的统一强归因；分别转第 6、8、12 章。

**目标纲要**

Next-token objective → training sequences → loss 与 gradient → memorization vs generalization → 为什么预测产生广泛能力 → capability without intention → base model vs assistant model → 要点。

### 第 4 章 `04-transformer-attention.md`

**单一目标**

解释 decoder-only Transformer 如何以 causal self-attention、MLP、残差和归一化形成用于 next-token prediction 的上下文化表示，并理解 attention 的软性混合与成本。

**修改项**

- 原第 3、17、25 行：去掉 harness framing。
- 调整教学顺序：position 放输入表示；causal mask 与 multi-head 放 attention 小节。
- 原第 31、40 行：用 question/source text/earlier code 替代 retrieval/tool result。
- Q/K/V 例子降格为直觉，不再暗示单个 head 直接决定输出。
- 原第 44–46 行：删除 evidence placement、delimiter、retrieval precision、tool-log trimming；只保留 attention 不保证相关信息被正确使用。
- 原第 52–54 行：只说明多层产生分布式、上下文相关表示；prompt/retrieval 处方后移。
- MoE 从主线删除或压成不超过三句；routing/eval 转第 5、6、13 章。
- 原第 67–77 行：保留知识分布式与 interpretability 边界，删除 input/tool/retrieval/verification 清单。
- 原第 79–83 行：保留 architecture 与 training 的区别，替换工具 schema/长文档例子。
- 原第 85–95 行：精确区分 full-sequence/prefill O(n²) 与 KV-cached decode；删除 context-engineering checklist。

**目标纲要**

输入与输出 → 原始 Transformer 与 decoder-only → self-attention/QKV/multi-head → Transformer block → 分布式表示与可解释性 → architecture vs training → attention 成本 → 要点。

### 第 5 章 `05-training-data-and-scaling.md`

**单一目标**

解释语料选择、过滤、去重、时间覆盖和参数/数据/算力配比如何塑造平均 loss、能力分布与知识边界。

**修改项**

- 原第 3、29 行：删除 harness engineer framing。
- 原第 29–36 行：保留 mixture 导致能力不均；workflow eval 后移第 13 章。
- 原第 42 行：保留暴露频次/去重不均匀，删除 retrieval/local inspection 处方。
- 原第 50 行：保留 training-optimal 与 inference-efficient 目标不同，弱化行业普遍性和模型选型处方。
- 原第 54–56 行：压成“更低平均 loss 不保证每项任务更好”；routing 与 task eval 后移。
- 原第 58–71 行：只保留 training compute vs repeated inference compute；删除短 prompt、小模型、缓存、retrieval、early exit、routing 清单。
- quantization 整节移至第 6 或第 14 章的边界说明；回归纪律转第 13 章。
- 原第 85–89 行：保留 bounded/uneven collection dates 和参数不自动更新；删除 browser/database/file freshness path。
- 原第 91–102 行：只保留数据覆盖导致的弱项；精确计算和外部行动移第 12 章。
- 原第 104–108 行：保留 contamination 对 benchmark 解读的影响；删除 agent 检查 repo/tests/files。

**目标纲要**

构造出来的数据分布 → filtering/mixing/policy → dedup/frequency/memorization → coverage/freshness/competence → scaling laws → compute-optimal training → training vs inference cost → scaling claim 的边界 → contamination → 要点。

### 第 6 章 `06-inference-and-sampling.md`

**单一目标**

沿 context → logits → probability distribution → token selection → append/repeat → stop 解释生成，并说明 decoding 参数如何影响随机性、质量与可重复性。

**修改项**

- 精确说明 `temperature=1` 与 `temperature=0`；后者通常触发 greedy/argmax，具体依 API。
- 删除“harness 应如何配置”的措辞，改为任务与分布层事实。
- 保留“确定性不等于正确”；修正 `same logits can differ` 为 nominally identical requests may produce slightly different logits。
- stability/correctness/calibration/robustness 的评估清单移第 13 章。
- 自回归循环简化 conversation serialization，并修正“长输出为何更贵”的因果。
- 将 `Stop Conditions and Output Contracts` 改为 `Stopping Generation`；保留 EOS、max output tokens、stop sequence、finish reason、truncation。
- schema validation、retry、mixed prose/JSON channel 移第 12、14 章。
- 将 `Logit Bias, Masks, and Tool Choice` 改为 `Logit Transformations and Constrained Decoding`；工具执行后移。
- model routing、cache policy、p50/p95/p99 移第 14 章或 companion。
- streaming 整节移出本章；未完成 tool call 的验证放第 12 章。
- HTTP 429/5xx/backoff/idempotency 整节移出；refusal 不归类为网络错误，idempotency 应绑定真实副作用操作。
- 多次完整采样保留；grader/best-of-k/pass@k 后移第 13 章。

**目标纲要**

Inference 做什么 → logits 到 token → 自回归循环 → 生成如何停止 → constrained decoding → 随机性与可重复性 → 多次采样 → 要点。

### 第 7 章 `07-post-training.md`

**单一目标**

解释 SFT、偏好优化和奖励训练如何把 base model 塑造成 assistant，并说明它们改变输出倾向但不保证正确、安全或完整能力。

**修改项**

- 原第 13 行：SFT 数据来源改为可能来自人工、合成或混合数据，避免无支撑的行业历史断言。
- 原第 15、24、28–38 行：只保留 role/serialization 是训练分布的一部分；system priority、tool schema、constrained decoding、升级回归后移。
- RLHF 五步、reward model、reference constraint 保留；DPO/AI feedback 压成简短旁支。
- 原第 64–76 行：只保留训练意义的 reward hacking；model grader/citation checker/coding eval 缓解措施移第 13 章。
- 原第 78–84 行：保留 verifiable vs preference reward 和 RLVR 简述；推理时行为链接第 8 章。
- `Behavior Is Not Capability` 只讲模型侧可观察行为，不展开产品 policy、permissions、tool gating。
- refusal 是学习行为、不等于硬保证；正式安全控制转第 10、12 章与 companion。
- 拆分 `Fine-Tuning vs Harnessing`：保留 full fine-tuning、LoRA/PEFT；RAG、工具、权限、eval 选型移后。
- 不把 fine-tuning 推荐为动态事实存储；事实新鲜度/可追溯性转第 11、14 章。

**目标纲要**

Base model to assistant → SFT → learned interaction conventions → preference optimization → DPO/AI feedback → proxy rewards/reward hacking → verifiable rewards → behavior vs capability → full/parameter-efficient fine-tuning → 要点。

### 第 8 章 `08-prompting-and-in-context-learning.md`

**单一目标**

解释 prompting/ICL 如何通过单次调用的 token context 改变续写，而不提供权限、执行、持久状态或安全隔离。

**修改项**

- 原第 5–7 行：去掉 turning point/harness engineer framing，改为 inference-time conditioning。
- 原第 19–32 行：保留 instruction/data/example/constraint/output format 与 role serialization；system prompt 组装、tool-result 消息和治理转 companion。
- 原第 55 行：明确 delimiter 只降低歧义，不是 prompt-injection 安全边界。
- 动态示例检索后移第 11 章；prompt 版本化与测试转 Harness 第 13 章。
- CoT/self-consistency/trace 不忠实保留；planning field、scratchpad、tool loop、小调用、verification pass 等编排删除。
- reasoning model 只讲 test-time compute、额外 token、latency/cost、reasoning 不等于 grounding；路由、UI、预算转 companion。
- tool-use prompting 保留最小边界：tool definitions/schema/examples 进入 context，模型提出结构化 call，外部系统执行。
- tool 选择规则、failure policy、参数验证、隔离、副作用移第 12 章与 companion。
- prompt injection 保留模型层成因和威胁示例；不暗示正确分隔即可解决。
- 权限、tool gating、action validation 转第 12 章/companion；此处只声明必须在模型外执行。
- prompt 不是持久 memory；files/databases/task plan/trace store 转第 9 章与 companion。

**目标纲要**

Prompting as inference-time conditioning → context 的组成 → 结构降低歧义 → zero/one/few-shot → reasoning prompts 与限制 → reasoning models/test-time compute → tool-use prompting 的模型边界 → prompt injection → prompting 不能提供什么 → 要点。

### 第 9 章 `09-context-window-and-kv-cache.md`

**单一目标**

沿 prefill → token-by-token decode 解释 context window 的序列限制、KV cache 的计算复用与显存代价，以及长序列容量不等于可靠利用。

**修改项**

- 开头明确 context window 通常约束 prompt + 已生成 token，provider 可能另设 input/output 上限。
- 删除 system/developer instructions、retrieval、tool outputs、summaries 和五问 context-selection checklist。
- KV cache 扩写为每层既有 token 的 K/V；先讲 prefill 再讲 decode；修正复杂度和 cache memory 表述。
- 删除 `stale KV prefix`；过期的是前缀语义，不是 cache。
- provider prompt caching 只用一段区分：它不等于单次调用内 KV cache，且是 provider-specific contract。
- working set vs persistent state 只留 2–3 句；user profile/vector DB/browser session 等架构移 Harness 第 2、3 章。
- 删除整个 `Context Selection`。
- `Context Rot` 只保留位置敏感、distractor sensitivity、利用率下降等经验事实；治理措施移 companion。
- 删除 `Context as a Security Boundary`；context 是 attack/trust surface，不是 enforcement boundary。保留一句“模型不提供可靠信任隔离”并链接第 8 章。
- 保留 Lost in the Middle，但不写成普遍定律；补长序列的 prefill、KV memory、decode latency 代价。
- 清除英文独有的两句，恢复中英文镜像结构。

**目标纲要**

Context window 限制什么 → 一次调用的 prefill/decode → KV cache → long context 的容量与可靠性 → context/KV cache/provider caching 三者区别 → 要点。

### 第 10 章 `10-knowledge-hallucination-uncertainty.md`

**单一目标**

解释参数化知识为什么会产生流畅但错误、过期、模仿性或引用形幻觉，以及信心、弃答和安全拒答为什么都是不完全可靠的学习行为。

**修改项**

- 原第 5 行：删除中文独有的“缺少 grounding 时”限定；有 evidence 仍可能错引或越界推断。
- 风险因素只保留稀有/新鲜事实、强制前提、无来源却要求精确引用、流畅性激励；retrieval/tool 条件移后。
- 删除以 harness artifact 为中心的例子，改为权威格式放大可信感。
- 将 `The Training Mechanism` 改为训练为何鼓励 answer-shaped completion；不要单因归于 SFT。
- 区分 epistemic abstention 与 safety refusal；删除 `not found workflow` 处方。
- `Knowledge of Self Is Also Hallucinated` 改为 `Self-Report Is Not Authoritative Metadata`。
- 补 calibration 的操作定义；区分 verbal confidence、token probability 与答案正确概率。
- 删除 uncertainty-control checklist。
- 保留错误前提诱导，但不用 harness prompt 模板叙述。
- `Grounding` 压成系统边界段：外部证据改变输入而非参数知识；完整 pipeline 转第 11 章。
- `Hallucination vs Tool Error` 只保留“忠实总结错误 observation 不等于模型自行编造”；search/tenant/browser/trace 细节移出。
- safety/refusal 只讲模型侧 learned behavior；区分 jailbreak 与 prompt injection。
- classifier、tool gating、confirmation、sandbox、secret isolation、audit 全部转第 12 章或 companion。
- citation 小节保留 source existence、claim support、formatting 三者区别；stable ID/metadata/support pipeline 移第 11、13 章。

**目标纲要**

参数化知识不是数据库 → 可信假答案如何产生 → 模型层错误类型 → uncertainty/calibration → abstention 是学习行为 → refusal/jailbreak 的模型边界 → self-report 与 citation-shaped hallucination → model failure vs system failure → 要点。

### 第 11 章 `11-embeddings-and-retrieval.md`

**单一目标**

解释 retrieval embedding、dense/lexical/hybrid retrieval、最小 RAG、chunking、检索指标和 precision/recall/latency/context-pollution 权衡。

**修改项**

- 原第 5 行：把 `RAG is a harness pattern` 改为 RAG 在 inference 时改变输入而非权重。
- 区分 token embedding 与整段 query/chunk retrieval embedding。
- ANN/HNSW/IVF 保留；区分 ANN recall 与任务相关性的 Recall@k。
- BM25 改为 lexical/sparse ranking，不再与 grep 一并称 exact match。
- 参数记忆 vs retrieval memory 保留；删除 permissioned/auditable 等治理属性。
- 重写最小 RAG：index time 与 query time；补上 query embedding 这个缺口。
- metadata 只保留 source/title/section 等 provenance；owner/permission/freshness policy 转 companion。
- query rewrite/classification 从基本流程删除。
- reranking 保留，并说明无法找回第一阶段未召回的内容。
- citation verification/support checking 转第 10、13 章。
- 保留 Recall@k、Precision@k、MRR、NDCG，并解释各自含义。
- trace review/permission failure 移出。
- chunking 增加 overlap 的边界收益与重复成本；删除 tool definition/trace-step 例子。
- 正式定义 precision/recall，不再等同于“多取/少取”。
- search-as-tool、follow-up query、permission checks、trace logging 全部转 companion。
- 删除 tool-choice 整节；依赖第 12 章。
- context pollution 保留无关、过期、重复、冲突内容；对抗内容只链接第 8 章。
- 删除 `Harness controls` 和“harness owns retrieval path”。
- 保留 RAG vs fine-tuning。

**目标纲要**

Why retrieval → retrieval embeddings → dense/lexical/hybrid → 最小 RAG → chunking → measuring retrieval → precision/recall/latency/pollution → RAG vs fine-tuning → companion boundary。

### 第 12 章 `12-reasoning-tools-and-agents.md`

**单一目标**

从 token generator 推导最小工具型 agent：模型生成结构化 call，外部系统执行并返回 observation，模型继续生成；执行、授权、持久状态和监督不属于模型能力。

**修改项**

- 保留开篇和最小 agent loop；删除 `Every step is a design surface` 等系统设计话语。
- 保留一个 vendor-neutral call/result 示例，明确 API 结构是 provider-specific serialization 的外部表示。
- partial stream、syntax/schema/semantic/authorization 的区别压缩说明；不再给不稳定的“三档保证”分类。
- MCP 整节删除并链接 Harness 第 4 章。
- 工具作用分类压成知识、精确计算、实时交互、外部状态等 4–5 类；区分原生 multimodal 与外部 vision/OCR tool。
- 保留 ReAct 的 reasoning/action/observation 核心；不把可见 thought、隐藏 reasoning 和 plan summary 混为一谈。
- trace 字段/停止原因/调试 schema 删除，仅保留可观察 action/observation 有助于定位问题。
- reasoning model 只留“额外推理不等于新证据或持久状态”；删除 reasoning replay/budget 设计。
- `Tool Design Matters` 整节转 Harness 第 4 章。
- `Long-Running Agents` 整节转 Harness 第 7 章，只保留模型调用之间无天然持久状态。
- `Safety and Side Effects` 控制清单转 Harness 第 5 章；保留模型提出、外部系统授权执行。
- prompt-injection mitigation 细节转第 8 章/companion；只保留 observation 仍是不可信 context。
- `Human Supervision` 整节转 Harness 第 15 章。

**目标纲要**

工具不改变 token machine 本质 → 一次工具调用的最小协议 → agent loop → reasoning 与 acting → 模型边界与 companion 路线 → 要点。

### 第 13 章 `13-evaluation-for-llm-behavior.md`

**单一目标**

解释为何 LLM 行为不能由单次结果判断，如何用 benchmark、代表性任务、重复试验和 grader 获得有限证据，以及指标为何会被投机；当评价依赖工具、权限、副作用和环境状态时即进入 system eval。

**修改项**

- 开篇先讲概率性和上下文依赖，不以 repository/permissions/harness engineer 开场。
- agentic benchmarks 压成一句边界提示，不逐个罗列易过时 benchmark。
- 模型输出维度保留 factuality、task accuracy、citation、format/schema；tool choice/recovery/policy 转 system eval。
- grader 是 proxy 的内容保留并并入 grading 小节。
- 修正 `pass^k is the honest metric`；pass@k 与 pass^k 服务不同产品契约。
- fixed seed 只能减少部分方差，不能保证 hosted inference 可复现。
- 区分测试设施/grader 不稳定与模型真实随机不可靠性；后者不能通过 quarantine 消失。
- golden tasks、普通/边界/历史失败、版本化保留；具体 tool/permission/prompt-injection case catalog 删除。
- traces 只保留 1–2 句边界；完整 observability 转 Harness 第 12 章。
- deterministic/human/model grader taxonomy 保留；环境状态判分转 Harness 第 10 章。
- reward hacking 保留 proxy optimization；coding agent/retrieval/trace mitigation 移出。
- 只保留模型/decoding 变化可能 task-specific regression；发布回归纪律转 companion。
- 增加一句 capability eval 定义，保持与 companion 引用一致。

**目标纲要**

行为评估为何不同 → benchmark 与局限 → representative tasks/repeated trials → grading → metrics as proxies → model eval 的终点 → 要点。

### 第 14 章 `14-operational-mental-model.md`

**单一目标**

按 LLM 属性判断模型可以承担什么、外部系统必须承担什么，并把读者导向 companion；不教授这些机制如何实现。

**修改项**

- 保留责任表并修正安全/可靠性行：模型只能降低不安全提议概率，外部系统控制权限与效果；eval 测量而非自动提高可靠性。
- 保留 jagged capability，操作性例子压成一句。
- 合并原 `Design From Failure Modes` 与责任表；只保留六类：
  1. 只对编码后的当前 context 条件生成 → 外部系统选择 context。
  2. context 有限且无持久状态 → 状态存在模型外。
  3. 参数知识不完整、会过时 → 权威事实来自外部来源。
  4. 能力 jagged 且输出概率化 → 精确性/可靠性需外部验证。
  5. tool call 只是输出 → 外部系统授权、执行并承担后果。
  6. 模型可能混淆数据与指令 → 信任边界不能只靠模型。
- 删除 `Cost Mental Model`；成本、缓存、routing、budget 转 Harness 第 14、17 章。
- 保留 Karpathy “use as tools, do not fully trust” 结语。
- 多模态只留“模型接收编码后的 representation，不是世界本身”；具体 screen/OCR/DOM、安全与成本转 Harness 第 16、5 章。
- 删除 `A Good Harness Makes the Right Thing Easy` 清单。
- 删除 `Checklist for Harness Decisions`。
- 保留最强结尾句并增加可点击的 companion README 与主题导航。
- 要点缩成：正确分配责任、由模型属性推导边界、不把流畅输出等同于可靠系统。

**目标纲要**

把模型放进正确的框里 → 模型—系统责任边界 → jagged capability → 从 Foundations 到 Harness → 最该记住的一句话。

## 非章节文件联动清单

### `llm-foundations/README.md` 与 `llm-foundations-zh/README.md`

- 改书名副标题与 Why This Book Exists，使本书面向使用 LLM 的工程师，而不是把 harness 作为唯一叙事主语。
- 更新第 1、2、4、5、6、7、9、10、11、12、13、14 章 focus 文案。
- 阅读路径改为：
  - 第 1–7 章：模型机制。
  - 第 8–13 章：prompting、context、knowledge、retrieval、tools、evaluation 的模型边界。
  - 第 14 章：责任边界与 companion 导读。
- 删除“第 8–14 章理解 harness design”的笼统表述，改为“理解模型行为对系统边界的含义”。

### `source-map.md`

- 按删除/迁移后的内容更新第 14 章多模态与 long-running 标记。
- 保留第 14 章“不完全信任”映射。
- 检查第 2、8、12 章的 tool/multimodal/reasoning 标记是否仍准确。

### `glossary.md`

- 检查被移出 Foundations 正文的 MCP、sandbox、trace、long-running harness 等定义；若无正文引用，删除或改成 companion 链接。
- 统一 behavior/capability、context window/KV cache/provider prompt caching、abstention/refusal、token/retrieval embedding 等术语。

### Companion 反向引用

- `agent-harness/04-tools-agent-computer-interface.md`：不再声称 Foundations 第 12 章讲 MCP transport。
- `agent-harness/05-sandboxing-guardrails.md` 与 glossary：prompt injection 的 Foundations 引用只保留第 8 章。
- `agent-harness/10-evaluation.md`：确认 Foundations 第 13 章对 capability eval 的定义匹配。
- `agent-harness/01-what-is-an-agent-harness.md`：可在 model-defect → harness-control 处反向链接 Foundations 第 14 章。
- 中英文 companion 文件同步更新。

## 第二轮编辑验收标准

1. 中英文每章结构镜像，事实和范围一致。
2. 第 1–7 章不再有独立 `Harness Implications` 或同类 checklist。
3. 第 8–14 章只在确有必要时出现最小模型—系统边界，不复述 companion 实现。
4. 不留下失效的章节标题、锚点、README focus、source-map 或 companion 反向引用。
5. 修复审阅中发现的技术错误：
   - greedy 不等于 sampling；
   - post-training 不使用“同一个参数文件”；
   - BPE 不都以 raw byte 为基础；
   - BM25 不是 exact string matching；
   - pass@k/pass^k、seed/reproducibility 表述准确；
   - KV cache/prefill/decode 复杂度与内存表述准确；
   - context/delimiter 不是安全 enforcement boundary；
   - refusal、abstention、network failure 不混为一类；
   - tool-call idempotency 绑定真实副作用操作。
6. Markdown 链接、标题层级、代码块和 Mermaid 均通过构建。
7. 重新生成并检查两本 LLM Foundations 的 HTML/PDF 产物。
