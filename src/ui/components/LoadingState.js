/**
 * LoadingState Component
 * Displays an animated loading spinner and message during indexing or analysis
 */
export class LoadingState {
  constructor({ message = 'Analyzing repository...', subtext = 'Parsing AST symbols and building dependency graph...' }) {
    this.message = message;
    this.subtext = subtext;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'placeholder-card loading-container';

    container.innerHTML = `
      <div class="loading-spinner"></div>
      <h3 style="color: var(--text-primary); font-size: 1.15rem; margin-top: 8px;">${this.message}</h3>
      <p style="color: var(--text-muted); font-size: 0.85rem;">${this.subtext}</p>
    `;

    return container;
  }
}
