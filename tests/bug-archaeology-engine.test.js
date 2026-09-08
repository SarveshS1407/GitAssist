import test from 'node:test';
import assert from 'node:assert/strict';
import { BugArchaeologyEngine } from '../src/core/bug-archaeology.js';

test('BugArchaeologyEngine Suite', async (t) => {
  const commits = [
    { hash: '1111111', message: 'fix(security): sanitize input to prevent vuln', author: 'Dev A', date: '2026-09-01', files: ['src/api/routes.js'] },
    { hash: '2222222', message: 'fix(crash): handle undefined crash error in parser', author: 'Dev B', date: '2026-09-02', files: ['src/core/parser.js', 'src/api/routes.js'] },
    { hash: '3333333', message: 'perf: resolve slow leak in websocket', author: 'Dev A', date: '2026-09-03', files: ['src/server.js'] },
    { hash: '4444444', message: 'feat: add new styling and layouts', author: 'Dev C', date: '2026-09-04', files: ['src/ui/main.css'] }
  ];

  const engine = new BugArchaeologyEngine({ commits });
  const report = engine.analyze();

  await t.test('categorizes defects accurately', () => {
    assert.equal(report.summary.totalAnalyzedCommits, 4);
    assert.equal(report.summary.totalDefectCommits, 3);
    assert.equal(report.summary.categories.SECURITY_FIX, 1);
    assert.equal(report.summary.categories.CRASH_FIX, 1);
    assert.equal(report.summary.categories.PERFORMANCE_FIX, 1);
  });

  await t.test('ranks defect-prone modules', () => {
    assert.ok(report.defectHotspots.length > 0);
    assert.equal(report.defectHotspots[0].file, 'src/api/routes.js');
    assert.equal(report.defectHotspots[0].defectCount, 2);
  });
});
