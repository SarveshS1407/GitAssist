import { test, describe } from 'node:test';
import assert from 'node:assert';
import { StabilityForecaster } from '../src/core/stability-forecaster.js';

describe('StabilityForecaster', () => {
  test('categorizes high churn files as VOLATILE_CHURN', () => {
    const forecaster = new StabilityForecaster();
    const files = [{ relativePath: 'src/volatile.js' }, { relativePath: 'src/dormant.js' }];
    const commits = [
      { files: ['src/volatile.js'], author: 'DevA' },
      { files: ['src/volatile.js'], author: 'DevB' },
      { files: ['src/volatile.js'], author: 'DevA' },
      { files: ['src/volatile.js'], author: 'DevC' },
      { files: ['src/volatile.js'], author: 'DevB' }
    ];

    const result = forecaster.forecast(commits, files);
    assert.strictEqual(result.summary.counts.VOLATILE_CHURN, 1);
    assert.strictEqual(result.summary.counts.DORMANT, 1);

    const volatileModule = result.modules.find(m => m.file === 'src/volatile.js');
    assert.ok(volatileModule);
    assert.strictEqual(volatileModule.classification, 'VOLATILE_CHURN');
    assert.strictEqual(volatileModule.uniqueAuthors, 3);
  });

  test('handles empty commits gracefully', () => {
    const forecaster = new StabilityForecaster();
    const files = [{ relativePath: 'src/a.js' }];
    const result = forecaster.forecast([], files);
    assert.strictEqual(result.summary.counts.DORMANT, 1);
    assert.strictEqual(result.modules[0].classification, 'DORMANT');
  });
});
