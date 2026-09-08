import test from 'node:test';
import assert from 'node:assert/strict';
import { DeadCodeView } from '../src/ui/views/DeadCodeView.js';

test('DeadCodeView Component Suite', async (t) => {
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

    const view = new DeadCodeView({ repositoryState: { isLoaded: false } });
    const dom = view.render();
    assert.ok(dom);
  });

  await t.test('renders pruning workbench when repository is loaded', () => {
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

    const view = new DeadCodeView({ repositoryState: { isLoaded: true } });
    const dom = view.render();
    assert.ok(dom);
  });
});
