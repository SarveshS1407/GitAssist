#!/usr/bin/env node

import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { RepositoryScanner } from '../src/core/scanner.js';
import { CodeParser } from '../src/core/parser.js';
import { GitAnalyzer } from '../src/core/git-analyzer.js';
import { DependencyAnalyzer } from '../src/core/dependency-graph.js';
import { HotspotAnalyzer } from '../src/core/hotspot-analyzer.js';
import { CodeMetrics } from '../src/core/metrics.js';
import { MermaidGenerator } from '../src/core/mermaid-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const command = args[0] || 'help';

function printHelp() {
  console.log(`
⚡ GitAssist CLI - Intelligent Codebase Intelligence & Git Archaeology

Usage:
  gitassist <command> [options]

Commands:
  scan [path]                 Scan and analyze a repository folder (default: current directory)
  hotspots [path]             Identify high-churn & high-risk architectural hotspots
  complexity [path]           Calculate cyclomatic complexity & maintainability scores
  diagram [path]              Generate Mermaid.js dependency diagram markdown
  server [--port <port>]      Start the GitAssist local web dashboard (default port: 3333)
  help                        Show this help message

Examples:
  gitassist scan .
  gitassist hotspots .
  gitassist complexity .
  gitassist diagram .
  gitassist server --port 4000
`);
}

async function runScan(targetArg) {
  const targetPath = path.resolve(targetArg || process.cwd());
  console.log(`\n🔍 Scanning repository at: ${targetPath}...\n`);

  const scanner = new RepositoryScanner();
  const scanResult = await scanner.scan(targetPath);

  for (const file of scanResult.files) {
    const parsed = CodeParser.parseFile(file);
    file.symbols = parsed.symbols;
    file.imports = parsed.imports;
    file.exports = parsed.exports;
  }

  const dependencyGraph = DependencyAnalyzer.buildGraph(scanResult.files);
  const gitAnalyzer = new GitAnalyzer(targetPath);

  let branch = 'unknown';
  let commits = [];
  let contributors = [];

  if (scanResult.isValidGit) {
    branch = await gitAnalyzer.getCurrentBranch();
    commits = await gitAnalyzer.getCommitHistory(50);
    contributors = await gitAnalyzer.getContributors(commits);
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  🏛️  Repository: ${scanResult.name}`);
  console.log(`  🌿  Git Branch: ${branch} (Valid Git: ${scanResult.isValidGit ? 'Yes' : 'No'})`);
  console.log(`  📁  Files / Dirs: ${scanResult.totalFiles} files / ${scanResult.totalDirectories} directories`);
  console.log(`  📝  Total LOC: ${scanResult.totalLines.toLocaleString()} lines`);
  console.log(`  📦  Modules: ${dependencyGraph.modules.length} (${dependencyGraph.edges.length} connections)`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  console.log(`\n📊 Language Distribution:`);
  for (const [lang, stat] of Object.entries(scanResult.languages)) {
    console.log(`  - ${lang.padEnd(14)}: ${String(stat.percentage).padStart(5)}% (${stat.lines.toLocaleString()} lines, ${stat.files} files)`);
  }

  if (contributors.length > 0) {
    console.log(`\n👥 Top Contributors:`);
    for (const c of contributors.slice(0, 5)) {
      console.log(`  - ${c.name.padEnd(20)}: ${c.commitCount} commits (${c.email})`);
    }
  }

  console.log(`\n✅ Scan complete. Launch the UI with: npx gitassist server\n`);
}

async function runHotspots(targetArg) {
  const targetPath = path.resolve(targetArg || process.cwd());
  const scanner = new RepositoryScanner();
  const scanResult = await scanner.scan(targetPath);
  const gitAnalyzer = new GitAnalyzer(targetPath);
  const commits = scanResult.isValidGit ? await gitAnalyzer.getCommitHistory(100) : [];

  const hotspots = HotspotAnalyzer.analyzeHotspots(scanResult.files, commits);
  console.log(`\n🔥 Top Architectural Hotspots for ${scanResult.name}:\n`);
  for (const h of hotspots.slice(0, 10)) {
    const badge = h.riskLevel === 'High' ? '🔴 HIGH' : (h.riskLevel === 'Medium' ? '🟡 MED' : '🟢 LOW');
    console.log(`  ${badge.padEnd(8)} [Score: ${String(h.score).padStart(4)}] ${h.relativePath} (${h.lineCount} lines, touched ${h.churnCount} times)`);
  }
  console.log('');
}

async function runComplexity(targetArg) {
  const targetPath = path.resolve(targetArg || process.cwd());
  const scanner = new RepositoryScanner();
  const scanResult = await scanner.scan(targetPath);

  console.log(`\n📈 Code Complexity & Maintainability Breakdown:\n`);
  let totalMi = 0;
  let count = 0;

  for (const f of scanResult.files.slice(0, 15)) {
    try {
      const content = await fs.readFile(path.join(targetPath, f.relativePath), 'utf-8');
      const m = CodeMetrics.calculateFileMetrics(content, f.language);
      totalMi += m.maintainabilityIndex;
      count++;
      console.log(`  - ${f.relativePath.padEnd(35)} MI: ${String(m.maintainabilityIndex).padStart(3)}/100 | Complexity: ${String(m.complexity).padStart(3)} | SLOC: ${m.sloc}`);
    } catch (e) {
      // binary or unreadable file
    }
  }

  if (count > 0) {
    const avgMi = Math.round(totalMi / count);
    console.log(`\n📊 Average Repository Maintainability Index: ${avgMi}/100\n`);
  }
}

async function runDiagram(targetArg) {
  const targetPath = path.resolve(targetArg || process.cwd());
  const scanner = new RepositoryScanner();
  const scanResult = await scanner.scan(targetPath);

  for (const file of scanResult.files) {
    const parsed = CodeParser.parseFile(file);
    file.symbols = parsed.symbols;
    file.imports = parsed.imports;
    file.exports = parsed.exports;
  }

  const dependencyGraph = DependencyAnalyzer.buildGraph(scanResult.files);
  const diagram = MermaidGenerator.generateModuleFlowchart(dependencyGraph);

  console.log(`\n\`\`\`mermaid\n${diagram}\n\`\`\`\n`);
}

async function startServer(portArg) {
  let port = 3333;
  const portIdx = args.indexOf('--port');
  if (portIdx !== -1 && args[portIdx + 1]) {
    port = parseInt(args[portIdx + 1], 10);
  } else if (portArg && !isNaN(parseInt(portArg, 10))) {
    port = parseInt(portArg, 10);
  }

  process.env.PORT = String(port);
  await import('../src/server.js');
}

async function main() {
  switch (command) {
    case 'scan':
      await runScan(args[1]);
      break;
    case 'hotspots':
    case 'churn':
      await runHotspots(args[1]);
      break;
    case 'complexity':
    case 'metrics':
      await runComplexity(args[1]);
      break;
    case 'diagram':
    case 'mermaid':
      await runDiagram(args[1]);
      break;
    case 'server':
    case 'start':
    case 'dev':
      await startServer(args[1]);
      break;
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;
    default:
      if (command.startsWith('/') || command.startsWith('.') || command === '.') {
        await runScan(command);
      } else {
        console.error(`Unknown command: ${command}`);
        printHelp();
        process.exit(1);
      }
  }
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
