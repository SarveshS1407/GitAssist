/**
 * Codebase Archaeologist - Core Data Types & Interfaces
 */

export interface RepositorySummary {
  path: string;
  name: string;
  isValidGit: boolean;
  branch: string;
  headCommit: string;
  totalFiles: number;
  totalLines: number;
  totalSizeBytes: number;
  languages: Record<string, { files: number; lines: number; percentage: number }>;
  workingTreeStatus: {
    clean: boolean;
    modified: string[];
    added: string[];
    deleted: string[];
    untracked: string[];
  };
}

export interface CodeSymbol {
  name: string;
  kind: 'function' | 'class' | 'interface' | 'variable' | 'type' | 'enum' | 'struct' | 'method';
  lineStart: number;
  lineEnd: number;
  exported: boolean;
  signature?: string;
  docstring?: string;
}

export interface CodeImport {
  source: string;
  resolvedPath?: string;
  specifiers: string[];
  isDefault: boolean;
  isDynamic: boolean;
  line: number;
}

export interface CodeExport {
  name: string;
  isDefault: boolean;
  line: number;
  kind?: string;
}

export interface FileAnalysis {
  path: string;
  relativePath: string;
  name: string;
  extension: string;
  language: string;
  sizeBytes: number;
  lineCount: number;
  content?: string;
  symbols: CodeSymbol[];
  imports: CodeImport[];
  exports: CodeExport[];
  lastModified: string;
  gitHistorySummary?: {
    commitCount: number;
    lastCommitHash: string;
    lastCommitMessage: string;
    lastCommitAuthor: string;
    lastCommitDate: string;
    topContributors: string[];
  };
}

export interface GitCommit {
  hash: string;
  shortHash: string;
  authorName: string;
  authorEmail: string;
  date: string;
  timestamp: number;
  message: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
  changedFiles: Array<{
    file: string;
    status: 'added' | 'modified' | 'deleted';
    insertions: number;
    deletions: number;
  }>;
}

export interface Contributor {
  name: string;
  email: string;
  commitCount: number;
  linesAdded: number;
  linesDeleted: number;
  firstCommitDate: string;
  lastCommitDate: string;
  topFiles: string[];
  ownershipScore: number;
}

export interface DependencyNode {
  id: string; // relative path
  label: string;
  language: string;
  module: string;
  lineCount: number;
  symbolCount: number;
}

export interface DependencyEdge {
  source: string;
  target: string;
  importCount: number;
  imports: string[];
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  modules: string[];
}

export interface SearchResult {
  type: 'file' | 'symbol' | 'text';
  file: string;
  line?: number;
  symbolName?: string;
  symbolKind?: string;
  snippet?: string;
  score: number;
}

export interface AIAnalysisRequest {
  query: string;
  contextScope: 'repository' | 'module' | 'file' | 'git_history';
  targetPath?: string;
  commitRange?: [string, string];
}

export interface AIAnalysisResponse {
  answer: string;
  citations: Array<{ file: string; lineRange?: [number, number]; commitHash?: string }>;
  suggestedFollowUps: string[];
}
