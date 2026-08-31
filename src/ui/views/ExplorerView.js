/**
 * Explorer View
 * Interactive file tree navigation and code symbol inspection
 */
export class ExplorerView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    container.innerHTML = `
      <div class="view-header">
        <h1 class="view-title">Explorer</h1>
        <p class="view-description">Interactive file tree navigation and code symbol inspection.</p>
      </div>

      <div class="placeholder-card">
        <div style="font-size: 2.2rem;">📁</div>
        <h3>File Tree & AST Symbol Explorer</h3>
        <p>Browse directories, files, functions, and classes across the repository.</p>
        <span class="landing-card-badge" style="color: var(--accent-primary); border: 1px solid var(--border-default);">
          Feature Stage: Pending Repository Connection
        </span>
      </div>
    `;

    return container;
  }
}
