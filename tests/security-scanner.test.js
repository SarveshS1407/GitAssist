import { test, describe } from 'node:test';
import assert from 'node:assert';
import { SecurityScanner } from '../src/core/security-scanner.js';

describe('SecurityScanner', () => {
  test('flags hardcoded AWS keys and assigns CRITICAL severity', () => {
    const scanner = new SecurityScanner();
    const files = [
      {
        relativePath: 'src/config/aws.js',
        content: 'const awsKey = "AKIAIOSFODNN7EXAMPLE";'
      }
    ];

    const result = scanner.scan(files);
    assert.strictEqual(result.counts.critical, 1);
    assert.strictEqual(result.findings[0].ruleId, 'AWS_KEY');
    assert.strictEqual(result.findings[0].severity, 'CRITICAL');
    assert.ok(result.score < 100);
  });

  test('flags dangerous eval usage as MEDIUM severity', () => {
    const scanner = new SecurityScanner();
    const files = [
      {
        relativePath: 'src/calculator.js',
        content: 'const result = eval(userExpr);'
      }
    ];

    const result = scanner.scan(files);
    assert.strictEqual(result.counts.medium, 1);
    assert.strictEqual(result.findings[0].ruleId, 'INSECURE_EVAL');
  });

  test('returns 100 score and Grade A when codebase is secure', () => {
    const scanner = new SecurityScanner();
    const files = [
      {
        relativePath: 'src/utils/math.js',
        content: 'export function add(a, b) { return a + b; }'
      }
    ];

    const result = scanner.scan(files);
    assert.strictEqual(result.score, 100);
    assert.strictEqual(result.grade, 'A');
    assert.strictEqual(result.totalFindings, 0);
  });
});
