import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ContextGraph } from '../src/core/context-graph.js';
import { CodeParser } from '../src/core/parser.js';
import { TestRecommender } from '../src/core/test-recommender.js';

describe('TestRecommender Suite', () => {
  const sampleFiles = [
    {
      relativePath: 'src/services/payment.js',
      name: 'payment.js',
      language: 'JavaScript',
      content: `export class PaymentService { processPayment() { return true; } }`
    },
    {
      relativePath: 'src/controllers/checkout.js',
      name: 'checkout.js',
      language: 'JavaScript',
      content: `
import { PaymentService } from '../services/payment.js';
export class CheckoutController {}
      `
    },
    {
      relativePath: 'tests/payment.test.js',
      name: 'payment.test.js',
      language: 'JavaScript',
      content: `import { PaymentService } from '../src/services/payment.js';`
    },
    {
      relativePath: 'tests/checkout.test.js',
      name: 'checkout.test.js',
      language: 'JavaScript',
      content: `import { CheckoutController } from '../src/controllers/checkout.js';`
    },
    {
      relativePath: 'tests/misc.test.js',
      name: 'misc.test.js',
      language: 'JavaScript',
      content: `console.log("misc test");`
    }
  ];

  const parsed = sampleFiles.map(f => ({ ...f, ...CodeParser.parseFile(f) }));
  const contextGraph = ContextGraph.build(parsed);

  const recommender = new TestRecommender({
    contextGraph,
    commits: [
      { message: 'refactor payment', files: ['src/services/payment.js', 'tests/payment.test.js'] }
    ]
  });

  test('recommends direct test with HIGH priority', () => {
    const result = recommender.recommend('src/services/payment.js');
    assert.ok(result.high.length >= 1, 'Should find at least 1 high priority test');
    const paymentTest = result.high.find(t => t.testFile === 'tests/payment.test.js');
    assert.ok(paymentTest, 'payment.test.js should be high priority');
    assert.strictEqual(paymentTest.priority, 'HIGH');
  });

  test('recommends intermediate dependent test with MEDIUM priority', () => {
    const result = recommender.recommend('src/services/payment.js');
    const checkoutTest = result.medium.find(t => t.testFile === 'tests/checkout.test.js');
    assert.ok(checkoutTest, 'checkout.test.js should be recommended as intermediate dependent');
    assert.strictEqual(checkoutTest.priority, 'MEDIUM');
  });
});
