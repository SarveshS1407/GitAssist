# 🏛️ Codebase Archaeologist

> Intelligent codebase and Git repository analysis platform for understanding unfamiliar, large, or complex software repositories.

---

## 🚀 Quick Start

### 1. View in Antigravity IDE / Browser
Open [`index.html`](file:///Users/kingpin/.gemini/antigravity/scratch/codebase-archaeologist/index.html) directly in Antigravity IDE's preview or in any browser.

### 2. Start the Local Intelligence Service
```bash
cd /Users/kingpin/.gemini/antigravity/scratch/codebase-archaeologist
node src/server.js
```
Then visit `http://localhost:3333` to analyze any local Git repository interactively.

---

## 🧱 Architecture Overview (Phase 1 Foundation)

```text
Repository Path
      │
      ▼
[RepositoryScanner] ──► Recursively filters ignores, computes LOC & byte sizes
      │
      ├─► [LanguageDetector] ──► Language mapping & stats
      │
      ├─► [CodeParser] ────────► AST & regex symbol, import, export extractor
      │
      ├─► [GitAnalyzer] ───────► Read-only Git history, churn, & contributor metrics
      │
      ├─► [DependencyAnalyzer] ─► File & module dependency graph
      │
      └─► [SearchIndex] ───────► Multi-modal file, symbol, & text search
            │
            ▼
[AI Context Packager & UI Dashboard]
```

---

## 📁 Project Structure

```
codebase-archaeologist/
├── index.html                 # Interactive Developer Intelligence Dashboard
├── package.json               # Package manifest
├── README.md                  # Documentation
└── src/
    ├── types.ts               # Core TypeScript data definitions
    ├── server.js              # Native lightweight HTTP API service
    ├── core/
    │   ├── scanner.js         # Recursive repository scanner & ignore engine
    │   ├── language-detector.js# Extension & syntax language classifier
    │   ├── parser.js          # AST/regex symbol, import, & export extractor
    │   ├── git-analyzer.js    # Non-destructive read-only Git archaeologist
    │   ├── dependency-graph.js# Module & import topology graph builder
    │   └── search-index.js    # Multi-modal search index
    └── ai/
        └── interfaces.js      # Future AI layer context packager & abstraction
```
