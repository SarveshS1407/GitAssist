import { test, describe } from 'node:test';
import assert from 'node:assert';
import { LocalQueryEngine } from '../src/ai/query-engine.js';
import { AIContextPackager } from '../src/ai/context-packager.js';

describe('AI Context & Query Engine', () => {
  const mockState = {
    summary: {
      name: 'test-repo',
      branch: 'main',
      totalFiles: 10,
      totalLines: 1500,
      languages: {
        JavaScript: { percentage: 80, lines: 1200, files: 8 },
        CSS: { percentage: 20, lines: 300, files: 2 }
      }
    },
    files: [
      { relativePath: 'src/index.js', lineCount: 500, language: 'JavaScript', symbols: [] },
      { relativePath: 'src/utils.js', lineCount: 700, language: 'JavaScript', symbols: [] }
    ],
    contributors: [
      { name: 'Alice Developer', email: 'alice@example.com', commitCount: 42 }
    ],
    dependencyGraph: {
      nodes: [{ id: 'src/index.js' }, { id: 'src/utils.js' }],
      edges: [{ from: 'src/index.js', to: 'src/utils.js' }],
      modules: [{ name: 'src', fileCount: 2, totalLines: 1200 }]
    }
  };

  test('LocalQueryEngine answers questions on contributors, files, languages', () => {
    const engine = new LocalQueryEngine(mockState);

    const contribAns = engine.evaluateQuery('who are the contributors?');
    assert.strictEqual(contribAns.type, 'contributors');
    assert.ok(contribAns.answer.includes('Alice Developer'));

    const langAns = engine.evaluateQuery('what languages are used?');
    assert.strictEqual(langAns.type, 'languages');
    assert.ok(langAns.answer.includes('JavaScript'));

    const largestAns = engine.evaluateQuery('what are the largest files?');
    assert.strictEqual(largestAns.type, 'largest_files');
    assert.ok(largestAns.answer.includes('src/utils.js'));
  });

  test('AIContextPackager creates structured prompts', () => {
    const packager = new AIContextPackager();
    const archPkg = packager.packageArchitectureContext(mockState);

    assert.ok(archPkg.systemPrompt.includes('Principal Software Architect'));
    assert.ok(archPkg.userPrompt.includes('test-repo'));
  });
});
