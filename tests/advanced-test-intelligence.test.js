import test from 'node:test';
import assert from 'node:assert/strict';
import { AdvancedTestIntelligence } from '../src/core/test-intelligence.js';

test('AdvancedTestIntelligence Engine Suite', async (t) => {
  const fakeGraph = {
    hasNode: (id) => true,
    getInboundEdges: (target) => {
      if (target === 'src/core/parser.js') {
        return [{ source: 'tests/parser.test.js', target }];
      }
      return [];
    }
  };

  const files = [
    { relativePath: 'src/core/parser.js', language: 'JavaScript', lineCount: 300 },
    { relativePath: 'src/core/risky-untested.js', language: 'JavaScript', lineCount: 400 },
    { relativePath: 'tests/parser.test.js', language: 'JavaScript', lineCount: 80 }
  ];

  const hotspots = [
    { relativePath: 'src/core/risky-untested.js', churnCount: 8 },
    { relativePath: 'src/core/parser.js', churnCount: 2 }
  ];

  const engine = new AdvancedTestIntelligence({
    contextGraph: fakeGraph,
    hotspots,
    files
  });

  const analysis = engine.analyze();

  await t.test('computes correct summary metrics', () => {
    assert.equal(analysis.summary.totalTestFiles, 1);
    assert.equal(analysis.summary.totalSourceFiles, 2);
    assert.equal(analysis.summary.verifiedSourceFiles, 1);
    assert.equal(analysis.summary.coveragePercentage, 50);
  });

  await t.test('identifies uncovered high-risk files', () => {
    assert.equal(analysis.uncoveredHighRiskFiles.length, 1);
    assert.equal(analysis.uncoveredHighRiskFiles[0].file, 'src/core/risky-untested.js');
    assert.equal(analysis.uncoveredHighRiskFiles[0].churn, 8);
  });
});
