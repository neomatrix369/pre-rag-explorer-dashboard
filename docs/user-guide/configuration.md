# Configuration

## Environment Variables

Copy the example file and edit as needed:

```bash
cp .env.example .env.local
```

Or create `.env.local` manually:

```bash
GEMINI_API_KEY=your_api_key_here
```

> **Note**: Core functionality uses in-browser embeddings from the model registry and does not require an API key. `GEMINI_API_KEY` is optional for future Gemini integration.
