/**
 * LoadingState Component
 * Displays a phased Cyber-Forensic Archaeological Scan HUD
 */
export class LoadingState {
  constructor({ message = 'EXECUTING ARCHAEOLOGICAL SCAN...', subtext = 'Mapping AST symbols, dependency loops, and Git churn...' } = {}) {
    this.message = message;
    this.subtext = subtext;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'placeholder-card scan-radar-container';

    container.innerHTML = `
      <div class="radar-scope">
        <div class="radar-sweep"></div>
        <span style="font-size: 1.4rem; filter: drop-shadow(0 0 8px #00f0ff);">🏛️</span>
      </div>

      <div style="text-align: center;">
        <h3 style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 1.15rem; letter-spacing: 0.05em;">
          ${this.message}
        </h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">
          ${this.subtext}
        </p>
      </div>

      <div class="scan-progress-bar-container">
        <div class="scan-progress-bar"></div>
      </div>

      <div class="scan-diagnostics-list">
        <div class="scan-step completed">
          <span>✓</span>
          <span>Filesystem path verified</span>
        </div>
        <div class="scan-step completed">
          <span>✓</span>
          <span>Git lineage & HEAD commit identified</span>
        </div>
        <div class="scan-step active">
          <span>◉</span>
          <span>Parsing AST symbols & dependency topology...</span>
        </div>
        <div class="scan-step">
          <span>○</span>
          <span>Calculating maintainability index & churn hotspots</span>
        </div>
      </div>
    `;

    return container;
  }
}
