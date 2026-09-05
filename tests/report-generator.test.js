import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ReportGenerator } from '../src/services/report-generator.js';

describe('ReportGenerator', () => {
  test('generates formatted markdown audit report with scorecard', () => {
    const reportData = {
      repository: 'GitAssist',
      summary: { fileCount: 42, totalLines: 12500, languages: ['JavaScript'] },
      security: { score: 95, grade: 'A', counts: { critical: 0, high: 0, medium: 1, low: 0 } },
      techDebt: { totalDebtHours: 12, remediationCostUsd: 1200, sqaleRating: 'B' },
      busFactor: { overallBusFactor: 2, riskLevel: 'HIGH', siloCount: 1 },
      duplication: { duplicationPercentage: 1.5 },
      endpoints: { totalEndpoints: 8 },
      cycles: []
    };

    const md = ReportGenerator.generateMarkdown(reportData);
    assert.ok(md.includes('# 🛡️ GitAssist Forensic Audit Report: GitAssist'));
    assert.ok(md.includes('Executive Scorecard'));
    assert.ok(md.includes('95/100 (Grade A)'));
    assert.ok(md.includes('12 Hours ($1,200)'));
  });
});
