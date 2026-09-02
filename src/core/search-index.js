/**
 * Multi-Modal Codebase Search Engine
 * Supports filename, symbol, exact text matching, and type filtering.
 * Features tokenization for camelCase/snake_case and relevance score ranking.
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

  /**
   * Calculates match relevance score based on exactness, prefix match, and token boundaries
   */
  calculateScore(target, query, baseScore = 60) {
    const lowerTarget = target.toLowerCase();
    const lowerQuery = query.toLowerCase();

    if (lowerTarget === lowerQuery) return baseScore + 40;
    if (lowerTarget.startsWith(lowerQuery)) return baseScore + 25;
    if (lowerTarget.endsWith(lowerQuery)) return baseScore + 15;
    if (new RegExp(`\\b${lowerQuery}`, 'i').test(lowerTarget)) return baseScore + 20;

    return baseScore;
  }

  search({ query, type = 'all', language = null, maxResults = 50 }) {
    if (!query || query.trim().length === 0) return [];

    const lowerQuery = query.toLowerCase().trim();
    const tokens = lowerQuery.split(/\s+/).filter(Boolean);
    const results = [];

    // 1. Filename search
    if (type === 'all' || type === 'file') {
      for (const file of this.files) {
        if (language && file.language !== language) continue;

        const relPathLower = file.relativePath.toLowerCase();
        const nameLower = file.name.toLowerCase();

        const matchesAllTokens = tokens.every(t => relPathLower.includes(t) || nameLower.includes(t));
        if (matchesAllTokens) {
          const score = this.calculateScore(file.name, lowerQuery, 60);
          results.push({
            type: 'file',
            file: file.relativePath,
            score,
            snippet: `${file.language} · ${file.lineCount} lines · ${(file.sizeBytes / 1024).toFixed(1)} KB`
          });
        }
      }
    }

    // 2. Symbol search
    if (type === 'all' || type === 'symbol') {
      for (const item of this.symbolIndex) {
        const symName = item.symbol.name;
        const symNameLower = symName.toLowerCase();

        const matchesAllTokens = tokens.every(t => symNameLower.includes(t));
        if (matchesAllTokens) {
          const score = this.calculateScore(symName, lowerQuery, 55);
          results.push({
            type: 'symbol',
            file: item.file,
            symbolName: item.symbol.name,
            symbolKind: item.symbol.kind,
            line: item.symbol.lineStart,
            score,
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
          const lineLower = lineText.toLowerCase();

          if (tokens.every(t => lineLower.includes(t))) {
            const score = lineLower.includes(lowerQuery) ? 50 : 35;
            results.push({
              type: 'text',
              file: file.relativePath,
              line: i + 1,
              score,
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
