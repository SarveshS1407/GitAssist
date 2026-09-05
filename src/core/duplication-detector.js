import crypto from 'node:crypto';

/**
 * DuplicationDetector
 * Identifies exact and structural clone blocks across codebase files
 */
export class DuplicationDetector {
  /**
   * @param {Object} options
   * @param {number} [options.minLines=5] Minimum consecutive lines to count as duplication
   * @param {string[]} [options.ignoreExtensions=['.json', '.lock', '.min.js', '.map', '.svg']]
   */
  constructor(options = {}) {
    this.minLines = options.minLines || 5;
    this.ignoreExtensions = options.ignoreExtensions || ['.json', '.lock', '.min.js', '.map', '.svg', '.png', '.jpg'];
  }

  /**
   * Detect duplicates across an array of file objects
   * @param {Array<{ relativePath: string, content: string }>} files
   * @returns {{ totalDuplicatedLines: number, totalScannedLines: number, duplicationPercentage: number, cloneGroups: Array }}
   */
  detect(files = []) {
    const validFiles = files.filter(f => {
      if (!f || !f.content || typeof f.content !== 'string') return false;
      const lower = f.relativePath.toLowerCase();
      return !this.ignoreExtensions.some(ext => lower.endsWith(ext));
    });

    let totalScannedLines = 0;
    const fileChunks = [];

    for (const file of validFiles) {
      const rawLines = file.content.split(/\r?\n/);
      totalScannedLines += rawLines.length;

      // Extract normalized non-empty lines with original line numbers
      const normalizedLines = [];
      for (let i = 0; i < rawLines.length; i++) {
        const trimmed = this.normalizeLine(rawLines[i]);
        if (trimmed.length > 0) {
          normalizedLines.push({
            origLine: i + 1,
            text: trimmed,
            raw: rawLines[i]
          });
        }
      }

      // Generate rolling hashes of length this.minLines
      if (normalizedLines.length >= this.minLines) {
        for (let i = 0; i <= normalizedLines.length - this.minLines; i++) {
          const chunk = normalizedLines.slice(i, i + this.minLines);
          const combined = chunk.map(c => c.text).join('\n');
          const hash = crypto.createHash('sha1').update(combined).digest('hex');

          fileChunks.push({
            hash,
            file: file.relativePath,
            startLine: chunk[0].origLine,
            endLine: chunk[chunk.length - 1].origLine,
            sample: chunk.map(c => c.raw).join('\n')
          });
        }
      }
    }

    // Group chunks by hash
    const hashMap = new Map();
    for (const chunk of fileChunks) {
      if (!hashMap.has(chunk.hash)) {
        hashMap.set(chunk.hash, []);
      }
      hashMap.get(chunk.hash).push(chunk);
    }

    // Filter hashes that appear in multiple places or multiple files
    const rawGroups = [];
    for (const [hash, occurrences] of hashMap.entries()) {
      if (occurrences.length > 1) {
        // Ensure not overlapping on the exact same lines of the same file
        const uniqueOccurrences = this.deduplicateOccurrences(occurrences);
        if (uniqueOccurrences.length > 1) {
          rawGroups.push({
            hash,
            lineCount: this.minLines,
            sample: uniqueOccurrences[0].sample,
            occurrences: uniqueOccurrences
          });
        }
      }
    }

    // Aggregate statistics
    const duplicatedLineSet = new Set();
    for (const group of rawGroups) {
      for (const occ of group.occurrences) {
        for (let l = occ.startLine; l <= occ.endLine; l++) {
          duplicatedLineSet.add(`${occ.file}:${l}`);
        }
      }
    }

    const totalDuplicatedLines = duplicatedLineSet.size;
    const duplicationPercentage = totalScannedLines > 0
      ? Math.min(100, Number(((totalDuplicatedLines / totalScannedLines) * 100).toFixed(2)))
      : 0;

    // Sort clone groups by number of occurrences descending
    rawGroups.sort((a, b) => b.occurrences.length - a.occurrences.length);

    return {
      totalDuplicatedLines,
      totalScannedLines,
      duplicationPercentage,
      cloneCount: rawGroups.length,
      cloneGroups: rawGroups.slice(0, 50)
    };
  }

  normalizeLine(line) {
    return line
      .replace(/\/\/.*$/, '') // strip line comments
      .replace(/#.*$/, '') // strip python comments
      .replace(/\s+/g, ' ') // collapse whitespaces
      .trim();
  }

  deduplicateOccurrences(occurrences) {
    const result = [];
    for (const occ of occurrences) {
      const isOverlap = result.some(r =>
        r.file === occ.file &&
        Math.abs(r.startLine - occ.startLine) < this.minLines
      );
      if (!isOverlap) {
        result.push(occ);
      }
    }
    return result;
  }
}
