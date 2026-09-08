import test from 'node:test';
import assert from 'node:assert/strict';
import { HeuristicReviewEngine } from '../src/core/heuristic-review.js';

test('HeuristicReviewEngine Suite', async (t) => {
  const files = [
    { relativePath: 'src/core/oversized.js', lineCount: 500 },
    { relativePath: 'src/core/normal.js', lineCount: 120 }
  ];

  const hotspots = [
    { relativePath: 'src/core/oversized.js', churnCount: 12 }
  ];

  const cycles = [
    ['src/a.js', 'src/b.js', 'src/a.js']
  ];

  const engine = new HeuristicReviewEngine({
    files,
    hotspots,
    cycles
  });

  const report = engine.review();

  await t.test('detects architectural cycles and oversized files', () => {
    assert.ok(report.findings.length >= 2);
    const cycleFinding = report.findings.find(f => f.category === 'Architectural Coupling');
    assert.ok(cycleFinding);
    assert.equal(cycleFinding.severity, 'HIGH');

    const oversizedFinding = report.findings.find(f => f.category === 'Oversized Module');
    assert.ok(oversizedFinding);
    assert.equal(oversizedFinding.file, 'src/core/oversized.js');
  });

  await t.test('calculates health score penalty correctly', () => {
    assert.ok(report.summary.healthScore < 100);
    assert.ok(report.summary.highSeverityCount >= 2);
  });
});
