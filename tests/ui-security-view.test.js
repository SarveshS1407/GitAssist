import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { SecurityView } from '../src/ui/views/SecurityView.js';

describe('SecurityView Component', () => {
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
    const view = new SecurityView({ repositoryState });
    const el = view.render();
    assert.strictEqual(el.className, 'view-container');
    assert.strictEqual(el.children.length, 2);
  });

  test('renders security audit card when repository is loaded', () => {
    const repositoryState = { isLoaded: true };
    const view = new SecurityView({ repositoryState });
    const el = view.render();
    assert.strictEqual(el.className, 'view-container');
    assert.strictEqual(el.children.length, 2);
    assert.strictEqual(el.children[1].className, 'landing-card');
  });
});
