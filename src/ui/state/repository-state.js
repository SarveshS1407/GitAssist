/**
 * RepositoryState Store
 * Centralized observable state model for repository lifecycle and metadata
 */
export class RepositoryState {
  constructor() {
    this.state = {
      repositoryPath: null,
      repositoryName: null,
      branch: 'main',
      isLoaded: false,
      isIndexing: false,
      indexProgress: 0,
      indexingStage: 'DISCOVERING REPOSITORY',
      indexingTarget: '',
      error: null,
      summary: null
    };

    this.listeners = new Set();
  }

  /**
   * Subscribe a listener to state mutations
   * @param {Function} listener (state) => void
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    // Immediately emit current state on subscription
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  notify() {
    const snapshot = this.getState();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  getState() {
    return { ...this.state };
  }

  /**
   * Updates state when a repository is successfully validated or loaded
   */
  setRepository({ path, name, branch = 'main', summary = null }) {
    this.state = {
      ...this.state,
      repositoryPath: path,
      repositoryName: name || (path ? path.split('/').pop() : 'Unnamed'),
      branch: branch || 'main',
      isLoaded: true,
      isIndexing: false,
      indexProgress: 100,
      indexingStage: 'EXCAVATION COMPLETE',
      error: null,
      summary
    };
    this.notify();
  }

  /**
   * Updates indexing / excavation progress state
   */
  setIndexing(isIndexing, progress = 0, stage = 'DISCOVERING REPOSITORY', target = '') {
    this.state = {
      ...this.state,
      isIndexing,
      indexProgress: Math.min(100, Math.max(0, progress)),
      indexingStage: stage,
      indexingTarget: target || this.state.indexingTarget,
      error: isIndexing ? null : this.state.error
    };
    this.notify();
  }

  /**
   * Sets error state when excavation fails
   */
  setError(errorMessage, target = '') {
    this.state = {
      ...this.state,
      error: errorMessage,
      isIndexing: false,
      indexingTarget: target || this.state.indexingTarget
    };
    this.notify();
  }

  /**
   * Resets state back to unindexed landing state
   */
  reset() {
    this.state = {
      repositoryPath: null,
      repositoryName: null,
      branch: 'main',
      isLoaded: false,
      isIndexing: false,
      indexProgress: 0,
      indexingStage: 'DISCOVERING REPOSITORY',
      indexingTarget: '',
      error: null,
      summary: null
    };
    this.notify();
  }
}
