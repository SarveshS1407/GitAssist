import { LandingView } from './LandingView.js';
import { PageHeader } from '../components/PageHeader.js';
import { StatCard } from '../components/StatCard.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';

/**
 * Overview View
 * Central Archaeological Action Carousel & Action Selector Workspace
 */
export class OverviewView {
  constructor({ repositoryState, onOpenRepository, onQuickAnalyze }) {
    this.repositoryState = repositoryState;
    this.onOpenRepository = onOpenRepository;
    this.onQuickAnalyze = onQuickAnalyze;
    this.selectedAction = 'architecture';
  }

  render() {
    // 1. Loading State
    if (this.repositoryState?.isIndexing) {
      const container = document.createElement('div');
      container.className = 'view-container';
      container.appendChild(new LoadingState().render());
      return container;
    }

    // 2. Dedicated Minimalist Homescreen (when not loaded)
    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      return new LandingView({
        onOpenRepository: this.onOpenRepository,
        onQuickAnalyze: this.onQuickAnalyze,
        error: this.repositoryState?.error,
        onClearError: () => {
          if (this.repositoryState) this.repositoryState.error = null;
        }
      }).render();
    }

    // 3. Error State (if error occurs after being loaded)
    if (this.repositoryState?.error) {
      const container = document.createElement('div');
      container.className = 'view-container';
      container.appendChild(new ErrorState({
        title: 'ARCHAEOLOGICAL EXCAVATION HALTED',
        message: this.repositoryState.error,
        onRetry: this.onOpenRepository
      }).render());
      return container;
    }

