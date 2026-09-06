import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { SettingsService, DEFAULT_SETTINGS } from '../src/services/settings-service.js';
import { ApiRouter } from '../src/api/routes.js';

describe('SettingsService & Configuration Suite', () => {
  let tempDir;
  let service;

  before(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gitassist-settings-test-'));
    service = new SettingsService(tempDir);
  });

  after(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {}
  });

  test('loads default settings when no file exists', async () => {
    const settings = await service.getSettings();
    assert.strictEqual(settings.analysis.maxFileSizeKb, 500);
    assert.strictEqual(settings.ai.provider, 'offline-rules');
    assert.strictEqual(settings.appearance.theme, 'cyber-aurora');
    assert.strictEqual(settings.system.anonymousTelemetry, false);
  });

  test('updates settings and persists to disk', async () => {
    const updated = await service.updateSettings({
      analysis: {
        maxFileSizeKb: 1024,
        complexityThreshold: 20
      },
      appearance: {
        theme: 'synthwave'
      }
    });

    assert.strictEqual(updated.analysis.maxFileSizeKb, 1024);
    assert.strictEqual(updated.analysis.complexityThreshold, 20);
    assert.strictEqual(updated.appearance.theme, 'synthwave');
    // Ensure untouched fields remain intact
    assert.strictEqual(updated.ai.provider, 'offline-rules');

    // Create a new instance pointing to same tempDir to test reading from disk
    const freshInstance = new SettingsService(tempDir);
    const reloaded = await freshInstance.getSettings();
    assert.strictEqual(reloaded.analysis.maxFileSizeKb, 1024);
    assert.strictEqual(reloaded.appearance.theme, 'synthwave');
  });

  test('resets settings to default values', async () => {
    const reset = await service.resetSettings();
    assert.strictEqual(reset.analysis.maxFileSizeKb, DEFAULT_SETTINGS.analysis.maxFileSizeKb);
    assert.strictEqual(reset.appearance.theme, DEFAULT_SETTINGS.appearance.theme);
  });

  test('tests offline AI provider connection with 1ms latency', async () => {
    const result = await service.testConnection({ provider: 'offline-rules' });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.provider, 'offline-rules');
    assert.ok(result.message.includes('Offline'));
  });

  test('tests unreachable local Ollama endpoint gracefully', async () => {
    const result = await service.testConnection({
      provider: 'ollama-local',
      ollamaEndpoint: 'http://127.0.0.1:54321' // Non-existent port
    });
    assert.strictEqual(result.success, false);
    assert.ok(result.message.length > 5);
  });

  test('ApiRouter responds to /api/settings GET and POST', async () => {
    const router = new ApiRouter(tempDir);

    // Mock res object
    const createMockRes = () => {
      let statusCode = 0;
      let headers = {};
      let body = '';
      return {
        writeHead: (code, h) => {
          statusCode = code;
          headers = h;
        },
        end: (data) => {
          body = data;
        },
        getStatusCode: () => statusCode,
        getBody: () => (body ? JSON.parse(body) : {})
      };
    };

    // 1. GET /api/settings
    const resGet = createMockRes();
    await router.handleRequest(
      { method: 'GET' },
      resGet,
      new URL('http://localhost:3333/api/settings')
    );
    assert.strictEqual(resGet.getStatusCode(), 200);
    const getPayload = resGet.getBody();
    assert.strictEqual(getPayload.success, true);
    assert.ok(getPayload.settings.analysis);

    // 2. POST /api/settings
    const resPost = createMockRes();
    const reqPost = {
      method: 'POST',
      on: (event, cb) => {
        if (event === 'data') cb(Buffer.from(JSON.stringify({
          settings: { appearance: { theme: 'midnight-terminal' } }
        })));
        if (event === 'end') cb();
      }
    };
    await router.handleRequest(
      reqPost,
      resPost,
      new URL('http://localhost:3333/api/settings')
    );
    assert.strictEqual(resPost.getStatusCode(), 200);
    const postPayload = resPost.getBody();
    assert.strictEqual(postPayload.settings.appearance.theme, 'midnight-terminal');
  });
});
