# 参考文献

*Agent Harness：实践者教材* 的完整书目。

---

## 基础（前置）

- *LLM Foundations for Harness Engineering* —— 本书所依赖的前置 stage-1 卷。
  [../llm-foundations-zh/](../llm-foundations-zh/)

---

## 基础

- OpenAI, *Harness Engineering: Leveraging Codex in an Agent-First World*, Feb 2026.
  https://openai.com/index/harness-engineering/

- *Agent Harness Engineering: A Survey*, OpenReview / TMLR submission, 2026.
  https://openreview.net/pdf?id=3hXEPbG0dh

- Justin Young et al., *Effective Harnesses for Long-Running Agents*, Anthropic, Nov 2025.  
  https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

- Prithvi Rajasekaran, *Harness Design for Long-Running Application Development*, Anthropic, Mar 2026.  
  https://www.anthropic.com/engineering/harness-design-long-running-apps

- Vivek Trivedy, *The Anatomy of an Agent Harness*, LangChain, Mar 2026.  
  https://blog.langchain.com/the-anatomy-of-an-agent-harness/

- Birgitta Böckeler, *Harness Engineering for Coding Agent Users*, Thoughtworks / martinfowler.com, Apr 2026.  
  https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html

- Erik Schluntz and Barry Zhang, *Building Effective Agents*, Anthropic, Dec 2024.  
  https://www.anthropic.com/engineering/building-effective-agents

- Shunyu Yao et al., *ReAct: Synergizing Reasoning and Acting in Language Models*, arXiv, Oct 2022.
  https://arxiv.org/abs/2210.03629

- Kyle Brunet, *Skill Issue: Harness Engineering for Coding Agents*, HumanLayer, Mar 2026.  
  https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents

---

## 上下文、记忆与工作状态

- Anthropic Applied AI Team, *Effective Context Engineering for AI Agents*, Anthropic, Sep 2025.  
  https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

- Yichao 'Peak' Ji, *Context Engineering for AI Agents: Lessons from Building Manus*, Manus, Jul 2025.  
  https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus

- Charles Packer et al., *MemGPT: Towards LLMs as Operating Systems*, arXiv, Oct 2023.
  https://arxiv.org/abs/2310.08560

- Prateek Chhikara et al., *Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory*, arXiv, Apr 2025.
  https://arxiv.org/abs/2504.19413

- Kevin Lin et al., *Sleep-time Compute: Beyond Inference Scaling at Test-time*, arXiv, Apr 2025.
  https://arxiv.org/abs/2504.13171

---

## 工具与约束

- Ken Aizawa, *Writing Effective Tools for Agents — with Agents*, Anthropic, Sep 2025.  
  https://www.anthropic.com/engineering/writing-tools-for-agents

- Adam Jones and Conor Kelly, *Code Execution with MCP: Building More Efficient Agents*, Anthropic, Nov 2025.  
  https://www.anthropic.com/engineering/code-execution-with-mcp

- David Dworken and Oliver Weller-Davies, *Beyond Permission Prompts: Making Claude Code More Secure and Autonomous*, Anthropic, Oct 2025.  
  https://www.anthropic.com/engineering/claude-code-sandboxing

- Simon Willison, *The lethal trifecta for AI agents: private data, untrusted content, and external communication*, Jun 2025.
  https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/

- *Agent2Agent (A2A) Protocol*, Google / Linux Foundation, 2025.
  https://github.com/a2aproject/A2A

- Linux Foundation, *Linux Foundation Launches the Agent2Agent Protocol Project*, Jun 2025.
  https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents

- OpenAI, *Connect Private MCP Servers to OpenAI Products*, Jun 2026.
  https://developers.openai.com/blog/connect-private-mcp-servers-to-openai-products

- OpenAI, *Programmatic Tool Calling*, 2026.
  https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling

---

## 规格与工作流设计

