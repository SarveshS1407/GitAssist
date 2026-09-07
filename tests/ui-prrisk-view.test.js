import test from 'node:test';
import assert from 'node:assert/strict';
import { PrRiskView } from '../src/ui/views/PrRiskView.js';

test('PrRiskView Component Suite', async (t) => {
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

    const view = new PrRiskView({ repositoryState: { isLoaded: false } });
    const dom = view.render();
    assert.ok(dom);
  });

  await t.test('renders diff analysis workbench when repository is loaded', () => {
    global.document = {
      createElement: (tag) => {
        return {
          tag,
          className: '',
          style: {},
          innerHTML: '',
          appendChild: () => {},
          addEventListener: () => {},
          querySelector: (sel) => ({
            value: '',
            style: {},
            innerHTML: '',
            addEventListener: () => {}
          }),
          querySelectorAll: () => []
        };
      }
    };

    const view = new PrRiskView({ repositoryState: { isLoaded: true } });
    const dom = view.render();
    assert.ok(dom);
  });
});
