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

      <!-- Futuristic Cyber Hero Section -->
      <section class="landing-hero">
        <div class="landing-hero-scanline"></div>
        <div class="strata-card-corner tl"></div>
        <div class="strata-card-corner tr"></div>
        <div class="strata-card-corner bl"></div>
        <div class="strata-card-corner br"></div>

        <!-- System Status Badges -->
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; width: 100%; max-width: 720px; gap: 8px; z-index: 2;">
          <span class="brand-badge" style="font-size: 0.72rem; padding: 4px 10px;">
            ◈ FORENSIC CODEBASE INTELLIGENCE // DEEP REPOSITORY EXCAVATION
          </span>
          <span style="font-size: 0.72rem; color: var(--success); font-family: var(--font-mono); font-weight: 700; letter-spacing: 0.05em;">
            ● 100% AIR-GAPPED // NO API KEYS NEEDED
          </span>
        </div>

        <!-- Multi-Ring Holographic Hero Emblem -->
        <div class="hero-icon-container">
          <div class="hero-icon-ring-outer"></div>
          <div class="hero-icon-halo"></div>
          <div class="hero-icon-glyph">⚡</div>
        </div>

        <!-- Bold Cyber Display Heading -->
        <h1 class="hero-title">GITASSIST</h1>
        
        <!-- High-Impact Description with Highlighted Highlights -->
        <p class="hero-description">
          Autonomous codebase forensics. Deconstruct <span class="highlight-cyan">architectural boundaries</span>, trace <span class="highlight-magenta">AST dependencies</span>, calculate <span class="highlight-yellow">ripple blast radius</span>, and synthesize <span class="highlight-purple">evolutionary history</span>—100% offline in local memory.
        </p>

        <!-- High-Tech Excavation Console Deck -->
        <div class="excavation-console-deck">
          <div class="console-deck-header">
            <span>TERMINAL INGESTION PROTOCOL // TARGET REPOSITORY</span>
            <span style="color: var(--success);">● READY</span>
          </div>

          <div class="console-input-row">
            <div class="console-input-wrapper">
              <span class="console-prompt-glyph">PATH //</span>
              <input 
                type="text" 
                id="landing-repo-input" 
                placeholder="Enter local directory path or Git URL (e.g. /Users/kingpin/Desktop/gitassist)" 
                value="/Users/kingpin/Desktop/gitassist" 
                autocomplete="off"
                spellcheck="false"
              />
            </div>
            <button class="btn-excavate-hero" id="btn-open-repo">
              <span>🚀</span>
              <span>EXCAVATE REPOSITORY ❯</span>
            </button>
          </div>

          <!-- Inline Validation Feedback -->
          <div id="landing-validation-msg" style="display: none; color: var(--danger); font-size: 0.78rem; font-family: var(--font-mono); text-align: left;"></div>
          
          <!-- Quick Preset Chips -->
          <div class="landing-presets-row">
            <span style="font-family: var(--font-mono); font-weight: 700;">PRESETS:</span>
            <button type="button" id="btn-preset-current" class="preset-chip">
              ⚡ GitAssist Core (<code>/Users/kingpin/Desktop/gitassist</code>)
            </button>
            <button type="button" id="btn-preset-veritas" class="preset-chip">
              ⚔️ Veritas Mortis (<code>/Users/kingpin/Desktop/veritas-mortis</code>)
            </button>
          </div>
        </div>
      </section>

      <!-- Live Engine Telemetry Strip -->
      <section class="landing-telemetry-strip">
        <div class="telemetry-strip-item">
          <div class="telemetry-strip-icon">🎠</div>
          <div>
            <div class="telemetry-strip-val">16 LENSES</div>
            <div class="telemetry-strip-lbl">3D Holographic Carousel</div>
          </div>
        </div>
        <div class="telemetry-strip-item">
          <div class="telemetry-strip-icon">🕸️</div>
          <div>
            <div class="telemetry-strip-val">AST ENGINE</div>
            <div class="telemetry-strip-lbl">JS, TS, Py, Rust, Go, Java</div>
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
            <div class="telemetry-strip-lbl">Transitive Ripple Graph</div>
          </div>
        </div>
      </section>

      <!-- Upgraded Holographic Feature Cartridges -->
      <section class="landing-grid">
        <!-- 1. Air-Gapped Privacy -->
        <div class="landing-card-cyber">
          <div class="strata-card-corner tl"></div>
          <div class="strata-card-corner tr"></div>
          <div class="landing-card-cyber-header">
            <span class="landing-card-sector">SECTOR [01 // PRIVACY]</span>
            <span class="landing-card-badge neon-badge">Local-First</span>
          </div>
          <div class="landing-card-cyber-title">
            <span>🔒</span>
            <span class="text-gradient-cyan">Air-Gapped Forensics</span>
          </div>
          <p class="landing-card-cyber-desc">
            Your proprietary source code never leaves this machine. All AST symbol extraction, inverted indexing, and Git velocity queries execute strictly in-memory.
          </p>
          <div class="landing-card-chips">
            <span class="landing-card-chip">🔒 ZERO TOKEN LEAKAGE</span>
            <span class="landing-card-chip">⚡ SUB-MS LATENCY</span>
            <span class="landing-card-chip">💾 RAM INDEX ONLY</span>
          </div>
        </div>

        <!-- 2. Excavation Engines -->
        <div class="landing-card-cyber cyber-violet">
          <div class="strata-card-corner tl"></div>
          <div class="strata-card-corner tr"></div>
          <div class="landing-card-cyber-header">
            <span class="landing-card-sector" style="color: #c084fc;">SECTOR [02 // LENSES]</span>
            <span class="landing-card-badge neon-badge" style="border-color: rgba(168, 85, 247, 0.5); color: #c084fc;">16 Lenses</span>
          </div>
          <div class="landing-card-cyber-title">
            <span>🎠</span>
            <span class="text-gradient-aurora">Multi-Strata Carousel</span>
          </div>
          <p class="landing-card-cyber-desc">
            Explore living module boundaries, circular dependencies, churn hotspots, and blast radius ripple effects through an interactive 3D merry-go-round carousel.
          </p>
          <div class="landing-card-chips">
            <span class="landing-card-chip chip-violet">🕸️ LIVING TOPOLOGY</span>
            <span class="landing-card-chip chip-violet">💥 IMPACT RADIUS</span>
            <span class="landing-card-chip chip-violet">⚡ DRIFT MATRIX</span>
          </div>
        </div>

        <!-- 3. Tactical Hotkeys -->
        <div class="landing-card-cyber cyber-amber">
          <div class="strata-card-corner tl"></div>
          <div class="strata-card-corner tr"></div>
          <div class="landing-card-cyber-header">
            <span class="landing-card-sector" style="color: #fbbf24;">SECTOR [03 // CONTROL]</span>
            <span class="landing-card-badge neon-badge" style="border-color: rgba(251, 191, 36, 0.5); color: #fbbf24;">Mission Control</span>
          </div>
          <div class="landing-card-cyber-title">
            <span>⚡</span>
            <span style="background: linear-gradient(135deg, #fbbf24, #f43f5e); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Rapid Key Navigation</span>
          </div>
          <p class="landing-card-cyber-desc">
            Accelerate code audits with keyboard controls designed for high-efficiency investigation workflows and rapid symbol traversal.
          </p>
          <div class="landing-card-chips">
            <span class="landing-card-chip chip-amber"><kbd>⌘K</kbd> Forensic Search</span>
            <span class="landing-card-chip chip-amber"><kbd>1 - 6</kbd> Direct Lens Jump</span>
            <span class="landing-card-chip chip-amber"><kbd>← / →</kbd> Spin 3D Carousel</span>
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
