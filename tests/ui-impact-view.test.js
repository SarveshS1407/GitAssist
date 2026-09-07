import test from 'node:test';
import assert from 'node:assert/strict';
import { ImpactView } from '../src/ui/views/ImpactView.js';

test('ImpactView Component Suite', async (t) => {
  await t.test('renders empty state when no repository is loaded', () => {
    // mock DOM environment
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

    const view = new ImpactView({ repositoryState: { isLoaded: false } });
    const dom = view.render();
    assert.ok(dom);
  });

  await t.test('renders telemetry deck when repository is loaded', () => {
    global.document = {
      createElement: (tag) => {
        const el = {
          tag,
          className: '',
          style: {},
          innerHTML: '',
          appendChild: () => {},
          addEventListener: () => {},
          querySelector: (sel) => ({
            style: {},
            innerHTML: '',
            addEventListener: () => {}
          }),
          querySelectorAll: () => []
        };
        return el;
      }
    };

    const view = new ImpactView({ repositoryState: { isLoaded: true } });
    const dom = view.render();
    assert.ok(dom);
  });
});