- Dex Horthy, *12-Factor Agents*, HumanLayer, Apr 2025.  
  https://www.humanlayer.dev/blog/12-factor-agents

---

## 推理与规划模式

（另见“基础”中的 *ReAct*，即推理-行动的基础模式。）

- Noah Shinn et al., *Reflexion: Language Agents with Verbal Reinforcement Learning*, arXiv, Mar 2023.
  https://arxiv.org/abs/2303.11366

- Aman Madaan et al., *Self-Refine: Iterative Refinement with Self-Feedback*, arXiv, Mar 2023.
  https://arxiv.org/abs/2303.17651

- Zhibin Gou et al., *CRITIC: Large Language Models Can Self-Correct with Tool-Interactive Critiquing*, arXiv, May 2023.
  https://arxiv.org/abs/2305.11738

- Shunyu Yao et al., *Tree of Thoughts: Deliberate Problem Solving with Large Language Models*, arXiv, May 2023.
  https://arxiv.org/abs/2305.10601

- Binfeng Xu et al., *ReWOO: Decoupling Reasoning from Observations for Efficient Augmented Language Models*, arXiv, May 2023.
  https://arxiv.org/abs/2305.18323

- Andy Zhou et al., *Language Agent Tree Search Unifies Reasoning, Acting, and Planning in Language Models*, arXiv, Oct 2023.
  https://arxiv.org/abs/2310.04406

---

## 多代理系统

- Mert Cemri et al., *Why Do Multi-Agent LLM Systems Fail?*（提出 MAST 失败分类法）, UC Berkeley / arXiv, Mar 2025.
  https://arxiv.org/abs/2503.13657

---

## 可靠性与运营安全

- Temporal, *Durable Execution Meets AI: Why Temporal Is the Perfect Foundation for AI*, 2025.
  https://temporal.io/blog/durable-execution-meets-ai-why-temporal-is-the-perfect-foundation-for-ai

- LangChain, *Durable Execution* (LangGraph documentation), 2025.
  https://docs.langchain.com/oss/python/langgraph/durable-execution

- Martin Fowler, *CircuitBreaker*, martinfowler.com, Mar 2014.
  https://martinfowler.com/bliki/CircuitBreaker.html

- Thinkst, *Canarytokens* (free tripwire tokens).
  https://canarytokens.org/

- Anthropic Safeguards Research Team, *How We Contain Claude*, May 2026.
  https://www.anthropic.com/engineering/how-we-contain-claude

- Google Cloud, *Agent Executor: Google's Distributed Agent Runtime*, 2026.
  https://cloud.google.com/blog/products/ai-machine-learning/agent-executor-googles-distributed-agent-runtime/

---

## Agent 能力度量

- Thomas Kwa et al., *Measuring AI Ability to Complete Long Tasks*, METR / arXiv, Mar 2025.
  https://arxiv.org/abs/2503.14499

- METR，*Task-Completion Time Horizons of Frontier AI Models*，更新于 2026 年 5 月 8 日。
  https://metr.org/time-horizons/

- Joel Becker，*Clarifying Limitations of Time Horizon*，METR，2026 年 1 月 22 日。
  https://metr.org/notes/2026-01-22-time-horizon-limitations/

---

## Loop Engineering（循环工程）

- Addy Osmani, *Loop Engineering*, addyosmani.com, Jun 2026.  
  https://addyosmani.com/blog/loop-engineering/

- *Loop Engineering*, O'Reilly Radar, 2026.  
  https://www.oreilly.com/radar/loop-engineering/

- Andrew Ng, *Three Loops for Building 0-to-1 AI Products*, The Batch, Jun 2026.  
  https://www.deeplearning.ai/the-batch/

- *The Anthropic leader who built Claude Code ditched prompting — now he writes loops*, The New Stack, 2026.  
  https://thenewstack.io/loop-engineering/

