/**
 * Multi-Modal Codebase Search Engine
 * Supports filename, symbol, exact text matching, and type filtering.
 * Designed with a clean interface for adding vector/semantic embeddings later.
 */
export class SearchIndex {
  constructor(files = []) {
    this.files = files;
    this.symbolIndex = [];
    this.rebuildIndex();
  }

  rebuildIndex() {
    this.symbolIndex = [];
    for (const file of this.files) {
      if (file.symbols) {
        for (const sym of file.symbols) {
          this.symbolIndex.push({
            file: file.relativePath,
            symbol: sym
          });
        }
      }
    }
  }

  search({ query, type = 'all', language = null, maxResults = 50 }) {
    if (!query || query.trim().length === 0) return [];

    const lowerQuery = query.toLowerCase().trim();
    const results = [];

    // 1. Filename search
    if (type === 'all' || type === 'file') {
      for (const file of this.files) {
        if (language && file.language !== language) continue;

        if (file.relativePath.toLowerCase().includes(lowerQuery) || file.name.toLowerCase().includes(lowerQuery)) {
          const isExact = file.name.toLowerCase() === lowerQuery;
          results.push({
            type: 'file',
            file: file.relativePath,
            score: isExact ? 100 : 70,
            snippet: `${file.language} · ${file.lineCount} lines · ${(file.sizeBytes / 1024).toFixed(1)} KB`
          });
        }
      }
    }

    // 2. Symbol search
    if (type === 'all' || type === 'symbol') {
      for (const item of this.symbolIndex) {
        const symName = item.symbol.name.toLowerCase();
        if (symName.includes(lowerQuery)) {
          const isExact = symName === lowerQuery;
          results.push({
            type: 'symbol',
            file: item.file,
            symbolName: item.symbol.name,
            symbolKind: item.symbol.kind,
            line: item.symbol.lineStart,
            score: isExact ? 95 : 65,
            snippet: item.symbol.signature || `${item.symbol.kind} ${item.symbol.name}`
          });
        }
      }
    }

    // 3. Text content search
    if (type === 'all' || type === 'text') {
      for (const file of this.files) {
        if (language && file.language !== language) continue;
        if (!file.content || file.isBinary) continue;

        const lines = file.content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const lineText = lines[i];
          if (lineText.toLowerCase().includes(lowerQuery)) {
            results.push({
              type: 'text',
              file: file.relativePath,
              line: i + 1,
              score: 50,
              snippet: lineText.trim()
            });

            if (results.length >= maxResults * 2) break;
          }
        }
      }
    }

    // Sort by relevance score descending
    return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
  }
}
