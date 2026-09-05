import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DuplicationView } from '../src/ui/views/DuplicationView.js';

describe('DuplicationView Component', () => {
  beforeEach(() => {
    // Setup minimal browser DOM environment if running in node
    if (typeof document === 'undefined') {
      global.document = {
        createElement: (tag) => {
          const el = {
            tagName: tag,
            className: '',
            style: {},
            children: [],
            appendChild: (child) => el.children.push(child),
            querySelector: () => null,
            querySelectorAll: () => []
          };
          return el;
        }
      };
    }
  });

  test('renders empty state when no repository is loaded', () => {
    const repositoryState = { isLoaded: false };
    const view = new DuplicationView({ repositoryState });
    const el = view.render();
    assert.strictEqual(el.className, 'view-container');
    assert.strictEqual(el.children.length, 2);
  });

  test('renders card container when repository is loaded', () => {
    const repositoryState = { isLoaded: true };
    const view = new DuplicationView({ repositoryState });
    const el = view.render();
    assert.strictEqual(el.className, 'view-container');
    assert.strictEqual(el.children.length, 2);
    assert.strictEqual(el.children[1].className, 'landing-card');
  });
});
