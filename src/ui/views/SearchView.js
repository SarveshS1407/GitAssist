/**
 * Search View
 * Instant full-text indexing for symbols, definitions, and files
 */
export class SearchView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    container.innerHTML = `
      <div class="view-header">
        <h1 class="view-title">Search Index</h1>
        <p class="view-description">Instant full-text indexing for symbols, definitions, and files.</p>
      </div>

      <div class="placeholder-card">
        <div style="font-size: 2.2rem;">🔍</div>
        <h3>Repository Search Index</h3>
        <p>Type keywords to search across functions, classes, interfaces, and file names.</p>
        <span class="landing-card-badge" style="color: var(--accent-primary); border: 1px solid var(--border-default);">
          Feature Stage: Pending Repository Connection
        </span>
      </div>
    `;

    return container;
  }
}
