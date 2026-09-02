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

      <!-- Original Cyber Hero Section -->
      <section class="landing-hero">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span class="brand-badge" style="font-size: 0.72rem; padding: 3px 8px;">LOCAL-FIRST // ZERO-CLOUD // FORENSICS</span>
        </div>
        <div class="hero-icon">⚡</div>
        <h1 class="hero-title text-gradient-cyber">GitAssist</h1>
        <p class="hero-description">
          Analyze your codebase, understand its architecture, trace AST relationships, explore Git chronology, and uncover structural dependencies—100% offline.
        </p>

        <!-- Direct Ingestion Input & Action -->
        <div style="width: 100%; max-width: 640px; display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
          <div style="display: flex; gap: 10px;">
            <input 
              type="text" 
              id="landing-repo-input" 
              placeholder="Enter local path or Git URL (e.g. /Users/kingpin/Desktop/gitassist)" 
              value="/Users/kingpin/Desktop/gitassist" 
              autocomplete="off"
              spellcheck="false"
              style="flex: 1; padding: 10px 14px; background: var(--bg-input); border: 1px solid var(--border-holo); border-radius: 6px; color: var(--text-primary); font-family: var(--font-mono); font-size: 0.86rem;"
            />
            <button class="btn-primary" id="btn-open-repo">
              <span>🚀</span>
              <span>EXCAVATE</span>
            </button>
          </div>

          <!-- Inline Validation Feedback -->
          <div id="landing-validation-msg" style="display: none; color: var(--danger); font-size: 0.78rem; font-family: var(--font-mono); text-align: left;"></div>
          
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; font-size: 0.76rem; color: var(--text-muted);">
            <span>Quick presets:</span>
            <button type="button" id="btn-preset-current" class="btn-secondary" style="padding: 2px 8px; font-size: 0.72rem;">
              ⚡ GitAssist Repo (<code>/Users/kingpin/Desktop/gitassist</code>)
            </button>
            <button type="button" id="btn-preset-veritas" class="btn-secondary" style="padding: 2px 8px; font-size: 0.72rem;">
              ⚡ Veritas Mortis (<code>/Users/kingpin/Desktop/veritas-mortis</code>)
            </button>
          </div>
        </div>
      </section>

      <!-- Original Cyber 3-Card Grid -->
      <section class="landing-grid">
        <!-- 1. Recent Repositories -->
        <div class="landing-card">
          <div class="landing-card-header">
            <h3 class="landing-card-title">
              <span>🕒</span>
              <span>Active Workspace</span>
            </h3>
            <span class="landing-card-badge">Local-First</span>
          </div>
          <div class="landing-card-content">
            <ul class="placeholder-list">
              <li class="placeholder-item">
                <span>📁</span>
                <span>Ready to scan local directories or auto-clone public Git repositories into local memory.</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 2. Archaeological Capabilities -->
        <div class="landing-card">
          <div class="landing-card-header">
            <h3 class="landing-card-title">
              <span>◈</span>
              <span>Excavation Engines</span>
            </h3>
            <span class="landing-card-badge">16 Lenses</span>
          </div>
          <div class="landing-card-content">
            <ul class="placeholder-list">
              <li class="placeholder-item">
                <span>🔍</span>
                <span>AST Symbol Indexing, 3D Subsystem Strata, Living Dependency Graphs, and Risk Hotspot Telemetry.</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 3. Tactical Hotkeys -->
        <div class="landing-card">
          <div class="landing-card-header">
            <h3 class="landing-card-title">
              <span>⚡</span>
              <span>Quick Navigation</span>
            </h3>
            <span class="landing-card-badge">Hotkeys</span>
          </div>
          <div class="landing-card-content">
            <ul class="placeholder-list">
              <li class="placeholder-item">
                <span>⌨️</span>
                <span>Press <code>⌘K</code> for Forensic Search, <code>1-6</code> to switch tactical investigation lenses.</span>
              </li>
            </ul>
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
