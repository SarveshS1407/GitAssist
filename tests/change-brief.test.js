import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ContextGraph } from '../src/core/context-graph.js';
import { CallGraphEngine } from '../src/core/call-graph.js';
import { CodeParser } from '../src/core/parser.js';
import { AdvancedImpactEngine } from '../src/core/impact-engine.js';
import { ChangeBriefGenerator } from '../src/core/change-brief.js';

describe('ChangeBriefGenerator Suite', () => {
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
      relativePath: 'tests/payment.test.js',
      name: 'payment.test.js',
      language: 'JavaScript',
      content: `import { PaymentService } from '../src/services/payment.js';`
    }
  ];

  const parsed = sampleFiles.map(f => ({ ...f, ...CodeParser.parseFile(f) }));
  const endpoints = [{ method: 'POST', path: '/api/checkout', file: 'src/controllers/checkout.js' }];
  const contextGraph = ContextGraph.build(parsed, null, endpoints);
  const callGraph = new CallGraphEngine(contextGraph);
  const impactEngine = new AdvancedImpactEngine({
    contextGraph,
    callGraph,
    endpoints,
    hotspots: [{ relativePath: 'src/services/payment.js', churnCount: 12 }],
    commits: [{ message: 'fix payment gateway bug', files: ['src/services/payment.js'] }]
  });

  const generator = new ChangeBriefGenerator({
    impactEngine,
    callGraph,
    contextGraph
  });

  test('generates comprehensive Change Brief for target file', () => {
    const brief = generator.generateBrief('src/services/payment.js');
    assert.ok(brief, 'Brief should be created');
    assert.strictEqual(brief.target, 'src/services/payment.js');
    assert.ok(['HIGH', 'CRITICAL'].includes(brief.risk.level), 'Risk level should be elevated');
    assert.ok(brief.usedBy.includes('src/controllers/checkout.js'));
    assert.ok(brief.apiExposure.includes('POST /api/checkout'));
    assert.strictEqual(brief.recentChurn, 'HIGH');
    assert.strictEqual(brief.bugHistory.count, 1);
    assert.ok(brief.testCoverage.count >= 1);
    assert.ok(brief.recommendedAction.includes('Review'));
  });

  test('formats Markdown Change Brief cleanly', () => {
    const brief = generator.generateBrief('src/services/payment.js');
    const md = brief.formatMarkdown();
    assert.ok(md.includes('BEFORE YOU MODIFY THIS'));
    assert.ok(md.includes('RISK LEVEL'));
    assert.ok(md.includes('USED BY'));
    assert.ok(md.includes('API EXPOSURE'));
    assert.ok(md.includes('RECOMMENDED ACTION'));
  });
});