- *The Agentic Loop: A Practical Field Guide*, DEV Community, 2026.  
  https://dev.to/truongpx396/the-agentic-loop-a-practical-field-guide-mnc

- *Loop Engineering Guide (2026)*, AI Builder Club.  
  https://www.aibuilderclub.com/blog/loop-engineering-guide-2026

- *Loop Engineering Crash Course*, The AI Agent Factory (Panaversity).  
  https://agentfactory.panaversity.org/docs/loop-engineering-crash-course

---

## 评估与可观测性

- Mikaela Grace et al., *Demystifying Evals for AI Agents*, Anthropic, Jan 2026.  
  https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents

- Gian Segato, *Quantifying Infrastructure Noise in Agentic Coding Evals*, Anthropic, Feb 2026.  
  https://www.anthropic.com/engineering/infrastructure-noise

- Vivek Trivedy, *Improving Deep Agents with Harness Engineering*, LangChain, Feb 2026.  
  https://blog.langchain.com/improving-deep-agents-with-harness-engineering/

- OpenTelemetry, *Semantic conventions for generative AI spans*.
  https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/

- Anthropic Safeguards Research Team, *Agentic Misalignment: Summer 2026 Update*, 2026.
  https://alignment.anthropic.com/2026/agentic-misalignment-summer-2026/

- OpenAI, *Trustworthy Third-Party Evaluations: Foundations*, 2026.
  https://openai.com/index/trustworthy-third-party-evaluations-foundations/

- OpenAI, *Building Self-Improving Tax Agents with Codex*, 2026.
  https://openai.com/index/building-self-improving-tax-agents-with-codex/

---

## 运行时、Harness 与参考实现

- Harrison Chase, *Agent Frameworks, Runtimes, and Harnesses, Oh My!*, LangChain, Oct 2025.  
  https://blog.langchain.com/agent-frameworks-runtimes-and-harnesses-oh-my/

- Jeremy Hadfield et al., *How We Built Our Multi-Agent Research System*, Anthropic, Jun 2025.  
  https://www.anthropic.com/engineering/multi-agent-research-system

---

## 指令与 Prompting

- Eric Wallace et al., *The Instruction Hierarchy: Training LLMs to Prioritize Privileged Instructions*, OpenAI, Apr 2024.
  https://arxiv.org/abs/2404.13208

- OpenAI, *Custom Code Review Rules for Codex*, Jul 2026.
  https://developers.openai.com/blog/custom-code-review-rules-for-codex

---

## 模型选择、路由与推理

- Isaac Ong et al., *RouteLLM: Learning to Route LLMs with Preference Data*, 2024.
  https://arxiv.org/abs/2406.18665

- Lingjiao Chen, Matei Zaharia, and James Zou, *FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance*, 2023.
  https://arxiv.org/abs/2305.05176

- Charlie Snell et al., *Scaling LLM Test-Time Compute Optimally Can Be More Effective Than Scaling Model Parameters*, 2024.
  https://arxiv.org/abs/2408.03314

- DeepSeek-AI, *DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning*, 2025.
  https://arxiv.org/abs/2501.12948

- LiteLLM (BerriAI), *Python SDK and Proxy Server (AI Gateway)*.
  https://github.com/BerriAI/litellm

- Portkey, *AI Gateway*.
  https://github.com/Portkey-AI/gateway

---

## 人–Agent 交互

- Saleema Amershi et al., *Guidelines for Human-AI Interaction*, CHI 2019.
  https://www.microsoft.com/en-us/research/publication/guidelines-for-human-ai-interaction/

- Eric Horvitz, *Principles of Mixed-Initiative User Interfaces*, CHI 1999.
  https://www.microsoft.com/en-us/research/publication/principles-of-mixed-initiative-user-interfaces/

---

## Computer-Use 与多模态 Agent

- Anthropic, *Introducing computer use, a new Claude 3.5 Sonnet, and Claude 3.5 Haiku*, Oct 2024.
  https://www.anthropic.com/news/3-5-models-and-computer-use

