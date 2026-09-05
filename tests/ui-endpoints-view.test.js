import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { EndpointsView } from '../src/ui/views/EndpointsView.js';

describe('EndpointsView Component', () => {
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
    const view = new EndpointsView({ repositoryState });
    const el = view.render();
    assert.strictEqual(el.className, 'view-container');
    assert.strictEqual(el.children.length, 2);
  });

  test('renders endpoints card when repository is loaded', () => {
    const repositoryState = { isLoaded: true };
    const view = new EndpointsView({ repositoryState });
    const el = view.render();
    assert.strictEqual(el.className, 'view-container');
    assert.strictEqual(el.children.length, 2);
    assert.strictEqual(el.children[1].className, 'landing-card');
  });
});
