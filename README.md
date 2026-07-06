# Agentic AI Study

A curated study repository on agentic AI systems and harness engineering. Each topic is organized as its own folder with detailed, chapter-by-chapter coverage drawn from primary sources.

More topics will be added as the field evolves.

---

## Topics

| Topic | Description |
|-------|-------------|
| [Agent Harness](./agent-harness/) | A practitioner's textbook on harness engineering — the system that surrounds a language model when it does real work. Covers the ETCLOVG harness layers: execution, tools, context, lifecycle, observability, verification, and governance. |
| [Agent Harness 中文版](./agent-harness-zh/) | Agent Harness 教材的中文版本，沿用相同的章节结构、引用体系和核心内容。 |
| [LLM Foundations](./llm-foundations/) | A practitioner's textbook on large language model fundamentals for harness engineering. Covers tokenization, next-token prediction, Transformers, post-training, context windows, retrieval, tool use, and evaluation. |
| [LLM Foundations 中文版](./llm-foundations-zh/) | 面向 Harness Engineering 的 LLM 基础教材中文版，覆盖 tokenization、next-token prediction、Transformer、post-training、上下文窗口、检索、工具使用和评估。 |

---

## Building the Books (HTML & PDF)

All four books can be rendered to self-contained **HTML** and print-ready **PDF** with the build tool in [`tools/`](./tools/). Each book is bundled into a single file — a generated cover, its numbered chapters, then references and glossary. Mermaid diagrams are rendered to real SVG, and Chinese text uses the system CJK fonts.

**Prerequisites:** [Node.js](https://nodejs.org/) 18+, and — for PDF output — Google Chrome or Chromium.

```bash
cd tools
npm install            # one-time: fetches marked + mermaid

npm run build          # all four books -> ../dist/<book>.html and .pdf
npm run build:html     # HTML only (no browser needed)
npm run build:pdf      # PDF only (reuses the built HTML)

# build a single book by directory name; combine with --html-only / --pdf-only
node build-books.mjs agent-harness
node build-books.mjs llm-foundations-zh --html-only
```

Output lands in `dist/`. The four rendered PDFs are committed there for direct download:

- [Agent Harness (EN)](./dist/agent-harness.pdf) · [中文](./dist/agent-harness-zh.pdf)
- [LLM Foundations (EN)](./dist/llm-foundations.pdf) · [中文](./dist/llm-foundations-zh.pdf)

The (larger) self-contained HTML is git-ignored; regenerate it any time with the commands above.

**Notes**
- PDF generation shells out to headless Chrome. If it isn't found automatically, set `CHROME_PATH` to the browser executable.
- The HTML is fully self-contained (mermaid is inlined), so it opens offline and is easy to share.

---

*Based on the [Awesome Harness Engineering](https://github.com/walkinglabs/awesome-harness-engineering) reading list and the OpenReview survey [Agent Harness Engineering: A Survey](https://openreview.net/pdf?id=3hXEPbG0dh).*
