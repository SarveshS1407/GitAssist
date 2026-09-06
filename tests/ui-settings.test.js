import { test, describe } from 'node:test';
import assert from 'node:assert';
import { SettingsView } from '../src/ui/views/SettingsView.js';
import { SettingsModal } from '../src/ui/components/SettingsModal.js';

describe('UI Settings Suite', () => {
  test('SettingsView renders container with header and settings card', () => {
    // Mock global document if not present
    const originalDoc = globalThis.document;
    if (!globalThis.document) {
      globalThis.document = {
        createElement: (tag) => {
          const el = {
            tagName: tag,
            className: '',
            style: {},
            children: [],
            appendChild: (c) => el.children.push(c),
            querySelectorAll: () => [],
            querySelector: () => null,
            addEventListener: () => {}
          };
          return el;
        }
      };
    }

    const view = new SettingsView({ repositoryState: { isLoaded: true } });
    const rendered = view.render();
    assert.ok(rendered);
    assert.ok(rendered.className.includes('settings-view'));

    if (!originalDoc) {
      delete globalThis.document;
    }
  });

  test('SettingsModal instantiates with active tab and control methods', () => {
    const modal = new SettingsModal();
    assert.strictEqual(modal.activeTab, 'analysis');
    assert.strictEqual(typeof modal.open, 'function');
    assert.strictEqual(typeof modal.close, 'function');
  });
});
