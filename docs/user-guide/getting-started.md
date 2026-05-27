# Getting Started

## Key Features

- **6 Chunking Strategies**
  - Fixed-size chunking
  - Recursive character splitting
  - Token-based chunking
  - Sentence-based chunking
  - Semantic grouping
  - Sliding window (stride-based overlap)

- **3 Retrieval Methods**
  - Dense retrieval (cosine similarity)
  - Sparse retrieval (BM25)
  - Hybrid search (combined scoring)

- **Multi-Model Embedding Registry**
  - Select from registered models in Process view (dropdown + metadata tooltips)
  - **all-MiniLM-L6-v2** (~23MB) — fast general-purpose embeddings
  - **BGE Small EN v1.5** (~33MB) — optimized for retrieval tasks
  - Both produce 384-dimensional vectors; collections are tagged by model

- **In-Browser ML Processing**
  - Transformers.js runs entirely in the browser (no server-side processing)
  - Models lazy-load on first use and cache in browser storage
  - No data leaves your machine

- **Multiple File Formats**
  - Plain text (.txt)
  - CSV files
  - PDF documents
  - Markdown (.md)

- **Experiment Tracking**
  - Compare chunking strategies
  - Track processing times
  - Analyze chunk distributions
  - Persistent experiment history

- **Browser-Based Storage**
  - IndexedDB for vector collections
  - localStorage for experiments
  - No external database required

---

## Usage Workflow

> **100% Browser-Based**: The entire workflow below runs entirely in your browser. The ML embedding model is downloaded and cached locally on first load, all document parsing, chunking, embedding generation, and search happens client-side, and all data is stored in browser storage (IndexedDB and localStorage). No data ever leaves your machine. Stored items can be individually or bulk deleted via the Collections Manager.

1. **Upload Documents**
   - Drag and drop or select files (text, CSV, PDF, markdown)
   - Files are parsed and stored in browser

2. **Process & Chunk**
   - Select an embedding model from the registry dropdown
   - Select one or more chunking methods (parameter tooltips explain each field)
   - Configure parameters (chunk size, overlap, etc.)
   - Generate embeddings using the selected in-browser model
   - Track processing status in real-time

3. **Search & Explore**
   - Enter natural language queries
   - Choose retrieval method (dense, sparse, hybrid)
   - Search across collections grouped by embedding model
   - View ranked results with similarity scores
   - Compare results across chunking strategies and models

4. **Manage Collections**
   - View all vector collections
   - Delete unused collections
   - Export experiment data
   - Clear all data if needed