- OpenAI, *Computer-Using Agent (Operator)*, Jan 2025.
  https://openai.com/index/computer-using-agent/

- Jianwei Yang et al., *Set-of-Mark Prompting Unleashes Extraordinary Visual Grounding in GPT-4V*, 2023.
  https://arxiv.org/abs/2310.11441

- Boyuan Zheng et al., *GPT-4V(ision) is a Generalist Web Agent, if Grounded* (SeeAct), 2024.
  https://arxiv.org/abs/2401.01614

- Shuyan Zhou et al., *WebArena: A Realistic Web Environment for Building Autonomous Agents*, 2023.
  https://arxiv.org/abs/2307.13854

- Tianbao Xie et al., *OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments*, 2024.
  https://arxiv.org/abs/2404.07972

---

## 成本、隐私与治理框架

- AWS, *AgentOps: Operationalize Agentic AI at Scale with Amazon Bedrock AgentCore*, 2026.
  https://aws.amazon.com/blogs/machine-learning/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedrock-agentcore/

- OWASP, *Top 10 for Large Language Model Applications*, 2025.
  https://genai.owasp.org/llm-top-10/

- NIST, *AI Risk Management Framework (AI RMF 1.0)*, 2023.
  https://www.nist.gov/itl/ai-risk-management-framework

- *ISO/IEC 42001:2023 — Information technology — Artificial intelligence — Management system*, ISO, 2023.
  https://www.iso.org/standard/42001

- *Regulation (EU) 2024/1689 (Artificial Intelligence Act)*, European Union, Jun 2024.
  https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng

- Fu Bang, *GPTCache: An Open-Source Semantic Cache for LLM Applications*, NLP-OSS @ EMNLP 2023.
  https://github.com/zilliztech/GPTCache

---

## Agent Fleet、身份与控制平面

- NIST, *Identity and Authorization for Software Agents*, Feb 2026.
  https://www.nist.gov/news-events/news/2026/02/new-concept-paper-identity-and-authority-software-agents

- Google Cloud, *Agent Registry Overview*, 2026.
  https://docs.cloud.google.com/agent-registry/overview

- AWS, *AWS Agent Registry in Amazon Bedrock AgentCore (Preview)*, Apr 2026.
  https://aws.amazon.com/about-aws/whats-new/2026/04/aws-agent-registry-in-agentcore-preview/

- AWS, *Introducing Amazon Bedrock AgentCore Identity: Securing Agentic AI at Scale*, 2026.
  https://aws.amazon.com/blogs/machine-learning/introducing-amazon-bedrock-agentcore-identity-securing-agentic-ai-at-scale/

- Microsoft, *Agent Registry in the Microsoft 365 Admin Center*, 2026.
  https://learn.microsoft.com/en-us/microsoft-365/admin/manage/agent-registry?view=o365-worldwide

---

## 协议、标准与 Provider 契约

本节中可能变化的 provider 文档已于 **2026-07-31** 核验。产品行为、可用性、价格、保留时间与计量方式仍然取决于 provider 与日期。

- OpenAI，*Prompt Caching*。
  https://developers.openai.com/api/docs/guides/prompt-caching

- Anthropic，*Prompt Caching*。
  https://platform.claude.com/docs/en/build-with-claude/prompt-caching

- Eric Wallace et al.，*The Instruction Hierarchy: Training LLMs to Prioritize Privileged Instructions*，2024。
  https://arxiv.org/abs/2404.13208

- Zuxin Liu et al.，*IHEval: Evaluating Language Models on Following the Instruction Hierarchy*，2025。
  https://arxiv.org/abs/2502.08745

- Model Context Protocol，*Tools Specification*，2025-06-18。
  https://modelcontextprotocol.io/specification/2025-06-18/server/tools

- OpenAI，*Computer Use*。
  https://developers.openai.com/api/docs/guides/tools-computer-use

