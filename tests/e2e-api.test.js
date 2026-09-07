import { test, describe } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import url from 'node:url';
import { ApiRouter } from '../src/api/routes.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

describe('E2E REST API Suite', () => {
  test('POST /api/repository/validate returns path metadata', async () => {
    const router = new ApiRouter(ROOT_DIR);
    const mockReq = {
      method: 'POST',
      on: (event, handler) => {
        if (event === 'data') handler(Buffer.from(JSON.stringify({ path: ROOT_DIR })));
        if (event === 'end') handler();
      }
    };

    let statusCode = 0;
    let headers = {};
    let responseBody = '';

    const mockRes = {
      writeHead: (status, h) => { statusCode = status; headers = h; },
      end: (data) => { responseBody = data; }
    };

    await router.handleRequest(mockReq, mockRes, new URL('http://localhost:3333/api/repository/validate'));
    assert.strictEqual(statusCode, 200);

    const json = JSON.parse(responseBody);
    assert.strictEqual(json.valid, true);
    assert.strictEqual(json.name, 'gitassist');
    assert.strictEqual(json.isGitRepository, true);
  });

  test('POST /api/repository/open performs complete ingestion', async () => {
    const router = new ApiRouter(ROOT_DIR);
    const mockReq = {
      method: 'POST',
      on: (event, handler) => {
        if (event === 'data') handler(Buffer.from(JSON.stringify({ path: ROOT_DIR })));
        if (event === 'end') handler();
      }
    };

    let statusCode = 0;
    let responseBody = '';

    const mockRes = {
      writeHead: (status) => { statusCode = status; },
      end: (data) => { responseBody = data; }
    };

    await router.handleRequest(mockReq, mockRes, new URL('http://localhost:3333/api/repository/open'));
    assert.strictEqual(statusCode, 200);

    const json = JSON.parse(responseBody);
    assert.strictEqual(json.success, true);
    assert.ok(json.filesCount > 0);
    assert.ok(json.summary.totalLines > 0);
    assert.ok(Array.isArray(json.files));
  });

  test('GET /api/status returns online telemetry state', async () => {
    const router = new ApiRouter(ROOT_DIR);
    const mockReq = { method: 'GET' };
    let statusCode = 0;
    let responseBody = '';

    const mockRes = {
      writeHead: (status) => { statusCode = status; },
      end: (data) => { responseBody = data; }
    };

    await router.handleRequest(mockReq, mockRes, new URL('http://localhost:3333/api/status'));
    assert.strictEqual(statusCode, 200);

    const json = JSON.parse(responseBody);
    assert.strictEqual(json.status, 'online');
  });

  test('GET /api/repository/git/velocity returns velocity and author distribution', async () => {
    const router = new ApiRouter(ROOT_DIR);
    // Seed active repo
    router.activeRepoState = { path: ROOT_DIR, isLoaded: true };

    const mockReq = { method: 'GET' };
    let statusCode = 0;
    let responseBody = '';

    const mockRes = {
      writeHead: (status) => { statusCode = status; },
      end: (data) => { responseBody = data; }
    };

    await router.handleRequest(mockReq, mockRes, new URL('http://localhost:3333/api/repository/git/velocity'));
    assert.strictEqual(statusCode, 200);

    const json = JSON.parse(responseBody);
    assert.ok(json.velocity);
    assert.ok(Array.isArray(json.authors));
  });

  test('GET /api/symbols returns symbol inventory from parsed repository', async () => {
    const router = new ApiRouter(ROOT_DIR);
    // Ingest first
    const openReq = {
      method: 'POST',
      on: (event, handler) => {
        if (event === 'data') handler(Buffer.from(JSON.stringify({ path: ROOT_DIR })));
        if (event === 'end') handler();
      }
    };
    await router.handleRequest(openReq, { writeHead: () => {}, end: () => {} }, new URL('http://localhost:3333/api/repository/open'));

    let statusCode = 0;
    let responseBody = '';
    const mockRes = {
      writeHead: (status) => { statusCode = status; },
      end: (data) => { responseBody = data; }
    };

    await router.handleRequest({ method: 'GET' }, mockRes, new URL('http://localhost:3333/api/symbols?limit=10'));
    assert.strictEqual(statusCode, 200);

    const json = JSON.parse(responseBody);
    assert.ok(json.total > 0, 'Should find symbols in repository');
    assert.ok(Array.isArray(json.symbols), 'Symbols should be an array');
    assert.ok(json.symbols.length <= 10, 'Should respect limit parameter');
  });

  test('GET /api/call-graph returns call tree for symbol', async () => {
    const router = new ApiRouter(ROOT_DIR);
    // Ingest first
    const openReq = {
      method: 'POST',
      on: (event, handler) => {
        if (event === 'data') handler(Buffer.from(JSON.stringify({ path: ROOT_DIR })));
        if (event === 'end') handler();
      }
    };
    await router.handleRequest(openReq, { writeHead: () => {}, end: () => {} }, new URL('http://localhost:3333/api/repository/open'));

    let statusCode = 0;
    let responseBody = '';
    const mockRes = {
      writeHead: (status) => { statusCode = status; },
      end: (data) => { responseBody = data; }
    };

    await router.handleRequest({ method: 'GET' }, mockRes, new URL('http://localhost:3333/api/call-graph?depth=2'));
    assert.strictEqual(statusCode, 200);

    const json = JSON.parse(responseBody);
    assert.ok(json.nodes !== undefined, 'Should return nodes array');
    assert.ok(json.edges !== undefined, 'Should return edges array');
  });
});


