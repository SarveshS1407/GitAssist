import { test, describe } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import url from 'node:url';
import { ApiRouter } from '../src/api/routes.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

describe('ApiRouter Static & Shell Serving', () => {
  test('serves index.html with text/html header', async () => {
    const router = new ApiRouter(ROOT_DIR);
    let statusCode = 0;
    let headers = {};
    let body = '';

    const req = { method: 'GET' };
    const res = {
      writeHead(status, hdrs) {
        statusCode = status;
        headers = hdrs;
      },
      end(chunk) {
        body = chunk?.toString() || '';
      }
    };

    await router.handleRequest(req, res, new URL('http://localhost:3333/'));
    assert.strictEqual(statusCode, 200);
    assert.ok(headers['Content-Type'].includes('text/html'));
    assert.ok(body.includes('<div id="app"></div>'));
  });

  test('serves main.css with text/css header', async () => {
    const router = new ApiRouter(ROOT_DIR);
    let statusCode = 0;
    let headers = {};
    let body = '';

    const req = { method: 'GET' };
    const res = {
      writeHead(status, hdrs) {
        statusCode = status;
        headers = hdrs;
      },
      end(chunk) {
        body = chunk?.toString() || '';
      }
    };

    await router.handleRequest(req, res, new URL('http://localhost:3333/src/ui/styles/main.css'));
    assert.strictEqual(statusCode, 200);
    assert.ok(headers['Content-Type'].includes('text/css'));
    assert.ok(body.includes('.app-shell'));
  });

  test('serves app.js with application/javascript header', async () => {
    const router = new ApiRouter(ROOT_DIR);
    let statusCode = 0;
    let headers = {};
    let body = '';

    const req = { method: 'GET' };
    const res = {
      writeHead(status, hdrs) {
        statusCode = status;
        headers = hdrs;
      },
      end(chunk) {
        body = chunk?.toString() || '';
      }
    };

    await router.handleRequest(req, res, new URL('http://localhost:3333/src/ui/app.js'));
    assert.strictEqual(statusCode, 200);
    assert.ok(headers['Content-Type'].includes('application/javascript'));
    assert.ok(body.includes('class App'));
  });
});
