/**
 * AI View
 * Local natural language querying and architecture context packaging
 */
export class AiView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    container.innerHTML = `
      <div class="view-header">
        <h1 class="view-title">AI Assistant</h1>
        <p class="view-description">Local natural language querying and architecture context packaging.</p>
      </div>

      <div class="placeholder-card">
        <div style="font-size: 2.2rem;">🤖</div>
        <h3>Local AI & Context Packager</h3>
        <p>Query your repository offline or package targeted context blast radii for LLMs.</p>
        <span class="landing-card-badge" style="color: var(--accent-primary); border: 1px solid var(--border-default);">
          Feature Stage: Pending Repository Connection
        </span>
      </div>
    `;

    return container;
  }
}
