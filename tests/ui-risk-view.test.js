import test from 'node:test';
import assert from 'node:assert/strict';
import { RiskView } from '../src/ui/views/RiskView.js';

test('RiskView Component Suite', async (t) => {
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

    const view = new RiskView({ repositoryState: { isLoaded: false } });
    const dom = view.render();
    assert.ok(dom);
  });

  await t.test('renders structural risk matrix deck when repository is loaded', () => {
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

    const view = new RiskView({ repositoryState: { isLoaded: true } });
    const dom = view.render();
    assert.ok(dom);
  });
});
