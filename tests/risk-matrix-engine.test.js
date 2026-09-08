import test from 'node:test';
import assert from 'node:assert/strict';
import { RiskMatrixEngine } from '../src/core/risk-matrix.js';

test('RiskMatrixEngine Suite', async (t) => {
  const fakeGraph = {
    hasNode: (id) => true,
    getInboundEdges: (target) => {
      if (target === 'src/api/routes.js') {
        return [{ source: 'src/server.js' }, { source: 'tests/e2e.test.js' }, { source: 'src/ui/app.js' }];
      }
      return [];
    },
    getOutboundEdges: (source) => {
      if (source === 'src/api/routes.js') {
        return [{ target: 'src/services/repository-service.js' }, { target: 'src/core/parser.js' }];
      }
      return [];
    }
  };

  const files = [
    { relativePath: 'src/api/routes.js', lineCount: 800 },
    { relativePath: 'src/core/leaf.js', lineCount: 50 },
    { relativePath: 'tests/e2e.test.js', lineCount: 100 }
  ];

  const hotspots = [
    { relativePath: 'src/api/routes.js', churnCount: 10 },
    { relativePath: 'src/core/leaf.js', churnCount: 1 }
  ];

  const engine = new RiskMatrixEngine({
    contextGraph: fakeGraph,
    hotspots,
    files
  });

  const matrix = engine.calculate();

  await t.test('calculates multi-factor risk and assigns HIGH level to critical hub', () => {
    assert.equal(matrix.summary.totalEvaluated, 2);
    const routesItem = matrix.riskRanking.find(r => r.file === 'src/api/routes.js');
    assert.ok(routesItem);
    assert.equal(routesItem.level, 'HIGH');
    assert.equal(routesItem.quadrant, 'CRITICAL_CORE');
  });

  await t.test('assigns STABLE_LEAF to low churn leaf module', () => {
    const leafItem = matrix.riskRanking.find(r => r.file === 'src/core/leaf.js');
    assert.ok(leafItem);
    assert.equal(leafItem.level, 'LOW');
    assert.equal(leafItem.quadrant, 'STABLE_LEAF');
  });
});
