import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ContextGraph } from '../src/core/context-graph.js';
import { CallGraphEngine } from '../src/core/call-graph.js';
import { CodeParser } from '../src/core/parser.js';
import { AdvancedImpactEngine } from '../src/core/impact-engine.js';

describe('AdvancedImpactEngine Suite', () => {
  const sampleFiles = [
    {
      relativePath: 'src/services/payment.js',
      name: 'payment.js',
      language: 'JavaScript',
      content: `
export class PaymentService {
  processPayment(order) { return true; }
}
      `
    },
    {
      relativePath: 'src/controllers/checkout.js',
      name: 'checkout.js',
      language: 'JavaScript',
      content: `
import { PaymentService } from '../services/payment.js';
export class CheckoutController {
  handleCheckout(req) {
    const s = new PaymentService();
    return s.processPayment(req.body);
  }
}
      `
    },
    {
      relativePath: 'src/routes/api.js',
      name: 'api.js',
      language: 'JavaScript',
      content: `
import { CheckoutController } from '../controllers/checkout.js';
export function setupRoutes(app) {
  const c = new CheckoutController();
  app.post('/api/checkout', (req) => c.handleCheckout(req));
}
      `
    },
    {
      relativePath: 'tests/payment.test.js',
      name: 'payment.test.js',
      language: 'JavaScript',
      content: `
import { PaymentService } from '../src/services/payment.js';
      `
    }
  ];

  const parsed = sampleFiles.map(f => ({ ...f, ...CodeParser.parseFile(f) }));
  const endpoints = [{ method: 'POST', path: '/api/checkout', file: 'src/routes/api.js' }];
  const contextGraph = ContextGraph.build(parsed, null, endpoints);
  const callGraph = new CallGraphEngine(contextGraph);

  const engine = new AdvancedImpactEngine({
    contextGraph,
    callGraph,
    endpoints,
    hotspots: [{ relativePath: 'src/services/payment.js', churnCount: 8 }],
    commits: [
      { message: 'fix payment timeout bug', files: ['src/services/payment.js'] }
    ]
  });

  test('calculates direct and indirect dependents for payment service', () => {
    const impact = engine.analyzeImpact('src/services/payment.js', 3);
    assert.ok(impact, 'Impact result should be returned');
    assert.strictEqual(impact.targetFile, 'src/services/payment.js');
    assert.ok(impact.directDependents.includes('src/controllers/checkout.js'), 'checkout should be direct dependent');
    assert.ok(impact.stats.totalDependents >= 2, 'Should find transitive dependents');
  });

  test('detects affected API endpoints through dependency chain', () => {
    const impact = engine.analyzeImpact('src/services/payment.js', 3);
    assert.ok(impact.affectedApis.length >= 1, 'Should detect affected /api/checkout');
    assert.strictEqual(impact.affectedApis[0].path, '/api/checkout');
  });

  test('recommends relevant test suites with high priority', () => {
    const impact = engine.analyzeImpact('src/services/payment.js', 3);
    assert.ok(impact.affectedTests.length >= 1, 'Should find payment.test.js');
    assert.strictEqual(impact.affectedTests[0].priority, 'HIGH');
    assert.ok(impact.affectedTests[0].reason.includes('Direct naming match') || impact.affectedTests[0].reason.includes('Imports'));
  });

  test('correlates historical bug commits and calculates risk level', () => {
    const impact = engine.analyzeImpact('src/services/payment.js', 3);
    assert.ok(impact.history.bugCount >= 1, 'Should flag 1 historical bug commit');
    assert.ok(impact.riskScore >= 50, 'Risk score should be elevated (HIGH or CRITICAL)');
    assert.ok(['HIGH', 'CRITICAL'].includes(impact.riskLevel));
    assert.ok(impact.recommendedReviews.length > 0, 'Should provide recommended reviews');
  });
});