    // 4. Active Archaeological Workspace & Cylindrical Action Carousel
    const summary = this.repositoryState.summary || {};
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: summary.name || this.repositoryState.repositoryName || 'EXCAVATION SECTOR',
      description: `PATH: ${summary.path || this.repositoryState.repositoryPath} • BRANCH: ${summary.branch || 'main'}`,
      badge: summary.isValidGit ? 'EXCAVATION ACTIVE' : 'LOCAL REPO',
      actions: [
        {
          label: 'CHANGE REPOSITORY',
          icon: '📁',
          variant: 'secondary',
          onClick: this.onOpenRepository
        }
      ]
    });
    container.appendChild(header.render());

    // Stat Cards Horizon
    const statGrid = document.createElement('div');
    statGrid.className = 'landing-grid';

    const totalLoc = summary.totalLines ? summary.totalLines.toLocaleString() : '—';
    const totalFiles = summary.totalFiles ? summary.totalFiles.toString() : '—';
    const mi = summary.avgMaintainability !== undefined ? `${summary.avgMaintainability} / 100` : '100 / 100';
    const langCount = summary.languages ? Object.keys(summary.languages).length.toString() : '1';

    statGrid.appendChild(new StatCard({
      label: 'Excavated Lines',
      value: totalLoc,
      subtext: 'Calculated source lines',
      icon: '📝'
    }).render());

    statGrid.appendChild(new StatCard({
      label: 'Mapped Artifacts',
      value: totalFiles,
      subtext: 'Indexed files across repo',
      icon: '📁'
    }).render());

    statGrid.appendChild(new StatCard({
      label: 'Maintainability',
      value: mi,
      subtext: 'Cyclomatic complexity rating',
      icon: '⚡',
      trend: summary.avgMaintainability >= 70 ? '✓ HIGH HEALTH' : '⚠️ ELEVATED CHURN'
    }).render());

    statGrid.appendChild(new StatCard({
      label: 'Technologies',
      value: langCount,
      subtext: 'Identified languages',
      icon: '🌐'
    }).render());

    container.appendChild(statGrid);

    // Central Cylindrical Investigation Action Carousel
    const carouselSection = document.createElement('div');
    carouselSection.className = 'holomap-canvas-container';

    const actionItems = [
      { id: 'architecture', icon: '🕸️', title: 'Architecture', meta: 'Module Topology & Mermaid Graph', badge: 'Structural Map' },
      { id: 'impact', icon: '💥', title: 'Impact Radius', meta: 'Blast Radius & Dependency Callers', badge: 'Ripple Analysis' },
      { id: 'explorer', icon: '📁', title: 'Source Explorer', meta: 'AST Symbol Hierarchy & Code Viewer', badge: 'File Inspector' },
      { id: 'search', icon: '🔍', title: 'Forensic Search', meta: 'Symbols, Functions & Text Matches', badge: 'Query Engine' },
      { id: 'git', icon: '📜', title: 'Git History', meta: 'Chrono-Strata & Author Timeline', badge: 'Read-Only Git' },
      { id: 'analysis', icon: '⚡', title: 'Drift & Hotspots', meta: 'High Churn & Complexity Risk Score', badge: 'Risk Matrix' },
      { id: 'archaeology', icon: '🏛️', title: 'Archaeology', meta: 'Evolutionary Lineage & Genesis', badge: 'Synthesis' },
      { id: 'documentation', icon: '📖', title: 'Documentation', meta: 'Deterministic Architecture Specs', badge: 'Auto-Doc' },
      { id: 'review', icon: '🛡️', title: 'Code Review', meta: 'Automated Heuristic Health Audit', badge: 'Audit Engine' },
      { id: 'ai', icon: '🤖', title: 'AI Field Dossier', meta: 'Offline Natural Language Q&A', badge: 'Local Engine' }
    ];

    const cardsHtml = actionItems.map((a, idx) => `
      <div class="strata-card ${a.id === this.selectedAction ? 'active' : ''}" data-action="${a.id}">
        <div class="strata-card-title"><span>${a.icon}</span><span>${a.title}</span></div>
        <div class="strata-card-meta">${a.meta}</div>
        <div class="strata-card-badge">${a.badge}</div>
      </div>
    `).join('');

    carouselSection.innerHTML = `
      <div class="holomap-canvas-header">
        <h3 class="holomap-title">
          <span>◈</span>
          <span>CYLINDRICAL INVESTIGATION CAROUSEL // SELECT ACTION</span>
        </h3>
        <span class="landing-card-badge">Primary Action Selector</span>
      </div>

      <div class="strata-deck-viewport">
        <div class="strata-deck" id="action-strata-deck">
          ${cardsHtml}
        </div>
      </div>
    `;

    container.appendChild(carouselSection);

    // Dual Grid: Languages Left + Selected Investigation Action Dossier Right
    const dualGrid = document.createElement('div');
    dualGrid.className = 'archaeology-dual-grid';

    // Left: Languages
    const langSection = document.createElement('div');
    langSection.className = 'landing-card';

    const langRows = Object.entries(summary.languages || {})
      .map(([lang, data]) => `
        <div style="display: flex; flex-direction: column; gap: 4px; padding: 6px 0; border-bottom: 1px solid var(--border-strata); font-size: 0.85rem;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 700; color: var(--text-primary);">${lang}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">(${data.files} files)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; font-family: var(--font-mono);">
              <span style="color: var(--text-secondary);">${data.lines.toLocaleString()} LOC</span>
              <span style="color: var(--accent-cyan); font-weight: 700;">${data.percentage}%</span>
            </div>
          </div>
          <div style="width: 100%; height: 4px; background: var(--bg-input); border-radius: 2px; overflow: hidden;">
            <div style="width: ${data.percentage}%; height: 100%; background: var(--accent-cyan); box-shadow: 0 0 6px var(--accent-cyan);"></div>
          </div>
        </div>
      `).join('');

    langSection.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>📊</span>
          <span>Language Strata Share</span>
        </h3>
        <span class="landing-card-badge">Telemetry</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
        ${langRows || '<p style="color: var(--text-muted); font-size: 0.85rem;">No files detected.</p>'}
      </div>
    `;

    dualGrid.appendChild(langSection);

    // Right: Action Launch Blade
    const dossierSection = document.createElement('div');
    dossierSection.className = 'dossier-blade';
    dossierSection.id = 'action-dossier-container';

    this.renderActionDossier(dossierSection, this.selectedAction);
    dualGrid.appendChild(dossierSection);

    container.appendChild(dualGrid);

    // Wire up Carousel Cards to rotate and update Dossier Blade
    carouselSection.querySelectorAll('.strata-card').forEach(card => {
      card.addEventListener('click', () => {
        carouselSection.querySelectorAll('.strata-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const actionId = card.dataset.action;
        this.selectedAction = actionId;
        this.renderActionDossier(dossierSection, actionId);
      });
    });

    return container;
  }

  renderActionDossier(container, actionId) {
    const actionDetails = {
      architecture: {
        title: 'Investigation: Architecture & Topology',
        type: 'Structural Mapping',
        icon: '🕸️',
        description: 'Explore the high-level components of this repository, module boundaries, and living Mermaid dependency graphs.',
        cta: 'EXPLORE ARCHITECTURE TOPOLOGY'
      },
      impact: {
        title: 'Investigation: Impact & Blast Radius',
        type: 'Ripple Analysis',
        icon: '💥',
        description: 'Calculate dependency blast radius and upstream caller ripple effects for any selected file or symbol before modifying it.',
        cta: 'CALCULATE BLAST RADIUS'
      },
      explorer: {
        title: 'Investigation: Source Explorer',
        type: 'Code & AST Inspector',
        icon: '📁',
        description: 'Browse the repository file hierarchy, inspect extracted classes/functions, and view in-browser source code.',
        cta: 'OPEN SOURCE EXPLORER'
      },
      search: {
        title: 'Investigation: Forensic Code Search',
        type: 'Index Query Engine',
        icon: '🔍',
        description: 'Query classes, function definitions, exported symbols, and full text across the AST inverted index.',
        cta: 'LAUNCH FORENSIC SEARCH'
      },
      git: {
        title: 'Investigation: Git Chrono-Strata',
        type: 'Lineage Timeline',
        icon: '📜',
        description: 'Inspect chronological commit lineage, author ownership, and branch history in safe read-only mode.',
        cta: 'VIEW GIT TIMELINE'
      },
      analysis: {
        title: 'Investigation: Drift & Hotspot Matrix',
        type: 'Risk Telemetry',
        icon: '⚡',
        description: 'Identify high-churn files, cyclomatic complexity spikes, and circular dependency loops.',
        cta: 'OPEN RISK HOTSPOTS'
      },
      archaeology: {
        title: 'Investigation: Evolutionary Synthesis',
        type: 'Archaeological Digest',
        icon: '🏛️',
        description: 'Synthesize the holistic history of how this software system was constructed from genesis to current strata.',
        cta: 'SYNTHESIZE ARCHAEOLOGY'
      },
      documentation: {
        title: 'Investigation: Subsystem Docs',
        type: 'Specification Generator',
        icon: '📖',
        description: 'Generate deterministic architecture specifications, subsystem contracts, and exportable Markdown reports.',
        cta: 'VIEW SPECIFICATIONS'
      },
      review: {
        title: 'Investigation: Automated Code Review',
        type: 'Heuristic Audit',
        icon: '🛡️',
        description: 'Perform an automated structural audit for oversized modules, TODO flags, and maintainability bottlenecks.',
        cta: 'RUN CODE REVIEW'
      },
      ai: {
        title: 'Investigation: AI Field Dossier',
        type: 'Local Neural Q&A',
        icon: '🤖',
        description: 'Ask natural language questions about the codebase architecture and package structured prompt context.',
        cta: 'CONSULT AI DOSSIER'
      }
    };

    const details = actionDetails[actionId] || actionDetails.architecture;

    container.innerHTML = `
      <div class="dossier-blade-header">
        <h4 class="dossier-title">
          <span>${details.icon}</span>
          <span>${details.title}</span>
        </h4>
        <span class="landing-card-badge" style="color: var(--accent-cyan); border-color: var(--accent-cyan);">${details.type}</span>
      </div>

      <div class="dossier-meta-grid">
        <div class="dossier-meta-item">
          <span class="dossier-meta-label">Selected Action</span>
          <span class="dossier-meta-val">${actionId.toUpperCase()}</span>
        </div>
        <div class="dossier-meta-item">
          <span class="dossier-meta-label">Engine Status</span>
          <span class="dossier-meta-val" style="color: var(--success);">ONLINE // READY</span>
        </div>
      </div>

      <div class="dossier-section">
        <div class="dossier-section-title">◈ INVESTIGATION PURPOSE:</div>
        <p class="dossier-findings-text" style="font-size: 0.85rem; line-height: 1.55;">
          ${details.description}
        </p>
      </div>

      <div style="margin-top: 14px;">
        <button class="btn-primary" id="btn-launch-action" style="width: 100%; justify-content: center; padding: 12px 18px; font-size: 0.88rem;">
          <span>🚀</span>
          <span>${details.cta}</span>
        </button>
      </div>
    `;

    container.querySelector('#btn-launch-action').addEventListener('click', () => {
      window.location.hash = actionId;
    });
  }
}
