# ⚡ GitAssist

[![CI](https://github.com/SarveshS1407/GitAssist/actions/workflows/ci.yml/badge.svg)](https://github.com/SarveshS1407/GitAssist/actions)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tests](https://img.shields.io/badge/tests-16%20passed-brightgreen.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-orange.svg)

> **Intelligent local-first codebase intelligence & Git archaeology platform** for developers, architects, and engineering teams to quickly navigate, analyze, and understand unfamiliar or complex software repositories.

---

## ✨ Features

- 🔍 **Instant Repository Scanning**: Recursively scans and analyzes files, compute LOC, language breakdown, and directory topologies while honoring standard `.gitignore` rules.
- 🌳 **Multi-Language AST & Symbol Extraction**: Extracts classes, functions, interfaces, type aliases, imports, and exports from JavaScript, TypeScript, Python, Rust, Go, Java, and C/C++.
- 🕸️ **Interactive Dependency Graph**: Builds visual topologies showing module relationships, import couplings, and circular dependencies.
- 🏛️ **Git Archaeology & Churn Analysis**: Non-destructive, read-only inspection of commit history, top contributors, active branches, and working tree churn.
- ⚡ **Multi-Modal Code Search**: Fast in-memory search across file paths, symbol declarations, and text content.
- 🤖 **AI-Ready Context Packaging**: Formats extracted repo architecture and symbol relationships into structured context windows optimized for LLMs.
- 📊 **Export Reports**: Generate comprehensive Markdown and JSON architecture reports for documentation and onboarding.

---

## 🚀 Quick Start

### 1. Installation & Setup
Clone the repository and install (no heavy external dependencies required; runs natively on Node.js 18+):

```bash
git clone https://github.com/SarveshS1407/GitAssist.git
cd GitAssist
```

### 2. Start the Local Intelligence Dashboard
```bash
npm run dev
# or: node src/server.js
```
Open your browser at **`http://localhost:3333`** to access the interactive web dashboard.

### 3. Run via CLI
```bash
# Run standalone scan from terminal
node bin/gitassist.js scan .

# Start server on custom port
PORT=4000 node bin/gitassist.js server
```

---

## 🧱 Architecture Overview

```text
Target Repository Path
          │
          ▼
    [RepositoryScanner] ──► Recursively filters ignores, computes LOC & byte sizes
          │
          ├─► [LanguageDetector] ──► Multi-language mapping & distribution stats
          │
          ├─► [CodeParser] ────────► AST & Regex symbol, import, and export extractor
          │
          ├─► [GitAnalyzer] ───────► Read-only Git history, churn, & contributor metrics
          │
          ├─► [DependencyAnalyzer] ─► File & module dependency graph topology
          │
          └─► [SearchIndex] ───────► Multi-modal file, symbol, & text search
                │
                ▼
  [AI Context Packager & Web UI Dashboard]
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/scan` | Ingest and scan a local repository path (`{ "repoPath": "/path/to/repo" }`) |
| `GET` | `/api/status` | Health check and current active repository status |
| `GET` | `/api/search?q=query&type=all` | Query search index (types: `all`, `file`, `symbol`, `text`) |
| `GET` | `/api/file?path=relativePath` | Get detailed AST symbols and metadata for a specific file |
| `GET` | `/api/export?format=markdown` | Export comprehensive repository report as Markdown or JSON |

---

## 🧪 Testing

Run the built-in automated test suite:

```bash
npm test
```

---

## 📄 License

MIT License © 2026 GitAssist Contributors
