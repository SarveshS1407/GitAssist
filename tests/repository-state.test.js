import { test, describe } from 'node:test';
import assert from 'node:assert';
import { RepositoryState } from '../src/ui/state/repository-state.js';

describe('RepositoryState Store', () => {
  test('initializes with default unindexed state', () => {
    const store = new RepositoryState();
    const state = store.getState();
    assert.strictEqual(state.isLoaded, false);
    assert.strictEqual(state.repositoryPath, null);
    assert.strictEqual(state.repositoryName, null);
    assert.strictEqual(state.isIndexing, false);
    assert.strictEqual(state.error, null);
  });

  test('setIndexing tracks progressive excavation stages and target repository', () => {
    const store = new RepositoryState();
    store.setIndexing(true, 15, 'DISCOVERING REPOSITORY', '/path/to/my-repo');
    let state = store.getState();
    assert.strictEqual(state.isIndexing, true);
    assert.strictEqual(state.indexProgress, 15);
    assert.strictEqual(state.indexingStage, 'DISCOVERING REPOSITORY');
    assert.strictEqual(state.indexingTarget, '/path/to/my-repo');

    store.setIndexing(true, 75, 'MAPPING ARTIFACTS & EXTENSIONS');
    state = store.getState();
    assert.strictEqual(state.indexProgress, 75);
    assert.strictEqual(state.indexingStage, 'MAPPING ARTIFACTS & EXTENSIONS');
    assert.strictEqual(state.indexingTarget, '/path/to/my-repo');

    store.setError('Permission denied', '/path/to/my-repo');
    state = store.getState();
    assert.strictEqual(state.isIndexing, false);
    assert.strictEqual(state.error, 'Permission denied');
    assert.strictEqual(state.indexingTarget, '/path/to/my-repo');
  });

  test('setRepository updates state and notifies subscribers', () => {
    const store = new RepositoryState();
    let emissions = 0;
    let lastState = null;

    const unsubscribe = store.subscribe((s) => {
      emissions++;
      lastState = s;
    });

    assert.strictEqual(emissions, 1, 'Emits initial state on subscribe');

    store.setRepository({
      path: '/Users/test/projects/my-repo',
      name: 'my-repo',
      branch: 'feature/branch'
    });

    assert.strictEqual(emissions, 2);
    assert.strictEqual(lastState.isLoaded, true);
    assert.strictEqual(lastState.repositoryName, 'my-repo');
    assert.strictEqual(lastState.branch, 'feature/branch');
    assert.strictEqual(lastState.error, null);

    unsubscribe();
  });

  test('setError updates error state and halts indexing', () => {
    const store = new RepositoryState();
    store.setIndexing(true, 50);
    assert.strictEqual(store.getState().isIndexing, true);

    store.setError('Directory not found');
    const state = store.getState();
    assert.strictEqual(state.error, 'Directory not found');
    assert.strictEqual(state.isIndexing, false);
  });

  test('reset restores initial state', () => {
    const store = new RepositoryState();
    store.setRepository({ path: '/foo/bar', name: 'bar' });
    assert.strictEqual(store.getState().isLoaded, true);

    store.reset();
    assert.strictEqual(store.getState().isLoaded, false);
    assert.strictEqual(store.getState().repositoryPath, null);
  });
});
