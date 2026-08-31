import { test, describe } from 'node:test';
import assert from 'node:assert';
import { CodeMetrics } from '../src/core/metrics.js';

describe('CodeMetrics', () => {
  test('calculates cyclomatic complexity and maintainability index', () => {
    const code = `
// Main function
function evaluate(x) {
  if (x > 10) {
    return true;
  } else if (x === 0) {
    return false;
  }
  return null;
}
    `;

    const metrics = CodeMetrics.calculateFileMetrics(code, 'JavaScript');

    assert.ok(metrics.complexity >= 3, 'Should detect branching points');
    assert.ok(metrics.maintainabilityIndex > 0, 'Maintainability index should be positive');
    assert.ok(metrics.commentLines >= 1, 'Should detect comment lines');
  });
});
