import { test, describe } from 'node:test';
import assert from 'node:assert';
import { HotspotAnalyzer } from '../src/core/hotspot-analyzer.js';

describe('HotspotAnalyzer', () => {
  test('calculates risk score based on churn frequency and line count', () => {
    const files = [
      { relativePath: 'src/core/parser.js', lineCount: 500, symbols: [1, 2, 3, 4], language: 'JavaScript' },
      { relativePath: 'src/types.ts', lineCount: 20, symbols: [], language: 'TypeScript' }
    ];

    const commits = [
      { files: ['src/core/parser.js'] },
      { files: ['src/core/parser.js'] },
      { files: ['src/core/parser.js'] }
    ];

    const hotspots = HotspotAnalyzer.analyzeHotspots(files, commits);

    assert.strictEqual(hotspots.length, 2);
    assert.strictEqual(hotspots[0].relativePath, 'src/core/parser.js');
    assert.strictEqual(hotspots[0].churnCount, 3);
    assert.ok(hotspots[0].score > hotspots[1].score);
  });
});
