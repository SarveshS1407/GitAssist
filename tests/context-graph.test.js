import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ContextGraph } from '../src/core/context-graph.js';
import { CodeParser } from '../src/core/parser.js';

describe('ContextGraph Suite', () => {
  const sampleFiles = [
    {
      relativePath: 'src/services/payment.js',
      name: 'payment.js',
      language: 'JavaScript',
      content: `
export class PaymentService {
  constructor(gateway) {
    this.gateway = gateway;
  }
  processPayment(order) {
    this.validate(order);
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
  constructor(paymentService) {
    this.paymentService = paymentService;
  }
  handleCheckout(req, res) {
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

  test('constructs entity nodes for files and symbols', () => {
    const graph = ContextGraph.build(parsed);

    assert.ok(graph.nodes.has('file:src/services/payment.js'), 'Should have payment file node');
    assert.ok(graph.nodes.has('file:src/controllers/checkout.js'), 'Should have checkout file node');

    const paymentSymbols = graph.getSymbolsForFile('src/services/payment.js');
    assert.ok(paymentSymbols.length >= 3, 'Should have class and methods');

    const procSym = paymentSymbols.find(s => s.name === 'processPayment');
    assert.ok(procSym, 'Should find processPayment symbol');
    assert.strictEqual(procSym.parentClass, 'PaymentService');
  });

  test('constructs IMPORTS and CONTAINS edges', () => {
    const graph = ContextGraph.build(parsed);

    const importEdges = graph.edges.filter(e => e.type === 'IMPORTS');
    assert.ok(importEdges.length > 0, 'Should have import edge from checkout to payment');
    assert.strictEqual(importEdges[0].source, 'file:src/controllers/checkout.js');
    assert.strictEqual(importEdges[0].target, 'file:src/services/payment.js');

    const containsEdges = graph.edges.filter(e => e.type === 'CONTAINS');
    assert.ok(containsEdges.length >= 5, 'Should have contains edges for all symbols');
  });

  test('resolves intra-file and cross-file CALLS edges', () => {
    const graph = ContextGraph.build(parsed);

    const callEdges = graph.edges.filter(e => e.type === 'CALLS');
    assert.ok(callEdges.length >= 1, 'Should resolve call edges');

    // Intra-file: processPayment calls validate
    const intraCall = callEdges.find(e => 
      e.source.includes('processPayment') && e.target.includes('validate')
    );
    assert.ok(intraCall, 'processPayment should call validate');

    // Cross-file: handleCheckout calls processPayment
    const crossCall = callEdges.find(e => 
      e.source.includes('handleCheckout') && e.target.includes('processPayment')
    );
    assert.ok(crossCall, 'handleCheckout should call processPayment');
  });
});
