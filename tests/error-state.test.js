import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { ErrorState } from '../src/ui/components/ErrorState.js';

describe('ErrorState Component', () => {
  let listeners = {};

  beforeEach(() => {
    listeners = {};
    global.document = {
      createElement: () => ({
        className: '',
        innerHTML: '',
        querySelector: (selector) => ({
          addEventListener: (event, handler) => {
            listeners[selector] = handler;
          }
        }),
        triggerClick: (selector) => {
          if (listeners[selector]) listeners[selector]();
        }
      })
    };
  });

  test('renders error title and message correctly', () => {
    const errorComponent = new ErrorState({
      title: 'EXCAVATION FAILED',
      message: 'Failed to access repository directory'
    });

    const el = errorComponent.render();
    assert.ok(el);
    assert.strictEqual(el.className, 'excavation-failure-card');
    assert.ok(el.innerHTML.includes('EXCAVATION FAILED'));
    assert.ok(el.innerHTML.includes('Failed to access repository directory'));
  });

  test('wires onRetry and onBack handlers properly', () => {
    let retryCalled = false;
    let backCalled = false;

    const comp = new ErrorState({
      message: 'Network timeout',
      onRetry: () => { retryCalled = true; },
      onBack: () => { backCalled = true; }
    });

    const el = comp.render();
    assert.ok(el);
    el.triggerClick('#btn-error-retry');
    assert.strictEqual(retryCalled, true);

    el.triggerClick('#btn-error-back');
    assert.strictEqual(backCalled, true);
  });
});
