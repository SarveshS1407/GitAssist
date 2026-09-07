import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ContextGraph } from '../src/core/context-graph.js';
import { CodeParser } from '../src/core/parser.js';
import { AdvancedImpactEngine } from '../src/core/impact-engine.js';
import { PRRiskAnalyzer } from '../src/core/pr-analyzer.js';

describe('PRRiskAnalyzer Suite', () => {
  const sampleFiles = [
    {
      relativePath: 'src/services/payment.js',
      name: 'payment.js',
      language: 'JavaScript',
      content: `
export class PaymentService {
  processPayment(order) {
    return true;
  }
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
    }
  ];

  const parsed = sampleFiles.map(f => ({ ...f, ...CodeParser.parseFile(f) }));
  const endpoints = [{ method: 'POST', path: '/api/checkout', file: 'src/controllers/checkout.js' }];
  const contextGraph = ContextGraph.build(parsed, null, endpoints);
  const impactEngine = new AdvancedImpactEngine({
    contextGraph,
    endpoints,
    hotspots: [{ relativePath: 'src/services/payment.js', churnCount: 10 }]
  });

  const analyzer = new PRRiskAnalyzer({
    contextGraph,
    impactEngine,
    endpoints,
    hotspots: [{ relativePath: 'src/services/payment.js', churnCount: 10 }]
  });

  const sampleDiff = `
diff --git a/src/services/payment.js b/src/services/payment.js
index 1234567..89abcdef 100644
--- a/src/services/payment.js
+++ b/src/services/payment.js
@@ -3,3 +3,5 @@ export class PaymentService {
   processPayment(order) {
+    console.log("Processing order");
+    if (!order) return false;
     return true;
   }
 }
  `;

  test('parses unified git diff accurately', () => {
    const changes = analyzer.parseDiff(sampleDiff);
    assert.strictEqual(changes.length, 1);
    assert.strictEqual(changes[0].file, 'src/services/payment.js');
    assert.strictEqual(changes[0].status, 'modified');
    assert.strictEqual(changes[0].insertions, 2);
  });

  test('analyzes pull request risk and identifies changed symbols', () => {
    const report = analyzer.analyze(sampleDiff);
    assert.ok(report.overallRisk > 0, 'Overall risk should be calculated');
    assert.strictEqual(report.filesChangedCount, 1);
    assert.ok(report.symbolsChangedCount >= 1, 'Should correlate touched lines with symbols');
    assert.ok(report.changedSymbols.some(s => s.name === 'processPayment'), 'Should include processPayment method');
    assert.ok(report.highRiskChangesCount >= 1, 'Should flag high churn payment service');
  });
});
