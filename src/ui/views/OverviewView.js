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

    // Central Cylindrical Investigation Action Carousel (3D Merry-Go-Round)
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

    const angleStep = 360 / actionItems.length; // 22.5 deg per card
    const cylinderRadius = 550; // px radius for 3D circle

    const cardsHtml = actionItems.map((a, idx) => `
      <div class="carousel-card-3d ${a.theme} ${idx === 0 ? 'is-front' : ''}" 
           data-action="${a.id}" 
           data-index="${idx}"
           style="transform: rotateY(${idx * angleStep}deg) translateZ(${cylinderRadius}px);">
        <div class="strata-card-corner tl"></div>
        <div class="strata-card-corner tr"></div>
        <div>
          <div class="strata-card-title"><span>${a.icon}</span><span>${a.title}</span></div>
          <div class="strata-card-meta" style="margin-top: 6px;">${a.meta}</div>
        </div>
        <div>
          <div class="strata-card-badge">${a.badge}</div>
          <div class="card-prompt-hint">
            <span>⚡ CLICK TO PROMPT VIEW</span>
          </div>
        </div>
      </div>
    `).join('');

    carouselSection.innerHTML = `
      <div class="holomap-canvas-header">
        <h3 class="holomap-title">
          <span class="holomap-icon">◈</span>
          <span class="text-gradient-cyber">CYLINDRICAL INVESTIGATION CAROUSEL // MERRY-GO-ROUND</span>
        </h3>
        <span class="landing-card-badge neon-badge">[DRAG • ARROWS • CLICK TO PROMPT]</span>
      </div>

      <div class="carousel-stage-3d" id="carousel-stage">
        <button class="carousel-paddle prev" id="carousel-paddle-prev" title="Rotate Left (ArrowLeft)">◀</button>
        <button class="carousel-paddle next" id="carousel-paddle-next" title="Rotate Right (ArrowRight)">▶</button>
        
        <div class="carousel-cylinder-3d" id="carousel-cylinder">
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

    // 3D Merry-Go-Round Engine
    const stageEl = carouselSection.querySelector('#carousel-stage');
    const cylinderEl = carouselSection.querySelector('#carousel-cylinder');
    const cards = Array.from(carouselSection.querySelectorAll('.carousel-card-3d'));
    let currentCarouselIndex = 0;

    const updateCardDepths = (activeIndex) => {
      cards.forEach((card, idx) => {
        let diff = ((idx - activeIndex) % actionItems.length + actionItems.length) % actionItems.length;
        if (diff > actionItems.length / 2) diff -= actionItems.length;
        const absDiff = Math.abs(diff);

        if (absDiff === 0) {
          card.classList.add('is-front');
          card.style.opacity = '1';
          card.style.filter = 'none';
          card.style.pointerEvents = 'auto';
          card.style.zIndex = '30';
        } else if (absDiff === 1) {
          card.classList.remove('is-front');
          card.style.opacity = '0.82';
          card.style.filter = 'brightness(0.85)';
          card.style.pointerEvents = 'auto';
          card.style.zIndex = '20';
        } else if (absDiff === 2) {
          card.classList.remove('is-front');
          card.style.opacity = '0.55';
          card.style.filter = 'brightness(0.65) blur(0.5px)';
          card.style.pointerEvents = 'auto';
          card.style.zIndex = '12';
        } else if (absDiff === 3) {
          card.classList.remove('is-front');
          card.style.opacity = '0.3';
          card.style.filter = 'brightness(0.4) blur(1.5px)';
          card.style.pointerEvents = 'auto';
          card.style.zIndex = '6';
        } else {
          card.classList.remove('is-front');
          card.style.opacity = '0.05';
          card.style.filter = 'brightness(0.25) blur(3px)';
          card.style.pointerEvents = 'none';
          card.style.zIndex = '1';
        }
      });
    };

    const rotateToIndex = (targetIndex, shouldPrompt = false) => {
      currentCarouselIndex = targetIndex;
      const normalizedIndex = ((currentCarouselIndex % actionItems.length) + actionItems.length) % actionItems.length;
      
      cylinderEl.style.transform = `rotateY(${-currentCarouselIndex * angleStep}deg)`;
      updateCardDepths(normalizedIndex);

      const item = actionItems[normalizedIndex];
      this.selectedAction = item.id;
      this.renderActionDossier(dossierSection, item.id);

      if (shouldPrompt) {
        this.openHolographicPrompt(item);
      }
    };

    // Initial depth calculation
    updateCardDepths(0);

    // Nav Paddles Click Handlers
    carouselSection.querySelector('#carousel-paddle-prev')?.addEventListener('click', (e) => {
      e.stopPropagation();
      rotateToIndex(currentCarouselIndex - 1);
    });

    carouselSection.querySelector('#carousel-paddle-next')?.addEventListener('click', (e) => {
      e.stopPropagation();
      rotateToIndex(currentCarouselIndex + 1);
    });

    // Wire up Carousel Cards: clicking any card spins to it and prompts the description & view button
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const cardIndex = parseInt(card.dataset.index, 10);
        // Calculate shortest rotation delta
        let delta = ((cardIndex - (currentCarouselIndex % actionItems.length)) + actionItems.length) % actionItems.length;
        if (delta > actionItems.length / 2) delta -= actionItems.length;

        rotateToIndex(currentCarouselIndex + delta, true);
      });
    });

    // Interactive Dragging / Swiping on the 3D Stage
    let isDragging = false;
    let dragStartX = 0;
    let dragStartAngle = 0;

    stageEl.addEventListener('mousedown', (e) => {
      if (e.target.closest('.carousel-paddle') || e.target.closest('.lens-prompt-overlay')) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartAngle = -currentCarouselIndex * angleStep;
      cylinderEl.classList.add('dragging');
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX;
      const currentAngle = dragStartAngle + (deltaX * 0.28);
      cylinderEl.style.transform = `rotateY(${currentAngle}deg)`;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      cylinderEl.classList.remove('dragging');
      const deltaX = e.clientX - dragStartX;
      
      if (Math.abs(deltaX) > 15) {
        const stepDelta = Math.round(-deltaX / 80);
        rotateToIndex(currentCarouselIndex + (stepDelta === 0 ? (deltaX < 0 ? 1 : -1) : stepDelta));
      } else {
        rotateToIndex(currentCarouselIndex);
      }
    });

    // Horizontal wheel scroll
    stageEl.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > 25 || Math.abs(e.deltaY) > 40) {
        e.preventDefault();
        const dir = (e.deltaX || e.deltaY) > 0 ? 1 : -1;
        rotateToIndex(currentCarouselIndex + dir);
      }
    }, { passive: false });

    // Arrow key navigation
    const keyHandler = (e) => {
      if (!document.body.contains(container)) {
        window.removeEventListener('keydown', keyHandler);
        return;
      }
      if (['ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(e.key) && !['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          rotateToIndex(currentCarouselIndex - 1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          rotateToIndex(currentCarouselIndex + 1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const activePromptBtn = document.querySelector('#btn-modal-launch');
          if (activePromptBtn) {
            activePromptBtn.click();
          } else {
            const normalizedIndex = ((currentCarouselIndex % actionItems.length) + actionItems.length) % actionItems.length;
            this.openHolographicPrompt(actionItems[normalizedIndex]);
          }
        } else if (e.key === 'Escape') {
          document.querySelector('.lens-prompt-overlay')?.remove();
        }
      }
    };
    window.addEventListener('keydown', keyHandler);

    return container;
  }

  /**
   * Opens the Holographic Prompt Modal in a unique laser aperture unfold transition
   * and provides the direct view trigger button
   */
  openHolographicPrompt(item) {
    // Remove existing prompt if any
    document.querySelector('.lens-prompt-overlay')?.remove();

    const actionDetails = this.getActionDetails(item.id);
    const overlay = document.createElement('div');
    overlay.className = 'lens-prompt-overlay';

    overlay.innerHTML = `
      <div class="lens-prompt-modal ${item.theme}">
        <div class="lens-prompt-laser"></div>
        <div class="strata-card-corner tl"></div>
        <div class="strata-card-corner tr"></div>
        
        <div class="lens-prompt-header">
          <div class="lens-prompt-title">
            <span>${actionDetails.icon}</span>
            <span class="text-gradient-cyber">${actionDetails.title}</span>
          </div>
          <button class="lens-prompt-close" id="btn-close-prompt" title="Close Prompt (Esc)">✕</button>
        </div>

        <div class="lens-prompt-body">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="landing-card-badge neon-badge">${actionDetails.type}</span>
            <span style="font-size: 0.75rem; color: var(--success); font-family: var(--font-mono); font-weight: 700;">
              ● FORENSIC ENGINE ONLINE
            </span>
          </div>

          <p class="lens-prompt-desc">
            ${actionDetails.description}
          </p>

          <div class="lens-prompt-chips">
            <span class="lens-chip">⚡ AST SYMBOLS</span>
            <span class="lens-chip">🕸️ TOPOLOGY COUPLING</span>
            <span class="lens-chip">📜 CHRONO-STRATA</span>
            <span class="lens-chip">🛡️ RISK MATRIX</span>
          </div>

          <button class="lens-prompt-btn-launch" id="btn-modal-launch">
            <span>🚀</span>
            <span>ENTER ${actionDetails.title.toUpperCase()} VIEW →</span>
          </button>
        </div>
      </div>
    `;

    // Close handlers
    overlay.querySelector('#btn-close-prompt')?.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    // Launch button handler directing to corresponding page
    overlay.querySelector('#btn-modal-launch')?.addEventListener('click', () => {
      overlay.remove();
      window.location.hash = item.id;
    });

    document.body.appendChild(overlay);
  }

  getActionDetails(actionId) {
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

    return actionDetails[actionId] || actionDetails.architecture;
  }

  renderActionDossier(container, actionId) {
    const details = this.getActionDetails(actionId);

    container.innerHTML = `
      <div class="dossier-blade-header">
        <h4 class="dossier-title">
          <span>${details.icon}</span>
          <span class="text-gradient-aurora">${details.title}</span>
        </h4>
        <span class="landing-card-badge neon-badge">${details.type}</span>
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

    container.querySelector('#btn-launch-action')?.addEventListener('click', () => {
      window.location.hash = actionId;
    });
  }
}