- Anthropic，*Computer Use Tool*。
  https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool

- Anthropic，*How Tool Use Works*。
  https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works

- Anthropic，*Vision*。
  https://platform.claude.com/docs/en/build-with-claude/vision

- OpenTelemetry，*Trace API*。
  https://opentelemetry.io/docs/specs/otel/trace/api/

- Temporal，*History Service Architecture*。
  https://github.com/temporalio/temporal/blob/main/docs/architecture/history-service.md

- NIST，*SP 800-53 Rev. 5: Security and Privacy Controls for Information Systems and Organizations*。
  https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final

- NIST，*Audit — Glossary*。
  https://csrc.nist.gov/glossary/term/audit

- NIST，*Zero Trust Architecture Glossary*。
  https://pages.nist.gov/zero-trust-architecture/glossary.html

- Anthropic，*Contextual Retrieval*，2024 年 9 月。
  https://www.anthropic.com/engineering/contextual-retrieval

- Microsoft Azure API Management，*Enable Semantic Caching for Azure OpenAI APIs*。
  https://learn.microsoft.com/en-us/azure/api-management/azure-openai-enable-semantic-caching

- Microsoft Azure API Management，*Cache Lookup Policy*。
  https://learn.microsoft.com/en-us/azure/api-management/cache-lookup-policy

---

## 正文使用的其他一手资料

本节中可能变化的文档已于 **2026-07-31** 核验。

- A2A Protocol，*Specification*。
  https://a2a-protocol.org/latest/specification/

- Patrick Lewis et al.，*Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*，2020。
  https://arxiv.org/abs/2005.11401

- Tianyu Gao et al.，*Enabling Large Language Models to Generate Text with Citations*，2023。
  https://arxiv.org/abs/2305.14627

- Nelson F. Liu et al.，*Lost in the Middle: How Language Models Use Long Contexts*，2023。
  https://arxiv.org/abs/2307.03172

- Mark Chen et al.，*Evaluating Large Language Models Trained on Code*，2021。
  https://arxiv.org/abs/2107.03374

- OpenAI，*Function Calling*。
  https://developers.openai.com/api/docs/guides/function-calling

- OpenAI，*Images and Vision*。
  https://developers.openai.com/api/docs/guides/images-vision

- OpenAI，*Using the Latest Model*。
  https://developers.openai.com/api/docs/guides/latest-model

- OpenAI，*Your Data / Data Residency Controls*。
  https://developers.openai.com/api/docs/guides/your-data

- OpenAI，*Models*。
  https://developers.openai.com/api/docs/models

- OpenAI，*Model Spec*，2025-10-27。
  https://model-spec.openai.com/2025-10-27

- Anthropic，*Handle Tool Calls*。
  https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls

- Anthropic，*Tool Reference*。
  https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-reference

- Anthropic，*Tool Combinations*。
  https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-combinations

- Anthropic，*Extended Thinking*。
  https://platform.claude.com/docs/en/build-with-claude/extended-thinking

- Model Context Protocol，*Server Features Overview*，2025-06-18。
  https://modelcontextprotocol.io/specification/2025-06-18/server/index

- IETF，*RFC 9110: HTTP Semantics*，2022 年 6 月。
  https://www.rfc-editor.org/rfc/rfc9110.html

- Temporal，*Workflow Execution*。
  https://docs.temporal.io/workflow-execution

- Temporal，*Events and Event History*。
  https://docs.temporal.io/workflow-execution/event

- Temporal，*Activities*。
  https://docs.temporal.io/activities

- Microsoft Azure Architecture Center，*Event Sourcing Pattern*。
  https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing

- Microsoft Azure AI Search，*Security Filters for Trimming Results*。
  https://learn.microsoft.com/en-us/azure/search/search-security-trimming-for-azure-search

- Elasticsearch，*Aliases*。
  https://www.elastic.co/guide/en/elasticsearch/reference/current/aliases.html

