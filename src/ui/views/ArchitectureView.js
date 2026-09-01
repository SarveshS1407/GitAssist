import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Architecture View
 * Visual dependency topology and subsystem interaction map
 */
export class ArchitectureView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Architecture & Dependency Topology',
      description: 'Interactive structural maps of modules, subsystems, and dependency relationships.',
      badge: 'Graph Engine'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '🕸️',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository from the Central Telemetry overview to inspect its subsystem architecture map.'
      }).render());
      return container;
    }

    const card = document.createElement('div');
    card.className = 'landing-card';

    card.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>🕸️</span>
          <span>Layered Subsystem Interaction Graph</span>
        </h3>
        <span class="landing-card-badge">Mermaid Map</span>
      </div>

      <div style="background: var(--bg-input); border: 1px solid var(--border-hud); border-radius: 8px; padding: 24px; font-family: var(--font-mono); font-size: 0.82rem; line-height: 1.7; color: var(--text-secondary); margin-top: 10px; overflow-x: auto;">
        <div style="color: var(--accent-cyan); font-weight: 700; margin-bottom: 8px;">◈ SUBSYSTEM TOPOLOGY & DATA FLOW:</div>
        <div>[Frontend UI] ──(HTTP / REST API)──► [API Dispatcher (routes.js)]</div>
        <div style="padding-left: 200px;">│</div>
        <div style="padding-left: 200px;">▼</div>
        <div style="padding-left: 140px;">[RepositoryService] ◄──► [GitService]</div>
        <div style="padding-left: 200px;">│</div>
        <div style="padding-left: 100px;">┌───────────┴───────────┐</div>
        <div style="padding-left: 100px;">▼                       ▼</div>
        <div style="padding-left: 50px;">[AST Parser & Scanner]   [Metrics & Cycles Detector]</div>
      </div>

      <div style="display: flex; gap: 12px; margin-top: 14px;">
        <button class="btn-primary" id="btn-export-diagram">
          <span>📊</span>
          <span>EXPORT ARCHITECTURE DIAGRAM</span>
        </button>
      </div>
    `;

    container.appendChild(card);
    return container;
  }
}
