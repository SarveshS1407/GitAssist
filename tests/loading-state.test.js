import { test, describe } from 'node:test';
import assert from 'node:assert';
import { LoadingState } from '../src/ui/components/LoadingState.js';

// Setup minimal mock DOM
global.document = {
  createElement: (tag) => {
    let _innerHTML = '';
    return {
      tagName: tag.toUpperCase(),
      className: '',
      set innerHTML(val) { _innerHTML = val; },
      get innerHTML() { return _innerHTML; },
      appendChild: () => {},
      querySelector: () => ({ addEventListener: () => {} }),
      querySelectorAll: () => []
    };
  }
};

describe('LoadingState Component', () => {
  test('renders default stage and progress correctly', () => {
    const ls = new LoadingState();
    const el = ls.render();
    assert.ok(el);
    assert.strictEqual(el.className, 'excavation-container');
    assert.ok(el.innerHTML.includes('01 // DISCOVER'));
    assert.ok(el.innerHTML.includes('25%'));
  });

  test('reflects custom target repository and high progress stages', () => {
    const ls = new LoadingState({
      stage: 'SCANNING STRUCTURE & DIRECTORIES',
      progress: 45,
      target: '/Users/test/projects/veritas-mortis'
    });
    const el = ls.render();
    assert.ok(el.innerHTML.includes('veritas-mortis'));
    assert.ok(el.innerHTML.includes('45%'));
    assert.ok(el.innerHTML.includes('02 // SCAN STRATA'));
  });

  test('renders unlocked relic state when progress reaches 100', () => {
    const ls = new LoadingState({
      stage: 'EXCAVATION COMPLETE // UNLOCKING ARTIFACT',
      progress: 100,
      target: 'project-tycoon'
    });
    const el = ls.render();
    assert.ok(el.innerHTML.includes('unlocked'));
    assert.ok(el.innerHTML.includes('100%'));
  });
});
