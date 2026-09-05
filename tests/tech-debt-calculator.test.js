import { test, describe } from 'node:test';
import assert from 'node:assert';
import { TechDebtCalculator } from '../src/core/tech-debt-calculator.js';

describe('TechDebtCalculator', () => {
  test('calculates debt hours for oversized files and circular loops', () => {
    const calculator = new TechDebtCalculator({ hourlyRate: 120 });
    const files = [
      { relativePath: 'src/giant.js', lineCount: 850 },
      { relativePath: 'src/small.js', lineCount: 50 }
    ];
    const cycles = [
      { cycle: ['src/a.js', 'src/b.js', 'src/a.js'] }
    ];

    const result = calculator.calculate({ files, cycles });
    assert.ok(result.totalDebtHours > 0, 'Should accumulate debt hours');
    assert.ok(result.remediationCostUsd > 0, 'Cost should be > 0');
    assert.strictEqual(result.hourlyRate, 120);
    assert.ok(result.debtBreakdown.complexityHours > 0);
    assert.ok(result.debtBreakdown.architectureHours >= 4);
  });

  test('gives Rating A when codebase is small and healthy', () => {
    const calculator = new TechDebtCalculator();
    const files = [
      { relativePath: 'src/clean.js', lineCount: 80 }
    ];

    const result = calculator.calculate({ files, cycles: [] });
    assert.strictEqual(result.totalDebtHours, 0);
    assert.strictEqual(result.sqaleRating, 'A');
    assert.strictEqual(result.remediationCostUsd, 0);
  });
});
