/**
 * LandingView Component
 * Dedicated Minimal Homescreen with Direct Inline Git Repository Input
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
    container.className = 'view-container minimal-homescreen-container';

    const errorHtml = this.error ? `
      <div style="background: rgba(255, 0, 85, 0.12); border: 1px solid var(--danger); border-radius: 8px; padding: 12px 16px; width: 100%; text-align: left; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
        <div style="display: flex; gap: 10px; align-items: flex-start;">
          <span style="font-size: 1.1rem;">⚠️</span>
          <div>
            <div style="color: var(--danger); font-weight: 800; font-family: var(--font-mono); font-size: 0.8rem; text-transform: uppercase;">Excavation Alert</div>
            <div style="color: var(--text-primary); font-size: 0.85rem; margin-top: 2px;">${this.error}</div>
          </div>
        </div>
        <button type="button" id="btn-dismiss-error" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1rem;">✕</button>
      </div>
    ` : '';

    container.innerHTML = `
      <!-- Minimalist Architectural Emblem & Horizon -->
      <div class="homescreen-emblem">
        <span class="emblem-symbol">🏛️</span>
        <span class="emblem-beacon">● LOCAL-FIRST FORENSICS</span>
      </div>

      <!-- Hero Typography Hierarchy -->
      <div class="homescreen-hero-text">
        <h1 class="homescreen-title">
          <span>CODEBASE</span>
          <span class="title-highlight">ARCHAEOLOGIST</span>
        </h1>

        <p class="homescreen-tagline">
          Uncover the hidden structure of your codebase.
        </p>

        <p class="homescreen-description">
          Paste a local Git repository directory or repository URL to begin exploring its architecture, relationships, history, and impact.
        </p>
      </div>

      ${errorHtml}

      <!-- Central Git Repository Input Box & Action -->
      <div class="homescreen-input-card">
        <div class="input-glow-wrapper">
          <span class="input-icon">📁</span>
          <input 
            type="text" 
            id="homescreen-repo-input" 
            class="homescreen-input" 
            placeholder="Enter local path or repo URL (e.g. /Users/kingpin/Desktop/gitassist)" 
            value="/Users/kingpin/Desktop/gitassist" 
            autocomplete="off"
            spellcheck="false"
          />
        </div>

        <!-- Primary Action Button -->
        <button class="btn-primary homescreen-btn-begin" id="btn-homescreen-begin">
          <span>🚀</span>
          <span>BEGIN ARCHAEOLOGY</span>
        </button>

        <!-- Quick Launch Preset -->
        <div class="homescreen-preset-bar">
          <span class="preset-label">Quick presets:</span>
          <button type="button" class="preset-chip" id="btn-preset-gitassist">
            ⚡ Current Project (<code>/Users/kingpin/Desktop/gitassist</code>)
          </button>
        </div>
      </div>

      <!-- Offline Security Note -->
      <div class="homescreen-footer-note">
        <span>🔒 100% Offline & Local-First • Zero Cloud Transmission • Read-Only Analysis</span>
      </div>
    `;

    const input = container.querySelector('#homescreen-repo-input');
    const beginBtn = container.querySelector('#btn-homescreen-begin');
    const presetBtn = container.querySelector('#btn-preset-gitassist');
    const dismissBtn = container.querySelector('#btn-dismiss-error');

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        if (this.onClearError) this.onClearError();
      });
    }

    const triggerArchaeology = () => {
      const selectedPath = input.value.trim();
      if (!selectedPath) {
        input.focus();
        input.style.borderColor = 'var(--danger)';
        return;
      }

      beginBtn.innerHTML = '<span>⚡</span><span>INITIALIZING EXCAVATION...</span>';
      beginBtn.style.opacity = '0.8';

      if (this.onQuickAnalyze) {
        this.onQuickAnalyze(selectedPath);
      } else if (this.onOpenRepository) {
        this.onOpenRepository();
      }
    };

    beginBtn.addEventListener('click', triggerArchaeology);
    input.addEventListener('keydown', (e) => {
      input.style.borderColor = 'var(--border-holo)';
      if (e.key === 'Enter') triggerArchaeology();
    });

    presetBtn.addEventListener('click', () => {
      input.value = '/Users/kingpin/Desktop/gitassist';
      triggerArchaeology();
    });

    this.element = container;
    return container;
  }
}
