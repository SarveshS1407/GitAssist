# 🏛️ Codebase Archaeologist (GitAssist)

[![CI](https://github.com/SarveshS1407/GitAssist/actions/workflows/ci.yml/badge.svg)](https://github.com/SarveshS1407/GitAssist/actions)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tests](https://img.shields.io/badge/tests-47%20passed-brightgreen.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-orange.svg)
![Architecture](https://img.shields.io/badge/architecture-local--first-cyan.svg)

> **Intelligent zero-cloud codebase intelligence & digital archaeology platform** for developers, architects, and engineering teams to forensicly excavate, navigate, and deeply understand complex software repositories offline.

---

## ✨ Key Capabilities

- 🚀 **Fast Foundational Excavation**: Sub-100ms structural ingestion across thousands of files, calculating language strata shares, file metrics, and Git HEAD tracking without artificial delays.
- 📡 **Interactive Excavation Sequence HUD**: Phased cyber-radar HUD with concentric coordinate rings, sweeping laser beams, live diagnostic terminal streams, and a digital relic unlock.
- 🎠 **3D Cylindrical Action Carousel**: Interactive carousel presenting 16 archaeological investigation lenses with live Action Dossiers, smooth orbital cards, and keyboard navigation.
- 🕸️ **Living Architecture & Dependency Graphs**: Deterministic module graphs, import coupling maps, and circular dependency detection rendered via interactive Mermaid diagrams.
- 💥 **Impact & Blast Radius Telemetry**: Select any source module to dynamically trace upstream callers, downstream dependents, and compute architectural ripple scores.
- ⚡ **Multi-Modal Code Search**: High-performance in-memory search with tokenization, word-boundary scoring, and filters across file paths, symbols, and text.
- 📊 **Comprehensive Export**: Deterministic export of architectural specifications, subsystem contracts, and strata summaries as Markdown (`.md`) or JSON (`.json`).

---

## 🏛️ 16 Archaeological Investigation Lenses

| # | Lens | Route | Description |
| :---: | :--- | :--- | :--- |
| **01** | **Action Carousel** | `#overview` | 3D orbital carousel of investigation lenses with live Action Dossiers |
| **02** | **Source Explorer** | `#explorer` | Hierarchical directory tree, file metadata, and built-in syntax-highlighted code viewer |
| **03** | **Code Search** | `#search` | Instant search across paths, AST symbols, and text content (`⌘K`) |
| **04** | **Architecture Topology** | `#architecture` | High-level subsystem boundaries and living module dependency graphs |
| **05** | **Impact & Blast Radius** | `#impact` | Upstream caller tracing and ripple risk analysis for any target file |
| **06** | **Feature Mapping** | `#features` | Automatic categorization into Core Logic, UI, APIs, State, and Tests |
| **07** | **Git Chrono-Strata** | `#git` | Temporal commit timeline with branches, authors, and commit hashes |
| **08** | **Drift & Hotspots** | `#analysis` | Code churn analysis crossing commit frequency against file sizes |
| **09** | **Evolutionary Synthesis** | `#archaeology` | Three-epoch evolutionary narrative: Genesis, Active Churn, and Head |
| **10** | **Bug Archaeology** | `#bugs` | Historical bug-fix forensic audit tracing regression commits |
| **11** | **Risk Map** | `#risk` | Heuristic vulnerability ranking based on volatility and cyclomatic metrics |
| **12** | **Test Intelligence** | `#tests` | Test suite inventory, spec ratios, and coverage verification |
| **13** | **Dead Code Signals** | `#deadcode` | Unreferenced leaf modules, orphan exports, and isolated code detection |
| **14** | **Dependency Health** | `#manifests` | Package manifest parser (`package.json`, `Cargo.toml`, `go.mod`, etc.) |
| **15** | **Heuristic Review** | `#review` | Automated code smell auditor checking file size and complexity |
| **16** | **Subsystem Docs** | `#documentation` | Exportable architecture documentation and API contracts |

---

## 🚀 Quick Start

### 1. Installation
Clone the repository (no heavy external database or cloud dependencies required; runs natively on Node.js 18+):

```bash
git clone https://github.com/SarveshS1407/GitAssist.git
cd GitAssist
npm install
```

### 2. Start the Intelligence Server
```bash
npm run dev
# or: node src/server.js
```
Open your browser at **`http://localhost:3333`** to enter the Codebase Archaeologist.

### 3. Excavate Any Repository
- Paste any local filesystem path (e.g. `/Users/username/Desktop/my-project`) or GitHub URL.
- Click **EXCAVATE** to initiate the holographic radar scan and unlock the workspace.

---

## ⌨️ Tactical Keyboard Shortcuts

- **`ArrowLeft` / `ArrowRight`**: Rotate through lenses in the 3D Cylindrical Action Carousel.
- **`Enter`**: Launch the selected investigation lens directly from the carousel.
- **`⌘K` / `Ctrl+K`**: Open Forensic Code Search from anywhere in the app.
- **`1` – `6`**: Jump directly to primary investigation views.

---

## 🧱 Architectural Strata

```text
User Repository (Local Path or Auto-Resolved Remote URL)
                     │
                     ▼
          [RepositoryService] (Fast Foundational Ingestion, < 100ms)
                     │
     ┌───────────────┼───────────────┬────────────────┐
     ▼               ▼               ▼                ▼
[Scanner]   [LanguageDetector]  [GitService]   [DependencyAnalyzer]
(Hierarchy)    (Strata Share)  (Velocity/Log)    (Topology Graph)
     │               │               │                │
     └───────────────┴───────┬───────┴────────────────┘
                             ▼
                  [RepositoryState Store]
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [Excavation Mode HUD]            [Archaeological Workspace]
(Holographic Radar & Relic)        (3D Cylindrical Action Carousel)
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/repository/validate` | Validates target path, permissions, and Git tracking |
| `POST` | `/api/repository/open` | Rapid foundational excavation and summary model creation |
| `GET` | `/api/repository/git` | Lazy Git commit history and contributor metrics |
| `GET` | `/api/repository/git/velocity` | Commit cadence, deployment velocity, and author statistics |
| `GET` | `/api/search?q=...` | Multi-token code search across paths, symbols, and text |
| `GET` | `/api/file?path=...` | Detailed syntax and AST symbol inspection for target file |
| `GET` | `/api/metrics` | Cyclomatic complexity, maintainability, and line metrics |
| `GET` | `/api/hotspots` | Churn hotspot rankings |
| `GET` | `/api/diagram?type=flowchart` | Mermaid diagram syntax generator |
| `GET` | `/api/impact?file=...` | Ripple blast radius and caller dependencies |
| `GET` | `/api/risk` | Heuristic code risk rankings |
| `GET` | `/api/features` | Categorized architectural feature mapping |
| `GET` | `/api/tests` | Test suite inventory and coverage metrics |
| `GET` | `/api/bugs` | Bug fix regression history |
| `GET` | `/api/deadcode` | Isolated module detection |
| `GET` | `/api/manifests` | Package dependency audit |
| `GET` | `/api/review` | Automated code smell review |
| `GET` | `/api/docs` | Subsystem specifications and contracts |
| `GET` | `/api/export?format=markdown` | Download comprehensive audit report (Markdown or JSON) |
| `GET` | `/api/status` | System health and active excavation state |

---

## 🧪 Testing

Run the comprehensive automated test suite (47 unit and E2E tests):

```bash
npm test
```

---

## 📄 License

MIT License © 2026 GitAssist Contributors
