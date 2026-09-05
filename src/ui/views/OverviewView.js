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
      { id: 'architecture', icon: '🕸️', title: 'Architecture', meta: 'Module Boundaries & Graph', badge: 'Structural Map', theme: 'card-cyan' },
      { id: 'impact', icon: '💥', title: 'Impact Radius', meta: 'Blast Radius & Caller Ripple', badge: 'Ripple Analysis', theme: 'card-coral' },
      { id: 'explorer', icon: '📁', title: 'Source Explorer', meta: 'AST Hierarchy & Code Viewer', badge: 'File Inspector', theme: 'card-blue' },
      { id: 'search', icon: '🔍', title: 'Forensic Search', meta: 'Symbols, Functions & Text', badge: 'Query Engine', theme: 'card-purple' },
      { id: 'git', icon: '📜', title: 'Git History', meta: 'Author Ownership & Commits', badge: 'Lineage Timeline', theme: 'card-amber' },
      { id: 'analysis', icon: '⚡', title: 'Drift & Hotspots', meta: 'Churn Volatility & Risk Score', badge: 'Risk Matrix', theme: 'card-orange' },
      { id: 'archaeology', icon: '🏛️', title: 'Archaeology', meta: 'Evolutionary System Genesis', badge: 'Synthesis', theme: 'card-violet' },
      { id: 'risk', icon: '⚡', title: 'Risk Map', meta: 'Centrality & Churn Scoring', badge: 'Risk Scoring', theme: 'card-rose' },
      { id: 'features', icon: '🗺️', title: 'Feature Mapping', meta: 'Subsystem Domain Clusters', badge: 'Feature Map', theme: 'card-cyan' },
      { id: 'tests', icon: '🧪', title: 'Test Intelligence', meta: 'Suite Inventory & Coverage', badge: 'Test Harness', theme: 'card-emerald' },
      { id: 'bugs', icon: '🐛', title: 'Bug Archaeology', meta: 'Defect & Regression Traces', badge: 'Defect Tracer', theme: 'card-crimson' },
      { id: 'deadcode', icon: '🍂', title: 'Dead Code', meta: 'Isolated Zero-Inflow Modules', badge: 'Pruning', theme: 'card-amber' },
      { id: 'manifests', icon: '📦', title: 'Dependencies', meta: 'Manifests & Ecosystem Health', badge: 'Manifests', theme: 'card-blue' },
      { id: 'review', icon: '🛡️', title: 'Code Review', meta: 'Automated Heuristic Health', badge: 'Audit Engine', theme: 'card-teal' },
      { id: 'documentation', icon: '📖', title: 'Documentation', meta: 'Architecture Specs & Markdown', badge: 'Auto-Doc', theme: 'card-purple' },
      { id: 'ai', icon: '🤖', title: 'Codebase Q&A', meta: 'Offline Natural Language Q&A', badge: 'Local Engine', theme: 'card-magenta' },
      { id: 'duplication', icon: '👯', title: 'Duplication', meta: 'Clone Detection & Redundancy', badge: 'Clone Engine', theme: 'card-cyan' },
      { id: 'security', icon: '🔒', title: 'Security Audit', meta: 'Secrets & CVE Vulnerabilities', badge: 'Zero Leak', theme: 'card-rose' },
      { id: 'busfactor', icon: '🚌', title: 'Bus Factor', meta: 'Knowledge Silos & Maintainers', badge: 'Resilience', theme: 'card-amber' },
      { id: 'techdebt', icon: '⏱️', title: 'Technical Debt', meta: 'SQALE Hours & Remediation $', badge: 'SQALE Audit', theme: 'card-violet' },
      { id: 'endpoints', icon: '🌐', title: 'API Endpoints', meta: 'Route Inventory & Handlers', badge: 'Route Catalog', theme: 'card-emerald' }
    ];

    const angleStep = 360 / actionItems.length;
    const cylinderRadius = Math.round(195 / (2 * Math.tan(Math.PI / actionItems.length))) + 20;

    const cardsHtml = actionItems.map((a, idx) => `
      <div class="carousel-card-3d ${a.theme} ${idx === 0 ? 'is-front' : ''}" 
           data-action="${a.id}" 
           data-index="${idx}"
           style="transform: rotateY(${idx * angleStep}deg) translateZ(${cylinderRadius}px);">
        <div class="card-header-bar">
          <span class="card-sector-tag">${String(idx + 1).padStart(2, '0')}</span>
          <span class="card-badge-pill">${a.badge}</span>
        </div>

        <div class="card-core-visual">
          <div class="card-glyph">${a.icon}</div>
          <div class="card-glyph-reflection">${a.icon}</div>
        </div>

        <div class="card-text-block">
          <h4 class="card-action-title">${a.title}</h4>
          <p class="card-action-meta">${a.meta}</p>
        </div>

        <button class="btn-card-prompt" data-action="${a.id}">
          <span>VIEW PROMPT</span>
          <span class="prompt-arrow">❯</span>
        </button>
      </div>
    `).join('');

    carouselSection.innerHTML = `
      <div class="holomap-header">
        <h3 class="holomap-title">
          <span class="holomap-icon">◈</span>
          <span class="text-gradient-cyber">HOLOGRAPHIC ACTION CAROUSEL // MERRY-GO-ROUND</span>
        </h3>
        <span class="landing-card-badge neon-badge">[DRAG • ARROWS • CLICK TO PROMPT]</span>
      </div>

      <div class="carousel-stage-3d" id="carousel-stage">
        <div class="carousel-holo-pedestal">
          <div class="carousel-holo-ring-inner"></div>
        </div>

        <button class="carousel-paddle prev" id="carousel-paddle-prev" title="Rotate Left (ArrowLeft)">❮</button>
        <button class="carousel-paddle next" id="carousel-paddle-next" title="Rotate Right (ArrowRight)">❯</button>
        
        <div class="carousel-cylinder-3d" id="carousel-cylinder">
          ${cardsHtml}
        </div>
      </div>

      <div class="carousel-orbital-tracker" id="carousel-orbital-tracker">
        <div style="display: flex; align-items: center;">
          <span class="tracker-sector-badge">SECTOR <strong id="tracker-current-num">01</strong> / ${String(actionItems.length).padStart(2, '0')}</span>
          <span class="tracker-lens-title" id="tracker-current-title">ARCHITECTURE</span>
        </div>
        <div class="tracker-dots-bar" id="tracker-dots-bar">
          ${actionItems.map((_, i) => `<span class="tracker-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
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

    const trackerNum = carouselSection.querySelector('#tracker-current-num');
    const trackerTitle = carouselSection.querySelector('#tracker-current-title');
    const trackerDots = Array.from(carouselSection.querySelectorAll('.tracker-dot'));

    const updateTracker = (normalizedIndex, item) => {
      if (trackerNum) trackerNum.textContent = String(normalizedIndex + 1).padStart(2, '0');
      if (trackerTitle) trackerTitle.textContent = item.title.toUpperCase();
      trackerDots.forEach((d, i) => d.classList.toggle('active', i === normalizedIndex));
    };

    const rotateToIndex = (targetIndex, shouldPrompt = false) => {
      currentCarouselIndex = targetIndex;
      const normalizedIndex = ((currentCarouselIndex % actionItems.length) + actionItems.length) % actionItems.length;
      
      cylinderEl.style.transform = `rotateY(${-currentCarouselIndex * angleStep}deg)`;
      updateCardDepths(normalizedIndex);

      const item = actionItems[normalizedIndex];
      updateTracker(normalizedIndex, item);

      this.selectedAction = item.id;
      this.renderActionDossier(dossierSection, item.id);

      if (shouldPrompt) {
        this.openHolographicPrompt(item);
      }
    };

    // Initial depth and tracker calculation
    updateCardDepths(0);
    updateTracker(0, actionItems[0]);

    // Tracker dot clicks
    trackerDots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const dotIndex = parseInt(dot.dataset.index, 10);
        let delta = ((dotIndex - (currentCarouselIndex % actionItems.length)) + actionItems.length) % actionItems.length;
        if (delta > actionItems.length / 2) delta -= actionItems.length;
        rotateToIndex(currentCarouselIndex + delta);
      });
    });

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
   * with deep architectural explanation and direct view trigger button
   */
  openHolographicPrompt(item) {
    // Remove existing prompt if any
    document.querySelector('.lens-prompt-overlay')?.remove();

    const d = this.getActionDetails(item.id);
    const overlay = document.createElement('div');
    overlay.className = 'lens-prompt-overlay';

    overlay.innerHTML = `
      <div class="lens-prompt-modal ${item.theme}">
        <div class="lens-prompt-laser"></div>
        <div class="strata-card-corner tl"></div>
        <div class="strata-card-corner tr"></div>
        
        <div class="lens-prompt-header">
          <div class="lens-prompt-title">
            <span>${d.icon}</span>
            <span class="text-gradient-cyber">${d.title}</span>
          </div>
          <button class="lens-prompt-close" id="btn-close-prompt" title="Close Prompt (Esc)">✕</button>
        </div>

        <div class="lens-prompt-body">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="landing-card-badge neon-badge">${d.type}</span>
            <span style="font-size: 0.72rem; color: var(--success); font-family: var(--font-mono); font-weight: 700;">
              ● FORENSIC ENGINE ONLINE
            </span>
          </div>

          <div class="lens-prompt-tagline">
            ⚡ ${d.tagline}
          </div>

          <p class="lens-prompt-desc">
            ${d.overview}
          </p>

          <div class="lens-prompt-section">
            <div class="lens-prompt-section-title">◈ KEY QUESTIONS THIS LENS ANSWERS:</div>
            <div class="lens-prompt-qa-list">
              ${d.questionsAnswered.map(q => `
                <div class="lens-prompt-qa-item">
                  <span class="qa-bullet">◈</span>
                  <span>${q}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="lens-prompt-chips">
            ${d.capabilities.map(cap => `<span class="lens-chip">⚡ ${cap}</span>`).join('')}
          </div>

          <div class="lens-prompt-usecase">
            <strong>💡 Tactical Use Case:</strong> ${d.useCase}
          </div>

          <button class="lens-prompt-btn-launch" id="btn-modal-launch">
            <span>🚀</span>
            <span>ENTER ${d.title.toUpperCase()} VIEW →</span>
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
        tagline: 'Deconstruct living module boundaries and cross-package dependency webs.',
        overview: 'The Architecture Topology lens analyzes all internal import statements, module references, and package boundaries to construct a living directed graph of your codebase. It automatically generates interactive Mermaid.js diagrams that visualize the entire structural hierarchy.',
        questionsAnswered: [
          'How are files and directories structurally interconnected across the project?',
          'Where are the primary architectural boundaries and core system entry points?',
          'Are there hidden couplings between supposedly separated layers or domain modules?'
        ],
        capabilities: [
          'Directed Graph Topography',
          'Interactive Mermaid Diagram',
          'Coupling Density Metrics',
          'Subsystem Cluster Isolation'
        ],
        useCase: 'Essential when onboarding to an unfamiliar codebase, planning system modularization, or validating architectural separation of concerns.',
        cta: 'EXPLORE ARCHITECTURE TOPOLOGY'
      },
      impact: {
        title: 'Impact & Blast Radius',
        type: 'Ripple Analysis',
        icon: '💥',
        tagline: 'Calculate upstream ripple effects and downstream caller blast radius for any file.',
        overview: 'Computes the transitive dependency closure and blast radius multiplier for any selected module. Reveals exactly which files, services, and tests will break or require re-testing if you modify a given file.',
        questionsAnswered: [
          'If I change a function or export in file X, what other files will be impacted?',
          'What is the transitive blast radius percentage across the entire project?',
          'Which root modules carry the highest catastrophic failure risk if modified?'
        ],
        capabilities: [
          'Transitive Blast Radius',
          'Direct & Indirect Callers',
          'Upstream Dependency Tree',
          'Safe Refactoring Horizon'
        ],
        useCase: 'Crucial before merging pull requests, modifying shared utilities, or refactoring core library APIs.',
        cta: 'CALCULATE BLAST RADIUS'
      },
      explorer: {
        title: 'Source Explorer',
        type: 'Code & AST Inspector',
        icon: '📁',
        tagline: 'Navigate full AST symbol hierarchies, exported signatures, and syntax structures.',
        overview: 'A lightning-fast in-browser file and syntax explorer that decomposes source files into their constituent AST structures: functions, classes, interfaces, methods, and imports with line-indexed syntax highlighting.',
        questionsAnswered: [
          'What classes, methods, and functions are declared and exported in this file?',
          'How is the physical directory tree laid out relative to logical components?',
          'What are the exact signatures, parameter lists, and internal calls in a module?'
        ],
        capabilities: [
          'AST Function & Class Extraction',
          'Syntax Highlighted Viewer',
          'Symbol Signature Outlines',
          'Line-Indexed Code Strata'
        ],
        useCase: 'Perfect for inspecting implementation details, auditing signatures, and reviewing source code without switching to a heavy external editor.',
        cta: 'OPEN SOURCE EXPLORER'
      },
      search: {
        title: 'Forensic Code Search',
        type: 'Index Query Engine',
        icon: '🔍',
        tagline: 'Query symbols, identifiers, signatures, and string literals across an in-memory inverted index.',
        overview: 'Powered by a deterministic in-memory inverted index that separates symbol names from full-text occurrences. Features multi-token matching, language filtering, and ranked relevance scoring.',
        questionsAnswered: [
          'Where is a specific function, class, or type declared and referenced across all strata?',
          'Which files match multi-token architectural patterns (e.g. "auth service token")?',
          'How can I quickly locate dead references or specific string literals in microseconds?'
        ],
        capabilities: [
          'Exact Symbol Prioritization',
          'Multi-Token Boolean Search',
          'Language Scope Filtering',
          'Sub-Millisecond Inverted Index'
        ],
        useCase: 'Used for rapid cross-codebase lookups, tracking deprecations, and tracing where shared constants and methods are invoked.',
        cta: 'LAUNCH FORENSIC SEARCH'
      },
      git: {
        title: 'Git Chrono-Strata',
        type: 'Lineage Timeline',
        icon: '📜',
        tagline: 'Uncover chronological commit velocity, author ownership distribution, and commit cadence.',
        overview: 'Inspects repository revision history using safe, read-only Git operations. Extracts commit velocity, churn rhythms, author ownership shares, and temporal milestones from genesis to HEAD.',
        questionsAnswered: [
          'Who are the primary maintainers and knowledge owners for different subsystems?',
          'What has been the commit frequency, velocity cadence, and development trajectory?',
          'When were major system rewrites and architectural shifts merged into the default branch?'
        ],
        capabilities: [
          'Read-Only Git Pipeline',
          'Author Ownership Stratification',
          'Velocity & Cadence Curves',
          'Milestone Tag Lineage'
        ],
        useCase: 'Invaluable for technical due diligence, identifying single-point-of-failure maintainers (bus factor), and tracking velocity trends.',
        cta: 'VIEW GIT TIMELINE'
      },
      analysis: {
        title: 'Drift & Hotspot Matrix',
        type: 'Risk Telemetry',
        icon: '⚡',
        tagline: 'Pinpoint high-churn, high-complexity files where bugs are statistically most likely to breed.',
        overview: 'Merges Git commit churn frequency with cyclomatic complexity and line counts to calculate an empirical "Hotspot Risk Score" (0–100). Highlights unstable files that are constantly modified and structurally fragile.',
        questionsAnswered: [
          'Which files combine both high cyclomatic complexity and high edit frequency?',
          'Where does technical debt concentrate in the codebase?',
          'Which components are experiencing active structural drift and need test coverage?'
        ],
        capabilities: [
          'Combined Churn-Complexity Scoring',
          'Statistical Defect Risk Heatmap',
          'Top 10 High-Risk Hotspots',
          'Volatility Trajectory Curves'
        ],
        useCase: 'Primary tool for planning refactoring sprints, preventing regressions, and prioritizing code review scrutiny.',
        cta: 'OPEN RISK HOTSPOTS'
      },
      archaeology: {
        title: 'Evolutionary Synthesis',
        type: 'Archaeological Digest',
        icon: '🏛️',
        tagline: 'Reconstruct the complete biographical narrative of how the software system evolved.',
        overview: 'Synthesizes the holistic chronological story of the repository: foundation genesis, language adoption phases, major architectural milestones, and contributor eras into a readable archaeological dossier.',
        questionsAnswered: [
          'What was the original architectural design when the repository was created?',
          'How did the tech stack, frameworks, and conventions shift over time?',
          'What were the distinct development eras and major transitional refactors?'
        ],
        capabilities: [
          'Genesis-to-HEAD Timeline',
          'Multi-Era Classification',
          'Tech Stack Evolution Tracking',
          'Archaeological Summary Dossier'
        ],
        useCase: 'Essential for new tech leads, engineering managers, and architects taking over legacy or inherited systems.',
        cta: 'SYNTHESIZE ARCHAEOLOGY'
      },
      risk: {
        title: 'Codebase Risk Map',
        type: 'Measurable Risk Matrix',
        icon: '⚡',
        tagline: 'Quantify structural risk through graph centrality, module size, and fan-out fragility.',
        overview: 'A holistic risk assessment matrix that evaluates maintainability index, cyclomatic complexity spikes, dependency centrality, and lack of test insulation across every directory and file.',
        questionsAnswered: [
          'Which files represent critical structural bottlenecks with high fan-in and low maintainability?',
          'Where are the highest-risk single points of failure across the codebase?',
          'How does the aggregate system integrity score (0–100) benchmark across components?'
        ],
        capabilities: [
          'Maintainability Index (MI)',
          'Cyclomatic Complexity Spikes',
          'Fan-In/Fan-Out Centrality',
          'System Health Gauge (95/100)'
        ],
        useCase: 'Used by engineering leadership to establish health baselines, set quality gates, and justify technical debt reduction.',
        cta: 'VIEW RISK MAP'
      },
      features: {
        title: 'Feature-to-Code Mapping',
        type: 'Feature Topology',
        icon: '🗺️',
        tagline: 'Cluster loose source files into functional domain modules and user capabilities.',
        overview: 'Employs heuristic clustering to map physical source files to logical product features, domain boundaries, and backend capabilities (e.g. Authentication, Billing, Search, AI, Parsing).',
        questionsAnswered: [
          'Which files and packages belong to which business or product feature?',
          'Are feature concerns cleanly separated or scattered across unstructured utility files?',
          'How many lines of code and components contribute to a specific user-facing feature?'
        ],
        capabilities: [
          'Domain Capability Clustering',
          'Cross-Cutting Concern Identification',
          'Feature Footprint Metrics',
          'Directory-to-Domain Map'
        ],
        useCase: 'Perfect for domain-driven design (DDD) refactoring, microservice extraction, and feature-oriented onboarding.',
        cta: 'EXPLORE FEATURE MAP'
      },
      tests: {
        title: 'Test Intelligence',
        type: 'Verification Harness',
        icon: '🧪',
        tagline: 'Discover test suites, measure test-to-source ratios, and find unshielded code.',
        overview: 'Automatically discovers unit, integration, and E2E test files across modern test frameworks (Node test runner, Jest, Mocha, PyTest). Calculates test density and highlights production code lacking tests.',
        questionsAnswered: [
          'What automated test suites exist and which test runners are configured?',
          'What is the ratio of test code lines to production source code lines?',
          'Which core business modules have zero test files insulating them from regression?'
        ],
        capabilities: [
          'Automated Test Discovery',
          'Test-to-Source Code Ratio',
          'Test Framework Detection',
          'Unshielded File Signals'
        ],
        useCase: 'Critical for QA engineers, test architects, and developers establishing automated CI/CD safety rails.',
        cta: 'VIEW TEST INTELLIGENCE'
      },
      bugs: {
        title: 'Bug Archaeology',
        type: 'Defect Tracer',
        icon: '🐛',
        tagline: 'Trace historical bug fixes, regression patches, and recurring defect clusters.',
        overview: 'Scans git commit messages for defect markers (fix, bug, issue, regression, patch, resolve) to reconstruct a historical map of where bugs have repeatedly occurred in the codebase.',
        questionsAnswered: [
          'Which specific modules have required the most bug fixes over their lifespan?',
          'Are there recurring defect patterns or fragility hotbeds that break repeatedly?',
          'Which commit patches resolved critical historical defects in the system?'
        ],
        capabilities: [
          'Commit Message Defect Filtering',
          'Historical Bug Density Score',
          'Regression-Prone Module Highlights',
          'Defect Timeline Strata'
        ],
        useCase: 'Indispensable for root-cause post-mortems, reliability engineering, and locating brittle legacy logic.',
        cta: 'INSPECT BUG TRACES'
      },
      deadcode: {
        title: 'Dead Code Signals',
        type: 'Isolated Modules',
        icon: '🍂',
        tagline: 'Detect isolated source files with zero incoming imports or callers.',
        overview: 'Traverses the global dependency graph to isolate orphaned source files that are never imported, called, or referenced by any active application entrypoint or test harness.',
        questionsAnswered: [
          'Are there forgotten experimental files or obsolete components left in the repository?',
          'Which files have 0 incoming dependencies from any active system pathway?',
          'How many lines of dead code can be safely pruned to reduce cognitive overhead and bundle size?'
        ],
        capabilities: [
          'Zero-Inflow Module Discovery',
          'Orphaned Component Listing',
          'Estimated Pruning Volume',
          'False-Positive Entrypoint Filters'
        ],
        useCase: 'Essential during spring-cleaning refactors, library migrations, and bundle size reduction initiatives.',
        cta: 'DETECT DEAD CODE'
      },
      manifests: {
        title: 'Dependency Health',
        type: 'Package Telemetry',
        icon: '📦',
        tagline: 'Audit package manifests, third-party libraries, and ecosystem dependencies.',
        overview: 'Parses package declarations (package.json, requirements.txt, Cargo.toml, etc.) to catalog external third-party dependencies, distinguish direct from dev dependencies, and evaluate ecosystem exposure.',
        questionsAnswered: [
          'What external libraries, frameworks, and versions does this project depend upon?',
          'What is the breakdown between production dependencies and developer tooling?',
          'Are there obsolete or redundant third-party libraries bloating the dependency tree?'
        ],
        capabilities: [
          'Multi-Ecosystem Manifest Parsing',
          'Direct vs Dev Dependency Breakdown',
          'External Library Catalog',
          'Dependency Count Telemetry'
        ],
        useCase: 'Key for supply-chain security reviews, license compliance checks, and dependency update planning.',
        cta: 'VIEW DEPENDENCY HEALTH'
      },
      review: {
        title: 'Automated Code Review',
        type: 'Heuristic Audit',
        icon: '🛡️',
        tagline: 'Instant heuristic audit for cyclic loops, giant modules, and maintainability antipatterns.',
        overview: 'Runs deterministic rule-based heuristic analyzers across the codebase to flag anti-patterns: God files (>500 LOC), deeply nested logic, circular dependency cycles (A -> B -> A), and poor maintainability scores.',
        questionsAnswered: [
          'Are there circular dependency cycles that cause bundle bloat or runtime initialization bugs?',
          'Which files exceed recommended size thresholds and violate Single Responsibility?',
          'What concrete, actionable code quality fixes should be prioritized first?'
        ],
        capabilities: [
          'Circular Import Loop Detection',
          'God File (>500 LOC) Detection',
          'Cyclomatic Threshold Flags',
          'Prioritized Action Items'
        ],
        useCase: 'Use before code freeze, during pull request reviews, and as an objective linting and architectural audit.',
        cta: 'RUN CODE REVIEW'
      },
      documentation: {
        title: 'Subsystem Docs',
        type: 'Specification Generator',
        icon: '📖',
        tagline: 'Generate deterministic architecture specifications, API contracts, and Markdown summaries.',
        overview: 'Synthesizes parsed AST symbols, module boundaries, metrics, and dependency graphs into clean, comprehensive, exportable architectural documentation and developer handbooks.',
        questionsAnswered: [
          'How do I automatically generate up-to-date architecture documentation for this repo?',
          'What are the documented public API contracts, classes, and exported signatures?',
          'Can I export a complete Markdown dossier for offline distribution or team handoff?'
        ],
        capabilities: [
          'Deterministic Architecture Specs',
          'Automated Markdown Report Export',
          'Component Contract Catalog',
          'Living README Generator'
        ],
        useCase: 'Ideal for enterprise knowledge handovers, generating compliance documentation, and keeping project wikis synchronized.',
        cta: 'VIEW SPECIFICATIONS'
      },
      ai: {
        title: 'Codebase Q&A Investigator',
        type: 'Local Query Engine',
        icon: '🤖',
        tagline: 'Query architecture, ownership, dependencies, and syntax using natural language offline.',
        overview: 'An offline-first natural language query engine that interprets developer questions about contributors, file locations, language breakdowns, and structural metrics without needing external API keys.',
        questionsAnswered: [
          'Who wrote the most code in this project and what files do they own?',
          'Which files are the most complex or statistically risky to touch?',
          'Where is the authentication or router logic located and how does it connect to other layers?'
        ],
        capabilities: [
          'Offline Deterministic NL Engine',
          'Structured AI Prompt Synthesizer',
          'Context-Aware Codebase Packager',
          'Multi-Turn Technical Q&A'
        ],
        useCase: 'The ultimate assistant for instantly answering repository questions and generating grounded LLM prompts with full context.',
        cta: 'CONSULT CODEBASE Q&A'
      },
      duplication: {
        title: 'Code Duplication & Clones',
        type: 'Clone Block Detection',
        icon: '👯',
        tagline: 'Eliminate copy-paste redundancy and isolate identical AST token clusters.',
        overview: 'Scans normalized source code lines and hashes rolling token windows to uncover copy-pasted implementation blocks across different modules.',
        questionsAnswered: [
          'Where are duplicate implementations copied across files?',
          'What percentage of the overall codebase is redundant clone code?',
          'Which clone clusters can be consolidated into shared utilities?'
        ],
        capabilities: [
          'Token Rolling Hashes',
          'Cross-File Clone Clusters',
          'Duplication Ratio %',
          'Refactoring Targets'
        ],
        useCase: 'Essential during technical debt sprints, library refactoring, and code deduplication.',
        cta: 'AUDIT CODE DUPLICATION'
      },
      security: {
        title: 'Security & Secrets Audit',
        type: 'Vulnerability Detection',
        icon: '🔒',
        tagline: 'Air-gapped scanner for hardcoded API keys, private credentials, and dangerous execution sinks.',
        overview: 'Scans files for unencrypted secrets (AWS, GitHub, Slack tokens, private keys) and high-risk code patterns (eval, raw exec interpolation) without sending a single byte to external clouds.',
        questionsAnswered: [
          'Are there any plaintext credentials or API keys checked into Git?',
          'Does this repository contain insecure eval or shell injection sinks?',
          'What is the overall security hygiene score and grade?'
        ],
        capabilities: [
          'High-Entropy Key Scanners',
          'Air-Gapped Local Rulebook',
          'CVE Sink Inspection',
          'Triage Severity Grading'
        ],
        useCase: 'Run before releasing code, publishing public packages, or completing compliance audits.',
        cta: 'RUN SECURITY AUDIT'
      },
      busfactor: {
        title: 'Bus Factor & Knowledge Silos',
        type: 'Organizational Resilience',
        icon: '🚌',
        tagline: 'Quantify maintainer concentration risk and identify single-developer knowledge silos.',
        overview: 'Analyzes Git authorship and commit frequencies across directories to determine if critical modules depend on a single developer.',
        questionsAnswered: [
          'Which modules have a single maintainer owning >80% of edits?',
          'What is the repository-level Bus Factor score?',
          'Where are critical knowledge silos that threaten operational continuity?'
        ],
        capabilities: [
          'Directory Ownership Maps',
          'Sole-Maintainer Silo Flags',
          'Bus Factor Scoring',
          'Cross-Pollination Guidance'
        ],
        useCase: 'Indispensable for engineering leadership, succession planning, and reducing single points of human failure.',
        cta: 'CALCULATE BUS FACTOR'
      },
      techdebt: {
        title: 'Technical Debt & Remediation',
        type: 'SQALE Financial Debt',
        icon: '⏱️',
        tagline: 'Estimate refactoring debt in engineering hours and calculate financial remediation costs.',
        overview: 'Uses SQALE-aligned structural heuristics (complexity, cyclomatic density, circular dependencies, and churn volatility) to calculate technical debt.',
        questionsAnswered: [
          'How many engineering hours are required to remediate structural debt?',
          'What is the estimated financial cost of existing technical shortcuts?',
          'Which files represent the highest-ROI refactoring targets?'
        ],
        capabilities: [
          'SQALE Grade (A-E)',
          'Hourly Remediation Estimation',
          'Financial Cost Calculation',
          'Target Priority Ranking'
        ],
        useCase: 'Crucial for sprint planning, justifying refactoring work to stakeholders, and tracking debt reduction over time.',
        cta: 'CALCULATE TECH DEBT'
      },
      endpoints: {
        title: 'API Endpoints & Route Inventory',
        type: 'Route Extraction',
        icon: '🌐',
        tagline: 'Automatically catalog HTTP endpoints, REST verbs, and route handler locations.',
        overview: 'Extracts Express, Fastify, Flask, and custom HTTP route definitions across source files to provide an interactive API catalog.',
        questionsAnswered: [
          'What HTTP endpoints are exposed by this service?',
          'Which source files and line numbers handle specific routes?',
          'What HTTP verbs (GET, POST, etc.) are implemented across subsystems?'
        ],
        capabilities: [
          'Multi-Framework Route AST',
          'Verb Classification Breakdown',
          'Line-Numbered Handler Mapping',
          'Interactive Route Catalog'
        ],
        useCase: 'Great for auditing public interfaces, documenting microservices, and verifying route coverage.',
        cta: 'VIEW API INVENTORY'
      }
    };

    return actionDetails[actionId] || actionDetails.architecture;
  }

  renderActionDossier(container, actionId) {
    const d = this.getActionDetails(actionId);

    container.innerHTML = `
      <div class="dossier-blade-header">
        <h4 class="dossier-title">
          <span>${d.icon}</span>
          <span class="text-gradient-aurora">${d.title}</span>
        </h4>
        <span class="landing-card-badge neon-badge">${d.type}</span>
      </div>

      <div class="dossier-tagline">
        ⚡ ${d.tagline}
      </div>

      <div class="dossier-meta-grid">
        <div class="dossier-meta-item">
          <span class="dossier-meta-label">Selected Lens</span>
          <span class="dossier-meta-val">${actionId.toUpperCase()}</span>
        </div>
        <div class="dossier-meta-item">
          <span class="dossier-meta-label">Forensic Engine</span>
          <span class="dossier-meta-val" style="color: var(--success);">ONLINE // READY</span>
        </div>
      </div>

      <div class="dossier-section">
        <div class="dossier-section-title">◈ FORENSIC SCOPE & MECHANICS:</div>
        <p class="dossier-findings-text" style="font-size: 0.84rem; line-height: 1.55;">
          ${d.overview}
        </p>
      </div>

      <div class="dossier-section">
        <div class="dossier-section-title">◈ DEVELOPER QUESTIONS ANSWERED:</div>
        <div class="dossier-qa-list">
          ${d.questionsAnswered.map(q => `
            <div class="dossier-qa-item">
              <span style="color: var(--accent-cyan); font-size: 0.7rem; margin-top: 1px;">◈</span>
              <span>${q}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="dossier-chips">
        ${d.capabilities.map(cap => `<span class="dossier-chip">${cap}</span>`).join('')}
      </div>

      <div class="dossier-usecase">
        <strong style="color: #c084fc;">💡 When to Use:</strong> ${d.useCase}
      </div>

      <div style="margin-top: 16px;">
        <button class="btn-primary" id="btn-launch-action" style="width: 100%; justify-content: center; padding: 12px 18px; font-size: 0.88rem;">
          <span>🚀</span>
          <span>${d.cta}</span>
        </button>
      </div>
    `;

    container.querySelector('#btn-launch-action')?.addEventListener('click', () => {
      window.location.hash = actionId;
    });
  }
}
