/**
 * LandingView Component
 * Restored Original Blue/Cyber Technical Landing Experience
 */
export class LandingView {
  constructor({ onOpenRepository, onQuickAnalyze, error, onClearError }) {
    this.onOpenRepository = onOpenRepository;
    this.onQuickAnalyze = onQuickAnalyze;
    this.error = error;
    this.onClearError = onClearError;
    this.element = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const errorHtml = this.error ? `
      <div id="landing-error-banner" style="background: rgba(255, 0, 85, 0.12); border: 1px solid var(--danger); border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
        <div style="display: flex; gap: 10px; align-items: flex-start;">
          <span style="font-size: 1.1rem;">⚠️</span>
          <div>
            <div style="color: var(--danger); font-weight: 800; font-family: var(--font-mono); font-size: 0.8rem; text-transform: uppercase;">Excavation Alert</div>
            <div style="color: var(--text-primary); font-size: 0.85rem; margin-top: 2px; line-height: 1.45;">${this.error}</div>
          </div>
        </div>
        <button type="button" id="btn-dismiss-error" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1rem;">✕</button>
      </div>
    ` : '';

    container.innerHTML = `
      ${errorHtml}

      <!-- Refined Architectural Hero Section -->
      <section class="landing-hero">
        <!-- Single Sleek Status Badge -->
        <div class="hero-status-badge">
          <span class="status-pulse-dot"></span>
          <span class="status-badge-text">Local-First Repository Forensics</span>
          <span class="status-badge-sep">/</span>
          <span class="status-badge-sub">100% Air-Gapped</span>
        </div>

        <!-- Sleek Vector Emblem -->
        <div class="hero-emblem-wrap">
          <div class="hero-emblem-glow"></div>
          <svg class="hero-emblem-svg" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4L41.32 14V34L24 44L6.68 34V14L24 4Z" stroke="url(#heroGrad)" stroke-width="2.5" stroke-linejoin="round" />
            <path d="M24 14L32.66 19V29L24 34L15.34 29V19L24 14Z" stroke="#00f0ff" stroke-width="1.8" stroke-dasharray="3 3" />
            <circle cx="24" cy="24" r="4" fill="#00f0ff" />
            <path d="M24 4V14M41.32 14L32.66 19M41.32 34L32.66 29M24 44V34M6.68 34L15.34 29M6.68 14L15.34 19" stroke="rgba(0, 240, 255, 0.45)" stroke-width="1.5" />
            <defs>
              <linearGradient id="heroGrad" x1="6.68" y1="4" x2="41.32" y2="44" gradientUnits="userSpaceOnUse">
                <stop stop-color="#00f0ff" />
                <stop offset="0.5" stop-color="#c084fc" />
                <stop offset="1" stop-color="#f43f5e" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <!-- Refined Display Heading -->
        <h1 class="hero-title">GitAssist</h1>
        
        <!-- Natural, Sophisticated Developer Description -->
        <p class="hero-description">
          Autonomous codebase intelligence. Deconstruct architectural boundaries, trace AST dependencies, calculate blast radius, and synthesize evolutionary history—entirely in local memory.
        </p>

        <!-- Command Console Ingestion Deck -->
        <div class="excavation-console-deck">
          <div class="console-input-row">
            <div class="console-input-wrapper">
              <svg class="console-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
              </svg>
              <input 
                type="text" 
                id="landing-repo-input" 
                placeholder="Enter repository path (e.g. /Users/kingpin/Desktop/gitassist)" 
                value="/Users/kingpin/Desktop/gitassist" 
                autocomplete="off"
                spellcheck="false"
              />
            </div>
            <button class="btn-excavate-hero" id="btn-open-repo">
              <span>Excavate Codebase</span>
              <span class="btn-arrow">→</span>
            </button>
          </div>

          <!-- Inline Validation Feedback -->
          <div id="landing-validation-msg" style="display: none; color: var(--danger); font-size: 0.78rem; font-family: var(--font-mono); text-align: left;"></div>
          
          <!-- Subtle Quick Presets -->
          <div class="landing-presets-row">
            <span class="presets-label">Quick select:</span>
            <button type="button" id="btn-preset-current" class="preset-chip">
              <code>gitassist</code> <span class="preset-path">/Users/kingpin/Desktop/gitassist</span>
            </button>
            <button type="button" id="btn-preset-veritas" class="preset-chip">
              <code>veritas-mortis</code> <span class="preset-path">/Users/kingpin/Desktop/veritas-mortis</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Telemetry Strip - Clean & Understated -->
      <section class="landing-telemetry-strip">
        <div class="telemetry-strip-item">
          <div class="telemetry-strip-icon">🎠</div>
          <div>
            <div class="telemetry-strip-val">16 LENSES</div>
            <div class="telemetry-strip-lbl">Interactive 3D Carousel</div>
          </div>
        </div>
        <div class="telemetry-strip-item">
          <div class="telemetry-strip-icon">🕸️</div>
          <div>
            <div class="telemetry-strip-val">AST ENGINE</div>
            <div class="telemetry-strip-lbl">JS • TS • Python • Rust • Go</div>
          </div>
        </div>
        <div class="telemetry-strip-item">
          <div class="telemetry-strip-icon">🔒</div>
          <div>
            <div class="telemetry-strip-val">AIR-GAPPED</div>
            <div class="telemetry-strip-lbl">Zero-Cloud In-Memory Storage</div>
          </div>
        </div>
        <div class="telemetry-strip-item">
          <div class="telemetry-strip-icon">💥</div>
          <div>
            <div class="telemetry-strip-val">BLAST RADIUS</div>
            <div class="telemetry-strip-lbl">Transitive Impact Modeling</div>
          </div>
        </div>
      </section>

      <!-- Refined Feature Cartridges -->
      <section class="landing-grid">
        <!-- 1. Air-Gapped Privacy -->
        <div class="landing-card-cyber">
          <div class="landing-card-cyber-header">
            <span class="landing-card-sector">SECTOR 01</span>
            <span class="landing-card-badge">Local-First</span>
          </div>
          <div class="landing-card-cyber-title">
            <span>🔒</span>
            <span class="text-gradient-cyan">Air-Gapped Forensics</span>
          </div>
          <p class="landing-card-cyber-desc">
            Your proprietary source code never leaves this workstation. All AST symbol extraction, inverted indexing, and Git velocity queries execute strictly in local RAM.
          </p>
          <div class="landing-card-chips">
            <span class="landing-card-chip">Zero Token Leakage</span>
            <span class="landing-card-chip">Sub-Millisecond Queries</span>
            <span class="landing-card-chip">In-Memory Index</span>
          </div>
        </div>

        <!-- 2. Excavation Engines -->
        <div class="landing-card-cyber">
          <div class="landing-card-cyber-header">
            <span class="landing-card-sector">SECTOR 02</span>
            <span class="landing-card-badge">16 Lenses</span>
          </div>
          <div class="landing-card-cyber-title">
            <span>🎠</span>
            <span class="text-gradient-aurora">Multi-Strata Carousel</span>
          </div>
          <p class="landing-card-cyber-desc">
            Explore living module boundaries, circular dependencies, churn hotspots, and blast radius ripple effects through an interactive 3D merry-go-round carousel.
          </p>
          <div class="landing-card-chips">
            <span class="landing-card-chip">Living Topology</span>
            <span class="landing-card-chip">Impact Radius</span>
            <span class="landing-card-chip">Drift Hotspots</span>
          </div>
        </div>

        <!-- 3. Tactical Hotkeys -->
        <div class="landing-card-cyber">
          <div class="landing-card-cyber-header">
            <span class="landing-card-sector">SECTOR 03</span>
            <span class="landing-card-badge">Shortcuts</span>
          </div>
          <div class="landing-card-cyber-title">
            <span>⚡</span>
            <span style="background: linear-gradient(135deg, #fbbf24, #f43f5e); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Rapid Key Navigation</span>
          </div>
          <p class="landing-card-cyber-desc">
            Accelerate code audits with keyboard controls designed for high-efficiency investigation workflows and rapid symbol traversal.
          </p>
          <div class="landing-card-chips">
            <span class="landing-card-chip"><kbd>⌘K</kbd> Forensic Search</span>
            <span class="landing-card-chip"><kbd>1 - 6</kbd> Direct Lens Jump</span>
            <span class="landing-card-chip"><kbd>← / →</kbd> Spin Carousel</span>
          </div>
        </div>
      </section>
    `;

    const input = container.querySelector('#landing-repo-input');
    const openBtn = container.querySelector('#btn-open-repo');
    const presetCurrentBtn = container.querySelector('#btn-preset-current');
    const presetVeritasBtn = container.querySelector('#btn-preset-veritas');
    const dismissBtn = container.querySelector('#btn-dismiss-error');
    const valMsg = container.querySelector('#landing-validation-msg');

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        if (this.onClearError) this.onClearError();
      });
    }

    const triggerExcavation = async () => {
      const selectedPath = input.value.trim();

      if (!selectedPath) {
        input.focus();
        input.style.borderColor = 'var(--danger)';
        if (valMsg) {
          valMsg.textContent = '⚠️ Enter a local directory path or Git repository URL to begin excavation.';
          valMsg.style.display = 'block';
        }
        return;
      }

      if (valMsg) valMsg.style.display = 'none';
      input.style.borderColor = 'var(--border-holo)';

      // Visually indicate processing state and disable button
      openBtn.innerHTML = '<span>⚡</span><span>EXCAVATING...</span>';
      openBtn.disabled = true;
      openBtn.style.opacity = '0.75';

      try {
        if (this.onQuickAnalyze) {
          await this.onQuickAnalyze(selectedPath);
        } else if (this.onOpenRepository) {
          await this.onOpenRepository();
        }
      } catch (err) {
        console.error('[Landing Excavate Error]', err);
        if (valMsg) {
          valMsg.textContent = `⚠️ ${err.message}`;
          valMsg.style.display = 'block';
        }
      } finally {
        if (openBtn) {
          openBtn.innerHTML = '<span>🚀</span><span>EXCAVATE</span>';
          openBtn.disabled = false;
          openBtn.style.opacity = '1';
        }
      }
    };

    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerExcavation();
    });

    input.addEventListener('keydown', (e) => {
      if (valMsg) valMsg.style.display = 'none';
      input.style.borderColor = 'var(--border-holo)';
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerExcavation();
      }
    });

    if (presetCurrentBtn) {
      presetCurrentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        input.value = '/Users/kingpin/Desktop/gitassist';
        triggerExcavation();
      });
    }

    if (presetVeritasBtn) {
      presetVeritasBtn.addEventListener('click', (e) => {
        e.preventDefault();
        input.value = '/Users/kingpin/Desktop/veritas-mortis';
        triggerExcavation();
      });
    }

    this.element = container;
    return container;
  }
}
