import test from 'node:test';
import assert from 'node:assert/strict';
import { DeadCodeDetector } from '../src/core/dead-code-detector.js';

test('DeadCodeDetector Suite', async (t) => {
  const fakeGraph = {
    hasNode: (id) => true,
    getInboundEdges: (target) => {
      if (target === 'src/core/used.js') return [{ source: 'src/api/routes.js', target }];
      return [];
    },
    getOutboundEdges: (source) => {
      if (source === 'src/core/semi-orphan.js') return [{ source, target: 'src/core/used.js' }];
      return [];
    }
  };

  const files = [
    { relativePath: 'src/core/used.js', language: 'JavaScript', lineCount: 100 },
    { relativePath: 'src/core/orphan.js', language: 'JavaScript', lineCount: 150 },
    { relativePath: 'src/core/semi-orphan.js', language: 'JavaScript', lineCount: 80 },
    { relativePath: 'src/server.js', language: 'JavaScript', lineCount: 200 } // Special entry point
  ];

  const detector = new DeadCodeDetector({
    contextGraph: fakeGraph,
    files
  });

  const report = detector.detect();

  await t.test('filters entry points and detects completely detached orphan', () => {
    assert.equal(report.orphanModules.length, 2);
    const completelyDetached = report.orphanModules.find(m => m.file === 'src/core/orphan.js');
    assert.ok(completelyDetached);
    assert.equal(completelyDetached.confidence, 'HIGH');
  });

  await t.test('detects unreferenced module importing others', () => {
    const semi = report.orphanModules.find(m => m.file === 'src/core/semi-orphan.js');
    assert.ok(semi);
    assert.equal(semi.confidence, 'MEDIUM');
  });
});
