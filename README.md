# Pre-RAG Explorer Dashboard

![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite&logoColor=white)
![Transformers.js](https://img.shields.io/badge/Transformers.js-2.17.2-FF6F00?logo=huggingface&logoColor=white)

A comprehensive Pre-RAG prototype dashboard for document parsing, multi-method chunking, vector embedding generation, and hybrid search exploration. Built with React and powered by in-browser ML models.

**Jump to:** [Screenshots](#screenshots) | [Quick Start](#quick-start) | [Choose Your Path](#choose-your-path) | [Built With](#built-with) | [Contributing](#contributing)

> **Who is this for?**
>
> - **First-time users** — start with [QUICKSTART.md](QUICKSTART.md), then follow [Getting Started](docs/user-guide/getting-started.md).
> - **Explorers comparing chunking/retrieval** — see [Chunking & retrieval reference](docs/user-guide/chunking-and-retrieval.md).
> - **Contributors / extenders** — see [Development Guide](docs/contributor-guide/development.md) and [Architecture](docs/contributor-guide/architecture.md).
> - **Release maintainers** — see [Release Process](docs/contributor-guide/release-process.md).

---

## Screenshots

| Upload Documents | Process & Chunk |
|:---:|:---:|
| ![Upload](docs/images/01-upload.jpg) | ![Process](docs/images/02-process.jpg) |
| *Drag-and-drop file upload with multi-format support* | *6 chunking strategies with configurable parameters* |

| Search Interface | Search Results |
|:---:|:---:|
| ![Search Interface](docs/images/03-search-01.jpg) | ![Search Results](docs/images/03-search-02.jpg) |
| *Natural language query with retrieval method selection* | *Ranked results with similarity scores* |

| Collections Manager |
|:---:|
| ![Collections](docs/images/04-collections.jpg) |
| *Manage vector collections and experiment history* |

---

## Quick Start

**Prerequisites:** Node.js 20+ (see `.nvmrc`)

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

Full setup (including Docker): [QUICKSTART.md](QUICKSTART.md)

---

## Choose Your Path

| I want to… | Start here |
|---|---|
| Run the app locally | [QUICKSTART.md](QUICKSTART.md) |
| Upload, process, search, and manage collections | [Getting Started](docs/user-guide/getting-started.md) |
| Compare chunking and retrieval methods | [Chunking & retrieval reference](docs/user-guide/chunking-and-retrieval.md) |
| Configure optional env vars | [Configuration](docs/user-guide/configuration.md) |
| Fix an error or check browser support | [Troubleshooting](docs/user-guide/troubleshooting.md) |
| Understand the system design | [Architecture](docs/contributor-guide/architecture.md) |
| Set up a development environment | [Development Guide](docs/contributor-guide/development.md) |
| Why browser-only? | [ADR-001](docs/adr/ADR-001-browser-only-architecture.md) |
| Track slice progress | [PROGRESS.md](docs/_internal/PROGRESS.md) |

---

## Built With

**AI/ML Stack**
- ![Transformers.js](https://img.shields.io/badge/Transformers.js-2.17.2-FF6F00?logo=huggingface)
- ![Xenova](https://img.shields.io/badge/Models-MiniLM%20%7C%20BGE-yellow)

**Frontend Stack**
- ![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)
- ![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)
- ![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)

**Data Processing**
- ![PapaParse](https://img.shields.io/badge/PapaParse-5.5.3-green) (CSV parsing)
- IndexedDB (vector storage)

---

## Contributing

See [docs/contributor-guide/development.md](docs/contributor-guide/development.md) for setup, quality gates, and slice workflow.

Before opening a PR, run `./scripts/quality-gates.sh` (matches CI exactly).

**Agent entry points:** [AGENTS.md](AGENTS.md) · [CLAUDE.md](CLAUDE.md)

---

## License

MIT

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>
