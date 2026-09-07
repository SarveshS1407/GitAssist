import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ContextGraph } from '../src/core/context-graph.js';
import { CallGraphEngine } from '../src/core/call-graph.js';
import { CodeParser } from '../src/core/parser.js';

describe('CallGraphEngine Suite', () => {
  const sampleFiles = [
    {
      relativePath: 'src/db/database.js',
      name: 'database.js',
      language: 'JavaScript',
      content: `
export class Database {
  static saveTransaction(record) {
    return true;
  }
}
      `
    },
    {
      relativePath: 'src/services/payment.js',
      name: 'payment.js',
      language: 'JavaScript',
      content: `
import { Database } from '../db/database.js';

export class PaymentService {
  processPayment(order) {
    this.validate(order);
    Database.saveTransaction(order);
    return true;
  }
  validate(order) {
    return !!order;
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
  constructor() {
    this.paymentService = new PaymentService();
  }
  handleCheckout(req) {
    return this.paymentService.processPayment(req.body);
  }
}
      `
    }
  ];

  const parsed = sampleFiles.map(f => ({
    ...f,
    ...CodeParser.parseFile(f)
  }));

  const contextGraph = ContextGraph.build(parsed);
  const callGraph = new CallGraphEngine(contextGraph);

  test('resolves callers (reverse lookup: who calls processPayment?)', () => {
    const result = callGraph.getCallers('processPayment', 2);
    assert.ok(result.symbol, 'Should resolve processPayment symbol');
    assert.ok(result.callers.length >= 1, 'Should find at least 1 caller');

    const callerNames = result.callers.map(c => c.symbol.name);
    assert.ok(callerNames.includes('handleCheckout'), 'handleCheckout should be in callers');
  });

  test('resolves callees (forward lookup: what does processPayment call?)', () => {
    const result = callGraph.getCallees('processPayment', 2);
    assert.ok(result.symbol, 'Should resolve processPayment symbol');
    assert.ok(result.callees.length >= 2, 'Should find validate and saveTransaction callees');

    const calleeNames = result.callees.map(c => c.symbol.name);
    assert.ok(calleeNames.includes('validate'), 'validate should be in callees');
    assert.ok(calleeNames.includes('saveTransaction'), 'saveTransaction should be in callees');
  });

  test('traces call path between CheckoutController and Database', () => {
    const pathResult = callGraph.getCallPath('handleCheckout', 'saveTransaction', 4);
    assert.strictEqual(pathResult.found, true, 'Should find path from handleCheckout to saveTransaction');
    assert.ok(pathResult.path.length >= 3, 'Path should traverse controller -> service -> database');

    const pathNames = pathResult.path.map(p => p.name);
    assert.strictEqual(pathNames[0], 'handleCheckout');
    assert.strictEqual(pathNames[pathNames.length - 1], 'saveTransaction');
  });

  test('exports call tree with callers and callees for interactive UI', () => {
    const tree = callGraph.exportCallTree('processPayment', { direction: 'both', depth: 2 });
    assert.ok(tree.root, 'Root should be defined');
    assert.ok(tree.nodes.length >= 3, 'Should collect caller and callee nodes');
    assert.ok(tree.edges.length >= 2, 'Should collect call edges');
    assert.ok(tree.stats.callerCount >= 1, 'Stats caller count should be >= 1');
    assert.ok(tree.stats.calleeCount >= 1, 'Stats callee count should be >= 1');
  });

  test('computes repository call metrics (fan-in and fan-out)', () => {
    const metrics = callGraph.getCallMetrics(5);
    assert.ok(Array.isArray(metrics.topCalled), 'topCalled should be array');
    assert.ok(Array.isArray(metrics.topCallers), 'topCallers should be array');
    assert.ok(metrics.topCalled.length > 0, 'Should identify top called symbols');
  });
});
