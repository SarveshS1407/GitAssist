import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiRouter } from '../src/api/routes.js';

test('Phase 2 API Endpoints E2E Suite', async (t) => {
  const router = new ApiRouter(process.cwd());

  // Ingest repository to populate activeRepoState
  const fakeReqOpen = {
    method: 'POST',
    on: (evt, cb) => {
      if (evt === 'data') cb(JSON.stringify({ path: process.cwd() }));
      if (evt === 'end') cb();
    }
  };

  let openStatus = 0;
  let openBody = null;
  const fakeResOpen = {
    writeHead: (status) => { openStatus = status; },
    end: (content) => { openBody = JSON.parse(content); }
  };

  await router.handleRequest(fakeReqOpen, fakeResOpen, new URL('http://localhost:3333/api/repository/open'));
  assert.equal(openStatus, 200);
  assert.ok(openBody.success);

  await t.test('GET /api/impact/advanced returns multi-dimensional impact report', async () => {
    let status = 0;
    let body = null;
    const fakeRes = {
      writeHead: (s) => { status = s; },
      end: (c) => { body = JSON.parse(c); }
    };
    const parsedUrl = new URL('http://localhost:3333/api/impact/advanced?target=src/core/parser.js&depth=2');
    await router.handleRequest({ method: 'GET' }, fakeRes, parsedUrl);

    assert.equal(status, 200);
    assert.ok(body);
    assert.equal(body.target, 'src/core/parser.js');
    assert.ok(typeof body.riskScore === 'number');
    assert.ok(Array.isArray(body.directDependents));
  });

  await t.test('GET /api/change-brief returns pre-modification brief', async () => {
    let status = 0;
    let body = null;
    const fakeRes = {
      writeHead: (s) => { status = s; },
      end: (c) => { body = JSON.parse(c); }
    };
    const parsedUrl = new URL('http://localhost:3333/api/change-brief?target=src/core/parser.js&format=markdown');
    await router.handleRequest({ method: 'GET' }, fakeRes, parsedUrl);

    assert.equal(status, 200);
    assert.ok(body);
    assert.equal(body.target, 'src/core/parser.js');
    assert.ok(body.markdown);
    assert.ok(body.markdown.includes('BEFORE YOU MODIFY THIS'));
  });

  await t.test('POST /api/pr/analyze returns diff blast radius analysis', async () => {
    const diffSample = `
diff --git a/src/core/parser.js b/src/core/parser.js
index 1111111..2222222 100644
--- a/src/core/parser.js
+++ b/src/core/parser.js
@@ -10,2 +10,4 @@
+  // New enhancement
+  const x = 1;
`;

    const fakeReq = {
      method: 'POST',
      on: (evt, cb) => {
        if (evt === 'data') cb(JSON.stringify({ diffText: diffSample }));
        if (evt === 'end') cb();
      }
    };

    let status = 0;
    let body = null;
    const fakeRes = {
      writeHead: (s) => { status = s; },
      end: (c) => { body = JSON.parse(c); }
    };
    const parsedUrl = new URL('http://localhost:3333/api/pr/analyze');
    await router.handleRequest(fakeReq, fakeRes, parsedUrl);

    assert.equal(status, 200);
    assert.ok(body);
    assert.ok(typeof body.overallRisk === 'number');
    assert.ok(body.riskLevel);
    assert.equal(body.filesChangedCount, 1);
  });

  await t.test('GET /api/tests/recommend returns ranked test suites', async () => {
    let status = 0;
    let body = null;
    const fakeRes = {
      writeHead: (s) => { status = s; },
      end: (c) => { body = JSON.parse(c); }
    };
    const parsedUrl = new URL('http://localhost:3333/api/tests/recommend?target=src/core/parser.js');
    await router.handleRequest({ method: 'GET' }, fakeRes, parsedUrl);

    assert.equal(status, 200);
    assert.ok(body);
    assert.ok(Array.isArray(body.all));
    assert.ok(Array.isArray(body.high));
  });
});
