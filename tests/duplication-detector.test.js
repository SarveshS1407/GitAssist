import { test, describe } from 'node:test';
import assert from 'node:assert';
import { DuplicationDetector } from '../src/core/duplication-detector.js';

describe('DuplicationDetector', () => {
  test('detects duplicate code blocks across multiple files', () => {
    const detector = new DuplicationDetector({ minLines: 5 });

    const sharedBlock = `
function calculateTax(subtotal, rate) {
  const tax = subtotal * rate;
  const total = subtotal + tax;
  return { tax, total };
}
    `.trim();

    const fileA = {
      relativePath: 'src/billing/invoice.js',
      content: `
import { round } from './utils.js';

${sharedBlock}

export function generateInvoice() {}
      `.trim()
    };

    const fileB = {
      relativePath: 'src/checkout/cart.js',
      content: `
import { applyDiscount } from './promo.js';

${sharedBlock}

export function checkout() {}
      `.trim()
    };

    const result = detector.detect([fileA, fileB]);

    assert.ok(result.cloneCount >= 1, 'Should find at least 1 clone group');
    assert.ok(result.totalDuplicatedLines >= 5, 'Should count duplicated lines');
    assert.ok(result.duplicationPercentage > 0, 'Duplication percentage should be > 0');
    assert.strictEqual(result.cloneGroups[0].occurrences.length, 2);
  });

  test('returns 0 duplication when code is unique', () => {
    const detector = new DuplicationDetector({ minLines: 5 });

    const fileA = {
      relativePath: 'src/a.js',
      content: 'const a = 1;\nconst b = 2;\nconst c = 3;\nconst d = 4;\nconst e = 5;'
    };

    const fileB = {
      relativePath: 'src/b.js',
      content: 'function test() {\n  return "hello world";\n}'
    };

    const result = detector.detect([fileA, fileB]);
    assert.strictEqual(result.cloneCount, 0);
    assert.strictEqual(result.duplicationPercentage, 0);
  });
});
