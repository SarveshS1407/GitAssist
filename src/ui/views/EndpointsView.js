import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * EndpointsView
 * Visualizes HTTP API endpoints, route methods, and source mappings
 */
export class EndpointsView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'API Endpoints & Route Inventory',
      description: 'Discovers and maps HTTP route definitions, REST endpoints, and handler locations across the codebase.',
      badge: 'Route Engine'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '🌐',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository to discover and catalog API endpoints.'
      }).render());
      return container;
    }

    const card = document.createElement('div');
    card.className = 'landing-card';
    card.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>🌐</span>
          <span>Discovered API Endpoints</span>
        </h3>
        <span class="landing-card-badge" id="endpoints-status-badge">Extracting Routes...</span>
      </div>
      <div id="endpoints-content-container" style="margin-top: 14px;">
        <p style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">Scanning source AST patterns for HTTP route handlers...</p>
      </div>
    `;
    container.appendChild(card);

    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      this.loadData(card);
    }

    return container;
  }

  async loadData(card) {
    const statusBadge = card.querySelector('#endpoints-status-badge');
    const content = card.querySelector('#endpoints-content-container');

    try {
      const res = await fetch('/api/analysis/endpoints');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const { totalEndpoints = 0, methods = {}, endpoints = [] } = data;

      if (statusBadge) {
        statusBadge.textContent = `${totalEndpoints} Endpoints Discovered`;
        statusBadge.style.color = totalEndpoints > 0 ? 'var(--success)' : '#94a3b8';
      }

      if (endpoints.length === 0) {
        content.innerHTML = `
          <div style="padding: 24px; text-align: center; color: var(--text-muted); font-family: var(--font-mono);">
            ℹ️ No standard HTTP endpoints detected (e.g. Express, Fastify, Flask).
          </div>
        `;
        return;
      }

      const summaryHtml = `
        <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
          <div class="stat-pill"><strong>${totalEndpoints}</strong> Total Routes</div>
          <div class="stat-pill"><strong style="color: #00f0ff;">${methods.GET || 0}</strong> GET</div>
          <div class="stat-pill"><strong style="color: #10b981;">${methods.POST || 0}</strong> POST</div>
          <div class="stat-pill"><strong style="color: #fbbf24;">${methods.PUT || 0}</strong> PUT</div>
          <div class="stat-pill"><strong style="color: #f87171;">${methods.DELETE || 0}</strong> DELETE</div>
        </div>
      `;

      const listHtml = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${endpoints.map(e => {
            const mColor = e.method === 'GET' ? '#00f0ff' : e.method === 'POST' ? '#10b981' : e.method === 'DELETE' ? '#f87171' : '#fbbf24';
            return `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(0,0,0,0.35); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06); font-family: var(--font-mono); font-size: 0.8rem;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 0.72rem; background: ${mColor}20; color: ${mColor}; border: 1px solid ${mColor}40;">
                    ${e.method}
                  </span>
                  <strong style="color: #f1f5f9;">${e.path}</strong>
                </div>
                <div style="font-size: 0.74rem; color: #94a3b8;">
                  📁 ${e.file}:${e.line} <span style="color: #64748b; margin-left: 6px;">[${e.framework}]</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      content.innerHTML = summaryHtml + listHtml;
    } catch (err) {
      if (statusBadge) statusBadge.textContent = 'Failed';
      content.innerHTML = `<p style="color: var(--danger); font-size: 0.85rem;">Error: ${err.message}</p>`;
    }
  }
}
