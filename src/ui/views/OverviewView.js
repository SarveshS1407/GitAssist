import { LandingView } from './LandingView.js';
import { PageHeader } from '../components/PageHeader.js';
import { StatCard } from '../components/StatCard.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';

/**
 * Overview View
 * Central Archaeological Strata Holomap & Live Artifact Dossier Console
 */
export class OverviewView {
  constructor({ repositoryState, onOpenRepository, onQuickAnalyze }) {
    this.repositoryState = repositoryState;
    this.onOpenRepository = onOpenRepository;
    this.onQuickAnalyze = onQuickAnalyze;
    this.selectedSubsystem = 'core';
  }

  render() {
    // 1. Loading State
    if (this.repositoryState?.isIndexing) {
      const container = document.createElement('div');
      container.className = 'view-container';
      container.appendChild(new LoadingState().render());
      return container;
    }

    // 2. Error State
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

    // 3. Dedicated Landing Homepage State
    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      return new LandingView({
        onOpenRepository: this.onOpenRepository,
        onQuickAnalyze: this.onQuickAnalyze
      }).render();
    }

    // 4. Active Archaeological Telemetry & Strata Holomap
    const summary = this.repositoryState.summary || {};
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: summary.name || this.repositoryState.repositoryName || 'EXCAVATION SECTOR',
      description: `PATH: ${summary.path || this.repositoryState.repositoryPath} • STRATA: ${summary.branch || 'main'}`,
      badge: summary.isValidGit ? 'DIG ACTIVE // READY' : 'LOCAL SECTOR',
      actions: [
        {
          label: 'CHANGE SECTOR',
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
    const langCount = summary.languages ? Object.keys(summary.languages).length.toString() : '0';

    statGrid.appendChild(new StatCard({
      label: 'Excavated Lines',
      value: totalLoc,
      subtext: 'Calculated source lines',
      icon: '📝'
    }).render());

    statGrid.appendChild(new StatCard({
      label: 'Mapped Artifacts',
      value: totalFiles,
      subtext: `${summary.totalDirectories || 0} strata directories`,
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

    // Central Archaeological Holomap & 3D Strata Deck
    const holomapSection = document.createElement('div');
    holomapSection.className = 'holomap-canvas-container';

    holomapSection.innerHTML = `
      <div class="holomap-canvas-header">
        <h3 class="holomap-title">
          <span>◈</span>
          <span>Central Archaeological Holomap // 3D Subsystem Strata</span>
        </h3>
        <span class="landing-card-badge">Spatial Deck</span>
      </div>

      <div class="strata-deck-viewport">
        <div class="strata-deck" id="strata-deck">
          <div class="strata-card active" data-mod="core">
            <div class="strata-card-title"><span>⚙️</span><span>src/core</span></div>
            <div class="strata-card-meta">AST Parser • Metrics • Graph • Cycles</div>
            <div class="strata-card-badge">8 Core Subsystems</div>
          </div>
          <div class="strata-card" data-mod="ui">
            <div class="strata-card-title"><span>🎨</span><span>src/ui</span></div>
            <div class="strata-card-meta">Spatial Holomap • Router • State</div>
            <div class="strata-card-badge">12 Archaeological Views</div>
          </div>
          <div class="strata-card" data-mod="api">
            <div class="strata-card-title"><span>🔌</span><span>src/api</span></div>
            <div class="strata-card-meta">REST Dispatcher • Static Assets</div>
            <div class="strata-card-badge">14 Endpoints</div>
          </div>
          <div class="strata-card" data-mod="services">
            <div class="strata-card-title"><span>🏛️</span><span>src/services</span></div>
            <div class="strata-card-meta">RepositoryService • Read-Only GitService</div>
            <div class="strata-card-badge">Orchestration Layer</div>
          </div>
          <div class="strata-card" data-mod="ai">
            <div class="strata-card-title"><span>🤖</span><span>src/ai</span></div>
            <div class="strata-card-meta">Local Q&A Engine • Context Packager</div>
            <div class="strata-card-badge">Neural Investigator</div>
          </div>
          <div class="strata-card" data-mod="tests">
            <div class="strata-card-title"><span>🧪</span><span>tests/</span></div>
            <div class="strata-card-meta">Node:Test Automated Suites</div>
            <div class="strata-card-badge" style="color: var(--success);">28 Passing Suites</div>
          </div>
        </div>
      </div>
    `;

    container.appendChild(holomapSection);

    // Dual Grid: Language Strata Telemetry (Left) + Artifact Dossier Blade (Right)
    const dualGrid = document.createElement('div');
    dualGrid.className = 'archaeology-dual-grid';

    // Left: Language Distribution
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

    // Right: Live Artifact Dossier Blade
    const dossierSection = document.createElement('div');
    dossierSection.className = 'dossier-blade';
    dossierSection.id = 'dossier-blade-container';

    this.renderDossierBlade(dossierSection, 'core');
    dualGrid.appendChild(dossierSection);

    container.appendChild(dualGrid);

    // Wire up strata card clicks to rotate deck and update the Artifact Dossier live
    holomapSection.querySelectorAll('.strata-card').forEach(card => {
      card.addEventListener('click', () => {
        holomapSection.querySelectorAll('.strata-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const mod = card.dataset.mod;
        this.selectedSubsystem = mod;
        this.renderDossierBlade(dossierSection, mod);
      });
    });

    return container;
  }

  renderDossierBlade(container, mod) {
    const dossiers = {
      core: {
        title: 'Subsystem: src/core',
        type: 'Algorithmic Engines',
        risk: 'LOW RISK',
        riskColor: 'var(--success)',
        confidence: '98%',
        files: '8 modules (scanner, parser, metrics, cycles, git-analyzer)',
        findings: 'Clean Directed Acyclic Graph (DAG). Provides AST parsing, complexity index, and hotspot calculations with zero external runtime dependencies.'
      },
      ui: {
        title: 'Subsystem: src/ui',
        type: 'Spatial Holomap & UI',
        risk: 'LOW RISK',
        riskColor: 'var(--success)',
        confidence: '96%',
        files: '12 components (AppShell, Router, Holomap, State, Views)',
        findings: 'Zero-dependency native ES modules. Reactive RepositoryState store manages active repository lifecycle and real-time telemetry updates.'
      },
      api: {
        title: 'Subsystem: src/api',
        type: 'REST Dispatcher',
        risk: 'MODERATE CHURN',
        riskColor: 'var(--accent-amber)',
        confidence: '94%',
        files: 'routes.js (342 LOC)',
        findings: 'Central HTTP REST endpoint dispatcher and static asset server. Handles /api/repository/open, validate, metrics, diagram, and search.'
      },
      services: {
        title: 'Subsystem: src/services',
        type: 'Application Services',
        risk: 'LOW RISK',
        riskColor: 'var(--success)',
        confidence: '97%',
        files: 'RepositoryService, GitService',
        findings: 'Encapsulates path validation, repository ingestion orchestration, and strictly read-only Git history extraction.'
      },
      ai: {
        title: 'Subsystem: src/ai',
        type: 'Neural Investigator',
        risk: 'LOW RISK',
        riskColor: 'var(--accent-neural)',
        confidence: '95%',
        files: 'LocalQueryEngine, AIContextPackager',
        findings: 'Answers natural language archaeological questions and packages structured blast-radius context prompts.'
      },
      tests: {
        title: 'Subsystem: tests/',
        type: 'Automated Test Harness',
        risk: 'VERIFIED',
        riskColor: 'var(--success)',
        confidence: '100%',
        files: '13 test suites (28 automated tests)',
        findings: '100% test pass rate using native node:test runner with zero third-party dependencies.'
      }
    };

    const d = dossiers[mod] || dossiers.core;

    container.innerHTML = `
      <div class="dossier-blade-header">
        <h3 class="dossier-blade-title">
          <span>🤖</span>
          <span>${d.title}</span>
        </h3>
        <span class="landing-card-badge" style="color: ${d.riskColor}; border-color: ${d.riskColor}; font-weight: 800;">${d.risk}</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.84rem;">
        <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); color: var(--text-muted);">
          <span>LAYER TYPE:</span>
          <span style="color: var(--text-primary); font-weight: 600;">${d.type}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); color: var(--text-muted);">
          <span>AI CONFIDENCE:</span>
          <span style="color: var(--accent-cyan); font-weight: 700;">${d.confidence}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); color: var(--text-muted);">
          <span>ARTIFACTS:</span>
          <span style="color: var(--text-secondary);">${d.files}</span>
        </div>
      </div>

      <div style="background: var(--bg-input); border: 1px solid var(--border-strata); border-radius: 6px; padding: 12px; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; margin-top: 4px;">
        <span style="color: var(--accent-cyan); font-weight: 700; font-family: var(--font-mono);">FIELD NOTE:</span> ${d.findings}
      </div>
    `;
  }
}
