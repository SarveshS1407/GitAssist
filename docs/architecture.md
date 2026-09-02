# ⚡ GitAssist — System Architecture

## Overview
**GitAssist** is a local-first, zero-dependency software archaeology platform designed to inspect, analyze, and map unknown codebases.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Spatial Holomap & UI Layer                      │
│     (AppShell, Router, 3D Strata Deck, Artifact Dossier Blade)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST API (port 3333)
┌───────────────────────────────────▼────────────────────────────────────┐
│                          API Dispatcher Layer                          │
│        (routes.js: /api/repository/*, /api/metrics, /api/diagram)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                       Application Services Layer                       │
│     (RepositoryService: scan orchestration; GitService: read-only)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                       Core Algorithmic Engines                         │
│  • Scanner (file walker)             • Parser (AST symbol extraction)  │
│  • DependencyGraph (module topology) • CircularDetector (DFS cycles)   │
│  • CodeMetrics (Halstead / MI)       • HotspotAnalyzer (churn risk)    │
└────────────────────────────────────────────────────────────────────────┘
```

## Subsystem Breakdown
1. **`src/core/scanner.js`**: Recursive asynchronous filesystem scanner ignoring `.git`, `node_modules`, and binary assets.
2. **`src/core/parser.js`**: Regex-based AST symbol extractor capturing classes, functions, imports, and exports for JS, TS, and Python.
3. **`src/core/dependency-graph.js`**: Builds directed module dependency graph from import statements.
4. **`src/core/circular-detector.js`**: Detects circular import loops using Depth-First Search (DFS) graph cycle detection.
5. **`src/core/metrics.js`**: Calculates cyclomatic complexity, source lines of code (SLOC), and maintainability index (MI).
6. **`src/core/hotspot-analyzer.js`**: Correlates file size and Git churn frequency to compute architectural risk scores.
7. **`src/services/git-service.js`**: Strictly read-only Git query engine extracting commit lineages and branch metadata.
8. **`src/ui/`**: Pure native ES Module frontend featuring the **Archaeological Strata & Holomap** interface.
