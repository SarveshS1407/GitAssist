import { test, describe } from 'node:test';
import assert from 'node:assert';
import { SearchIndex } from '../src/core/search-index.js';

describe('Advanced SearchIndex Suite', () => {
  const mockFiles = [
    {
      name: 'auth-controller.js',
      relativePath: 'src/controllers/auth-controller.js',
      language: 'JavaScript',
      lineCount: 120,
      sizeBytes: 3400,
      symbols: [
        { name: 'authenticateUser', kind: 'function', lineStart: 15, signature: 'async function authenticateUser(token)' },
        { name: 'revokeSession', kind: 'function', lineStart: 45, signature: 'async function revokeSession(userId)' }
      ],
      content: 'export async function authenticateUser(token) {\n  const isValid = verifyToken(token);\n  return isValid;\n}'
    },
    {
      name: 'database.js',
      relativePath: 'src/core/database.js',
      language: 'JavaScript',
      lineCount: 85,
      sizeBytes: 2100,
      symbols: [
        { name: 'DatabaseConnection', kind: 'class', lineStart: 5, signature: 'class DatabaseConnection' },
        { name: 'executeQuery', kind: 'function', lineStart: 25, signature: 'executeQuery(sql, params)' }
      ],
      content: 'class DatabaseConnection {\n  connect() {\n    console.log("Connected to DB");\n  }\n}'
    },
    {
      name: 'schema.sql',
      relativePath: 'data/schema.sql',
      language: 'Text',
      lineCount: 40,
      sizeBytes: 1100,
      symbols: [],
      content: 'CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(255));'
    }
  ];

  test('scores exact symbol matches higher than partial matches', () => {
    const index = new SearchIndex(mockFiles);
    const results = index.search({ query: 'authenticateUser', type: 'symbol' });

    assert.ok(results.length > 0);
    assert.strictEqual(results[0].symbolName, 'authenticateUser');
    assert.ok(results[0].score >= 95, 'Exact matches receive boosted score');
  });

  test('handles multi-token search queries across paths and names', () => {
    const index = new SearchIndex(mockFiles);
    const results = index.search({ query: 'auth controller', type: 'file' });

    assert.ok(results.length > 0);
    assert.strictEqual(results[0].file, 'src/controllers/auth-controller.js');
  });

  test('filters results accurately by language', () => {
    const index = new SearchIndex(mockFiles);
    const jsResults = index.search({ query: 'user', language: 'JavaScript' });
    assert.ok(jsResults.every(r => r.file.endsWith('.js')));

    const textResults = index.search({ query: 'users', language: 'Text' });
    assert.ok(textResults.every(r => r.file.endsWith('.sql')));
  });

  test('searches text lines and returns accurate 1-indexed line numbers', () => {
    const index = new SearchIndex(mockFiles);
    const results = index.search({ query: 'verifyToken', type: 'text' });

    assert.ok(results.length > 0);
    assert.strictEqual(results[0].type, 'text');
    assert.strictEqual(results[0].line, 2);
    assert.ok(results[0].snippet.includes('verifyToken'));
  });
});
