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
  constructor({ repositoryState, onOpenRepository, onQuickAnalyze, onReset, onClearError } = {}) {
    this.repositoryState = repositoryState;
    this.onOpenRepository = onOpenRepository;
    this.onQuickAnalyze = onQuickAnalyze;
    this.onReset = onReset;
    this.onClearError = onClearError;
    this.selectedAction = 'architecture';
  }

  render() {
    // 1. Excavation Mode HUD (Loading / Scanning Sequence)
    if (this.repositoryState?.isIndexing) {
      const container = document.createElement('div');
      container.className = 'view-container';
      container.appendChild(new LoadingState({
        stage: this.repositoryState?.indexingStage || 'DISCOVERING REPOSITORY',
        progress: this.repositoryState?.indexProgress || 25,
        target: this.repositoryState?.indexingTarget || this.repositoryState?.repositoryPath || '',
        onCancel: this.onReset
      }).render());
      return container;
    }

    // 2. Error State (Excavation Failed)
    if (this.repositoryState?.error) {
      const container = document.createElement('div');
      container.className = 'view-container';
      container.appendChild(new ErrorState({
        title: 'EXCAVATION FAILED',
        message: this.repositoryState.error,
        onRetry: () => {
          const target = this.repositoryState?.indexingTarget || this.repositoryState?.repositoryPath;
          if (this.onQuickAnalyze && target) {
            this.onQuickAnalyze(target);
          } else if (this.onOpenRepository) {
            this.onOpenRepository();
          }
        },
        onBack: () => {
          if (this.onClearError) {
            this.onClearError();
          } else if (this.onReset) {
            this.onReset();
          }
        }
      }).render());
      return container;
    }

    // 3. Dedicated Minimalist Homescreen (when not loaded)
    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      return new LandingView({
        onOpenRepository: this.onOpenRepository,
        onQuickAnalyze: this.onQuickAnalyze,
        error: this.repositoryState?.error,
        onClearError: () => {
          if (this.onClearError) {
            this.onClearError();
          } else if (this.repositoryState) {
            this.repositoryState.error = null;
          }
        }
      }).render();
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

    // Stat Cards Horizon with Multi-Colored Futuristic Cyber Lighting
    const statGrid = document.createElement('div');
    statGrid.className = 'landing-grid';

    const totalLoc = summary.totalLines ? summary.totalLines.toLocaleString() : '—';
    const totalFiles = summary.totalFiles ? summary.totalFiles.toString() : '—';
    const mi = summary.avgMaintainability !== undefined ? `${summary.avgMaintainability} / 100` : '95 / 100';
    const langCount = summary.languages ? Object.keys(summary.languages).length.toString() : '1';

    statGrid.appendChild(new StatCard({
      label: 'EXCAVATED STRATA',
      value: totalLoc,
      subtext: 'Verified source code lines',
      icon: '⚡',
      variant: 'cyan'
    }).render());

    statGrid.appendChild(new StatCard({
      label: 'INDEXED ARTIFACTS',
      value: totalFiles,
      subtext: 'Indexed files & AST trees',
      icon: '💎',
      variant: 'purple'
    }).render());

    statGrid.appendChild(new StatCard({
      label: 'SYSTEM INTEGRITY',
      value: mi,
      subtext: 'Cyclomatic health score',
      icon: '🛡️',
      variant: 'emerald',
      trend: summary.avgMaintainability >= 70 ? '✓ HIGH HEALTH' : '⚠️ ELEVATED CHURN'
    }).render());

    statGrid.appendChild(new StatCard({
      label: 'TECH ECOSYSTEM',
      value: langCount,
      subtext: 'Identified languages & formats',
      icon: '🌐',
      variant: 'amber'
    }).render());

    container.appendChild(statGrid);

    // Central Cylindrical Investigation Action Carousel
    const carouselSection = document.createElement('div');
    carouselSection.className = 'holomap-canvas-container';

    const actionItems = [
      { id: 'architecture', icon: '🕸️', title: 'Architecture', meta: 'Module Topology & Mermaid Graph', badge: 'Structural Map', theme: 'card-cyan' },
      { id: 'impact', icon: '💥', title: 'Impact Radius', meta: 'Blast Radius & Dependency Callers', badge: 'Ripple Analysis', theme: 'card-coral' },
      { id: 'explorer', icon: '📁', title: 'Source Explorer', meta: 'AST Symbol Hierarchy & Code Viewer', badge: 'File Inspector', theme: 'card-blue' },
      { id: 'search', icon: '🔍', title: 'Forensic Search', meta: 'Symbols, Functions & Text Matches', badge: 'Query Engine', theme: 'card-purple' },
      { id: 'git', icon: '📜', title: 'Git History', meta: 'Chrono-Strata & Author Timeline', badge: 'Read-Only Git', theme: 'card-amber' },
      { id: 'analysis', icon: '⚡', title: 'Drift & Hotspots', meta: 'High Churn & Complexity Risk Score', badge: 'Risk Matrix', theme: 'card-orange' },
      { id: 'archaeology', icon: '🏛️', title: 'Archaeology', meta: 'Evolutionary Lineage & Genesis', badge: 'Synthesis', theme: 'card-violet' },
      { id: 'risk', icon: '⚡', title: 'Risk Map', meta: 'Measurable Structural Risk Matrix', badge: 'Risk Scoring', theme: 'card-rose' },
      { id: 'features', icon: '🗺️', title: 'Feature Mapping', meta: 'Functional Subsystem Clustering', badge: 'Feature Map', theme: 'card-cyan' },
      { id: 'tests', icon: '🧪', title: 'Test Intelligence', meta: 'Automated Suite Discovery', badge: 'Test Harness', theme: 'card-emerald' },
      { id: 'bugs', icon: '🐛', title: 'Bug Archaeology', meta: 'Historical Defect & Patch Traces', badge: 'Defect Tracer', theme: 'card-crimson' },
      { id: 'deadcode', icon: '🍂', title: 'Dead Code', meta: 'Potentially Isolated Modules', badge: 'Pruning', theme: 'card-amber' },
      { id: 'manifests', icon: '📦', title: 'Dependencies', meta: 'Package Manifests & Ecosystem', badge: 'Manifests', theme: 'card-blue' },
      { id: 'review', icon: '🛡️', title: 'Code Review', meta: 'Automated Heuristic Health Audit', badge: 'Audit Engine', theme: 'card-teal' },
      { id: 'documentation', icon: '📖', title: 'Documentation', meta: 'Deterministic Architecture Specs', badge: 'Auto-Doc', theme: 'card-purple' },
      { id: 'ai', icon: '🤖', title: 'Codebase Q&A', meta: 'Offline Natural Language Q&A', badge: 'Local Engine', theme: 'card-magenta' }
    ];

    const cardsHtml = actionItems.map(a => `
      <div class="strata-card ${a.theme} ${a.id === this.selectedAction ? 'active' : ''}" data-action="${a.id}">
        <div class="strata-card-corner tl"></div>
        <div class="strata-card-corner tr"></div>
        <div class="strata-card-title"><span>${a.icon}</span><span>${a.title}</span></div>
        <div class="strata-card-meta">${a.meta}</div>
        <div class="strata-card-badge">${a.badge}</div>
      </div>
    `).join('');

    carouselSection.innerHTML = `
      <div class="holomap-canvas-header">
        <h3 class="holomap-title">
          <span class="holomap-icon">◈</span>
          <span class="text-gradient-cyber">CYLINDRICAL INVESTIGATION CAROUSEL // SELECT ACTION</span>
        </h3>
        <span class="landing-card-badge neon-badge">Primary Action Selector</span>
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

    // Multi-color palette for authentic cyber language strata
    const languagePalette = {
      'TypeScript': { bar: 'linear-gradient(90deg, #3178c6, #00f0ff)', text: '#00f0ff', dot: '#00f0ff' },
      'TypeScript React': { bar: 'linear-gradient(90deg, #0284c7, #38bdf8)', text: '#38bdf8', dot: '#38bdf8' },
      'JavaScript': { bar: 'linear-gradient(90deg, #ca8a04, #fde047)', text: '#fde047', dot: '#fde047' },
      'JavaScript React': { bar: 'linear-gradient(90deg, #0ea5e9, #67e8f9)', text: '#67e8f9', dot: '#67e8f9' },
      'Python': { bar: 'linear-gradient(90deg, #2563eb, #fbbf24)', text: '#60a5fa', dot: '#60a5fa' },
      'HTML': { bar: 'linear-gradient(90deg, #ea580c, #fb923c)', text: '#fb923c', dot: '#fb923c' },
      'CSS': { bar: 'linear-gradient(90deg, #ec4899, #f43f5e)', text: '#f43f5e', dot: '#f43f5e' },
      'JSON': { bar: 'linear-gradient(90deg, #10b981, #34d399)', text: '#34d399', dot: '#34d399' },
      'YAML': { bar: 'linear-gradient(90deg, #8b5cf6, #c084fc)', text: '#c084fc', dot: '#c084fc' },
      'Markdown': { bar: 'linear-gradient(90deg, #06b6d4, #22d3ee)', text: '#22d3ee', dot: '#22d3ee' },
      'Rust': { bar: 'linear-gradient(90deg, #b91c1c, #f87171)', text: '#f87171', dot: '#f87171' },
      'Go': { bar: 'linear-gradient(90deg, #0891b2, #67e8f9)', text: '#67e8f9', dot: '#67e8f9' },
      'Text': { bar: 'linear-gradient(90deg, #64748b, #94a3b8)', text: '#94a3b8', dot: '#94a3b8' }
    };

    // Left: Languages
    const langSection = document.createElement('div');
    langSection.className = 'landing-card cyber-glass-card';

    const langRows = Object.entries(summary.languages || {})
      .map(([lang, data]) => {
        const pal = languagePalette[lang] || { bar: 'linear-gradient(90deg, #6366f1, #a855f7)', text: '#a855f7', dot: '#a855f7' };
        return `
        <div style="display: flex; flex-direction: column; gap: 5px; padding: 7px 0; border-bottom: 1px solid var(--border-strata); font-size: 0.85rem;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${pal.dot}; box-shadow: 0 0 6px ${pal.dot};"></span>
              <span style="font-weight: 700; color: var(--text-primary); font-family: var(--font-display);">${lang}</span>
              <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">(${data.files} files)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; font-family: var(--font-mono);">
              <span style="color: var(--text-secondary);">${(data.lines || 0).toLocaleString()} LOC</span>
              <span style="color: ${pal.text}; font-weight: 800; text-shadow: 0 0 8px ${pal.dot};">${data.percentage}%</span>
            </div>
          </div>
          <div style="width: 100%; height: 5px; background: rgba(5, 8, 14, 0.8); border-radius: 3px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.05);">
            <div style="width: ${data.percentage}%; height: 100%; background: ${pal.bar}; box-shadow: 0 0 8px ${pal.dot}; border-radius: 3px;"></div>
          </div>
        </div>
      `;
      }).join('');

    langSection.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>📊</span>
          <span class="text-gradient-aurora">Language Strata Share</span>
        </h3>
        <span class="landing-card-badge neon-badge">Telemetry</span>
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

    const cards = Array.from(carouselSection.querySelectorAll('.strata-card'));
    const selectCardByIndex = (idx) => {
      const normalizedIdx = (idx + cards.length) % cards.length;
      cards.forEach(c => c.classList.remove('active'));
      const targetCard = cards[normalizedIdx];
      if (targetCard) {
        targetCard.classList.add('active');
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        const actionId = targetCard.dataset.action;
        this.selectedAction = actionId;
        this.renderActionDossier(dossierSection, actionId);
      }
    };

    // Wire up Carousel Cards to rotate and update Dossier Blade
    cards.forEach((card, idx) => {
      card.addEventListener('click', () => {
        selectCardByIndex(idx);
      });
    });

    // Arrow key navigation for quick forensic cycling
    const keyHandler = (e) => {
      if (!document.body.contains(container)) {
        window.removeEventListener('keydown', keyHandler);
        return;
      }
      if (['ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key) && !['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) {
        const currentIdx = cards.findIndex(c => c.classList.contains('active'));
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          selectCardByIndex(currentIdx - 1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          selectCardByIndex(currentIdx + 1);
        } else if (e.key === 'Enter') {
          const actionBtn = dossierSection.querySelector('#btn-launch-action');
          if (actionBtn) {
            e.preventDefault();
            actionBtn.click();
          }
        }
      }
    };
    window.addEventListener('keydown', keyHandler);

    return container;
  }

  renderActionDossier(container, actionId) {
    const actionDetails = {
      architecture: {
        title: 'Architecture Topology',
        type: 'Structural Mapping',
        icon: '🕸️',
        description: 'Explore high-level subsystems, module boundaries, and living Mermaid dependency graphs.',
        cta: 'EXPLORE ARCHITECTURE TOPOLOGY'
      },
      impact: {
        title: 'Impact & Blast Radius',
        type: 'Ripple Analysis',
        icon: '💥',
        description: 'Calculate dependency blast radius and upstream caller ripple effects for any selected file or symbol.',
        cta: 'CALCULATE BLAST RADIUS'
      },
      explorer: {
        title: 'Source Explorer',
        type: 'Code & AST Inspector',
        icon: '📁',
        description: 'Browse the repository file hierarchy, inspect classes/functions, and view in-browser source code.',
        cta: 'OPEN SOURCE EXPLORER'
      },
      search: {
        title: 'Forensic Code Search',
        type: 'Index Query Engine',
        icon: '🔍',
        description: 'Query classes, function definitions, exported symbols, and full text across the AST inverted index.',
        cta: 'LAUNCH FORENSIC SEARCH'
      },
      git: {
        title: 'Git Chrono-Strata',
        type: 'Lineage Timeline',
        icon: '📜',
        description: 'Inspect chronological commit lineage, author ownership, and branch history in safe read-only mode.',
        cta: 'VIEW GIT TIMELINE'
      },
      analysis: {
        title: 'Drift & Hotspot Matrix',
        type: 'Risk Telemetry',
        icon: '⚡',
        description: 'Identify high-churn files, cyclomatic complexity spikes, and circular dependency loops.',
        cta: 'OPEN RISK HOTSPOTS'
      },
      archaeology: {
        title: 'Evolutionary Synthesis',
        type: 'Archaeological Digest',
        icon: '🏛️',
        description: 'Synthesize the holistic history of how this software system was constructed from genesis to current strata.',
        cta: 'SYNTHESIZE ARCHAEOLOGY'
      },
      risk: {
        title: 'Codebase Risk Map',
        type: 'Measurable Risk Matrix',
        icon: '⚡',
        description: 'Quantify structural risk ranking based on commit frequency, file volume, and dependency centrality.',
        cta: 'VIEW RISK MAP'
      },
      features: {
        title: 'Feature-to-Code Mapping',
        type: 'Feature Topology',
        icon: '🗺️',
        description: 'Classify source files into product capabilities and architectural subsystems.',
        cta: 'EXPLORE FEATURE MAP'
      },
      tests: {
        title: 'Test Intelligence',
        type: 'Verification Harness',
        icon: '🧪',
        description: 'Discover test suites, calculate test file density, and map automated test coverage signals.',
        cta: 'VIEW TEST INTELLIGENCE'
      },
      bugs: {
        title: 'Bug Archaeology',
        type: 'Defect Tracer',
        icon: '🐛',
        description: 'Trace historical bug and regression commits to identify structurally unstable modules.',
        cta: 'INSPECT BUG TRACES'
      },
      deadcode: {
        title: 'Dead Code Signals',
        type: 'Isolated Modules',
        icon: '🍂',
        description: 'Identify unimported source files with zero incoming internal dependencies.',
        cta: 'DETECT DEAD CODE'
      },
      manifests: {
        title: 'Dependency Health',
        type: 'Package Telemetry',
        icon: '📦',
        description: 'Analyze package manager manifests (package.json, requirements.txt) and external dependencies.',
        cta: 'VIEW DEPENDENCY HEALTH'
      },
      review: {
        title: 'Automated Code Review',
        type: 'Heuristic Audit',
        icon: '🛡️',
        description: 'Perform an automated structural audit for oversized modules, cyclic loops, and maintainability bottlenecks.',
        cta: 'RUN CODE REVIEW'
      },
      documentation: {
        title: 'Subsystem Docs',
        type: 'Specification Generator',
        icon: '📖',
        description: 'Generate deterministic architecture specifications, subsystem contracts, and exportable Markdown reports.',
        cta: 'VIEW SPECIFICATIONS'
      },
      ai: {
        title: 'Codebase Q&A Investigator',
        type: 'Natural Language Q&A',
        icon: '🤖',
        description: 'Ask natural language questions about the codebase architecture, entry points, and structural patterns.',
        cta: 'CONSULT CODEBASE Q&A'
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
