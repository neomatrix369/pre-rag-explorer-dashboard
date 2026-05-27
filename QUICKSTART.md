# Quickstart

Do the following to run the Pre-RAG Explorer Dashboard locally.

> Once setup is done, head to the [README](README.md) for features, workflow, and documentation paths.

---

## 1. Node.js

**Prerequisites:** Node.js 20+ (see `.nvmrc`)

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

---

## 2. Docker (optional — production static build)

Requires [Docker](https://www.docker.com/products/docker-desktop/). Serves the built app via nginx (no hot reload — use `npm run dev` for development).

```bash
./start-services.sh    # build image, start on http://localhost:3000
./stop-services.sh     # stop containers
```

Details: [Contributor development guide](docs/contributor-guide/development.md#docker-optional-production-run).

---

## Next Steps

- [Getting Started](docs/user-guide/getting-started.md) — upload, process, search, and manage collections
- [Chunking & retrieval reference](docs/user-guide/chunking-and-retrieval.md) — method comparison tables
- [Configuration](docs/user-guide/configuration.md) — optional environment variables
- [Troubleshooting](docs/user-guide/troubleshooting.md) — common issues and browser compatibility
