import { test, describe } from 'node:test';
import assert from 'node:assert';
import { DependencyAnalyzer } from '../src/core/dependency-graph.js';
import { SearchIndex } from '../src/core/search-index.js';

describe('DependencyAnalyzer', () => {
  test('builds graph nodes and edges from imports', () => {
    const files = [
      {
        relativePath: 'src/main.js',
        imports: [{ source: './utils.js', specifiers: ['helper'] }]
      },
      {
        relativePath: 'src/utils.js',
        imports: []
      }
    ];

    const graph = DependencyAnalyzer.buildGraph(files);

    assert.strictEqual(graph.nodes.length, 2);
    assert.strictEqual(graph.edges.length, 1);
    assert.strictEqual(graph.edges[0].from, 'src/main.js');
    assert.strictEqual(graph.edges[0].to, 'src/utils.js');
  });
});

describe('SearchIndex', () => {
  test('finds matching files and symbols', () => {
    const files = [
      {
        relativePath: 'src/auth/jwt.js',
        name: 'jwt.js',
        language: 'JavaScript',
        content: 'function verifyToken() { return true; }',
        symbols: [{ name: 'verifyToken', kind: 'function', lineStart: 1, signature: 'function verifyToken()' }]
      },
      {
        relativePath: 'src/db/client.js',
        name: 'client.js',
        language: 'JavaScript',
        content: 'class DatabaseClient {}',
        symbols: [{ name: 'DatabaseClient', kind: 'class', lineStart: 1, signature: 'class DatabaseClient' }]
      }
    ];

    const index = new SearchIndex(files);

    const tokenSearch = index.search({ query: 'verifyToken', type: 'all' });
    assert.ok(tokenSearch.length > 0, 'Should find verifyToken symbol');
    assert.strictEqual(tokenSearch[0].type, 'symbol');

    const fileSearch = index.search({ query: 'jwt', type: 'file' });
    assert.ok(fileSearch.length > 0, 'Should find jwt.js file');
  });
});
