import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { CallGraphView } from '../src/ui/views/CallGraphView.js';

describe('CallGraphView Component Suite', () => {
  beforeEach(() => {
    if (typeof document === 'undefined') {
      global.document = {
        createElement: (tag) => {
          const el = {
            tagName: tag,
            className: '',
            style: {},
            children: [],
            appendChild: (child) => el.children.push(child),
            querySelector: () => ({
              addEventListener: () => {},
              querySelectorAll: () => [],
              appendChild: () => {}
            }),
            querySelectorAll: () => []
          };
          return el;
        },
        addEventListener: () => {}
      };
    }
  });

  test('renders empty state when no repository is loaded', () => {
    const repositoryState = { isLoaded: false };
    const view = new CallGraphView({ repositoryState });
    const el = view.render();
    assert.strictEqual(el.className, 'view-container');
    assert.strictEqual(el.children.length, 2);
  });

  test('renders call graph deck when repository is loaded', () => {
    const repositoryState = { isLoaded: true };
    const view = new CallGraphView({ repositoryState });
    const el = view.render();
    assert.strictEqual(el.className, 'view-container');
    assert.strictEqual(el.children.length, 2);
    assert.strictEqual(el.children[1].className, 'landing-card');
  });
});