- Kubernetes，*Components*。
  https://kubernetes.io/docs/concepts/overview/components/

- Kubernetes，*Resource Management for Pods and Containers*。
  https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/

- Docker，*Building Best Practices*。
  https://docs.docker.com/build/building/best-practices/

- Microsoft Playwright，*Auto-Waiting and Actionability*。
  https://playwright.dev/docs/actionability

- Jeffrey Dean and Luiz André Barroso，*The Tail at Scale*，2013。
  https://research.google/pubs/the-tail-at-scale/

- Geoffrey Huntley，*Ralph Wiggum as a “software engineer”*。
  https://ghuntley.com/ralph/

- OpenTelemetry，*Tracing SDK*。
  https://opentelemetry.io/docs/specs/otel/trace/sdk/

- OpenTelemetry，*Exceptions*。
  https://opentelemetry.io/docs/specs/otel/trace/exceptions/

- W3C，*Trace Context*。
  https://www.w3.org/TR/trace-context/

- W3C，*PROV-DM: The PROV Data Model*。
  https://www.w3.org/TR/prov-dm/

- SPIFFE，*SPIFFE Concepts*。
  https://spiffe.io/docs/latest/spiffe-about/spiffe-concepts/

- IETF，*RFC 8693: OAuth 2.0 Token Exchange*，2020 年 1 月。
  https://www.rfc-editor.org/rfc/rfc8693.html

- IETF，*RFC 7009: OAuth 2.0 Token Revocation*，2013 年 8 月。
  https://www.rfc-editor.org/rfc/rfc7009.html

- NIST，*AI RMF Core*。
  https://airc.nist.gov/airmf-resources/airmf/5-sec-core/

- NIST，*SP 800-61 Rev. 3: Incident Response Recommendations and Considerations for Cybersecurity Risk Management*。
  https://csrc.nist.gov/pubs/sp/800/61/r3/final

- NIST，*Adversarial Machine Learning: A Taxonomy and Terminology of Attacks and Mitigations*，AI 100-2e2025。
  https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-2e2025.pdf

- NIST，*IR 7987: Policy Machine*。
  https://nvlpubs.nist.gov/nistpubs/ir/2014/NIST.IR.7987.pdf

- NIST，*IR 7987 Rev. 1: Policy Machine — Features, Architecture, and Specification*。
  https://nvlpubs.nist.gov/nistpubs/ir/2015/nist.ir.7987r1.pdf

- NIST，*Privacy Framework*。
  https://www.nist.gov/privacy-framework

- NIST/SEMATECH，*Confidence Intervals for a Proportion*。
  https://itl.nist.gov/div898/handbook/prc/section2/prc241.htm

- NIST/SEMATECH，*Analysis of Paired Observations*。
  https://www.itl.nist.gov/div898/handbook/prc/section3/prc311.htm

- NIST/SEMATECH，*Randomized Block Designs*。
  https://www.itl.nist.gov/div898/handbook/pri/section3/pri332.htm

---

## 姊妹卷

- *LLM Foundations for Harness Engineering*（本书的模型内部姊妹卷）。
  ../llm-foundations-zh/

---

## 阅读列表

- *Awesome Harness Engineering*, walkinglabs.  
  https://github.com/walkinglabs/awesome-harness-engineering

- *Learn Harness Engineering — 英文版*, Walking Labs.
  https://walkinglabs.github.io/learn-harness-engineering/en/

- *Learn Harness Engineering — 中文版*, Walking Labs.
  https://walkinglabs.github.io/learn-harness-engineering/zh/

- *Learn Harness Engineering — Skills（英文）*, Walking Labs.
  https://walkinglabs.github.io/learn-harness-engineering/en/skills/

- *Learn Harness Engineering — Skills（中文）*, Walking Labs.
  https://walkinglabs.github.io/learn-harness-engineering/zh/skills/
