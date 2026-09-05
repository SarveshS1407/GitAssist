import { test, describe } from 'node:test';
import assert from 'node:assert';
import { BusFactorAnalyzer } from '../src/core/bus-factor-analyzer.js';

describe('BusFactorAnalyzer', () => {
  test('identifies single-maintainer knowledge silos', () => {
    const analyzer = new BusFactorAnalyzer({ siloThreshold: 0.80 });

    const commits = [
      { author: 'Alice', files: ['src/core/parser.js', 'src/core/scanner.js'] },
      { author: 'Alice', files: ['src/core/parser.js'] },
      { author: 'Alice', files: ['src/core/scanner.js'] },
      { author: 'Bob', files: ['src/ui/app.js'] },
      { author: 'Bob', files: ['src/ui/app.js'] }
    ];

    const result = analyzer.analyze(commits);
    assert.strictEqual(result.totalAuthors, 2);
    assert.ok(result.silos.length >= 1, 'Should detect silos');
    const coreSilo = result.silos.find(s => s.module.includes('src/core'));
    assert.ok(coreSilo, 'src/core should be flagged as an Alice silo');
    assert.strictEqual(coreSilo.soleMaintainer, 'Alice');
  });

  test('handles empty commits gracefully', () => {
    const analyzer = new BusFactorAnalyzer();
    const result = analyzer.analyze([]);
    assert.strictEqual(result.overallBusFactor, 1);
    assert.strictEqual(result.totalAuthors, 0);
  });
});
