import test from 'node:test';
import assert from 'node:assert/strict';
import { TestIntelligenceView } from '../src/ui/views/TestIntelligenceView.js';

test('TestIntelligenceView Component Suite', async (t) => {
  await t.test('renders empty state when no repository is loaded', () => {
    global.document = {
      createElement: (tag) => ({
        tag,
        className: '',
        style: {},
        innerHTML: '',
        appendChild: () => {},
        querySelector: () => null,
        querySelectorAll: () => []
      })
    };

    const view = new TestIntelligenceView({ repositoryState: { isLoaded: false } });
    const dom = view.render();
    assert.ok(dom);
  });

  await t.test('renders test readiness deck when repository is loaded', () => {
    global.document = {
      createElement: (tag) => ({
        tag,
        className: '',
        style: {},
        innerHTML: '',
        appendChild: () => {},
        addEventListener: () => {},
        querySelector: (sel) => ({
          textContent: '',
          style: {},
          innerHTML: '',
          addEventListener: () => {}
        }),
        querySelectorAll: () => []
      })
    };

    const view = new TestIntelligenceView({ repositoryState: { isLoaded: true } });
    const dom = view.render();
    assert.ok(dom);
  });
});
