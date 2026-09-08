import test from 'node:test';
import assert from 'node:assert/strict';
import { BugArchaeologyView } from '../src/ui/views/BugArchaeologyView.js';

test('BugArchaeologyView Component Suite', async (t) => {
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

    const view = new BugArchaeologyView({ repositoryState: { isLoaded: false } });
    const dom = view.render();
    assert.ok(dom);
  });

  await t.test('renders defect taxonomy deck when repository is loaded', () => {
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

    const view = new BugArchaeologyView({ repositoryState: { isLoaded: true } });
    const dom = view.render();
    assert.ok(dom);
  });
});
