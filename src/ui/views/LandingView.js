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
      <div style="background: rgba(255, 0, 85, 0.12); border: 1px solid var(--danger); border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
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
      ${errorHtml}

      <!-- Original Cyber Hero Section -->
      <section class="landing-hero">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span class="brand-badge" style="font-size: 0.72rem; padding: 3px 8px;">LOCAL-FIRST // ZERO-CLOUD // FORENSICS</span>
        </div>
        <div class="hero-icon">🏛️</div>
        <h1 class="hero-title">Codebase Archaeologist</h1>
        <p class="hero-description">
          Analyze your codebase, understand its architecture, trace AST relationships, explore Git chronology, and uncover structural dependencies—100% offline.
        </p>

        <!-- Direct Ingestion Input & Action -->
        <div style="width: 100%; max-width: 620px; display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
          <div style="display: flex; gap: 10px;">
            <input 
              type="text" 
              id="landing-repo-input" 
              placeholder="Enter local path or Git URL (e.g. /Users/kingpin/Desktop/gitassist)" 
              value="/Users/kingpin/Desktop/gitassist" 
              style="flex: 1; padding: 10px 14px; background: var(--bg-input); border: 1px solid var(--border-holo); border-radius: 6px; color: var(--text-primary); font-family: var(--font-mono); font-size: 0.86rem;"
            />
            <button class="btn-primary" id="btn-open-repo">
              <span>🚀</span>
              <span>EXCAVATE</span>
            </button>
          </div>
          
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.76rem; color: var(--text-muted);">
            <span>Quick preset:</span>
            <button type="button" id="btn-preset-current" class="btn-secondary" style="padding: 2px 8px; font-size: 0.72rem;">
              ⚡ Current GitAssist Repo
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
            <span class="landing-card-badge">10 Lenses</span>
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
    const presetBtn = container.querySelector('#btn-preset-current');
    const dismissBtn = container.querySelector('#btn-dismiss-error');

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        if (this.onClearError) this.onClearError();
      });
    }

    const triggerExcavation = () => {
      const selectedPath = input.value.trim();
      if (!selectedPath) return;

      openBtn.innerHTML = '<span>⚡</span><span>EXCAVATING...</span>';

      if (this.onQuickAnalyze) {
        this.onQuickAnalyze(selectedPath);
      } else if (this.onOpenRepository) {
        this.onOpenRepository();
      }
    };

    openBtn.addEventListener('click', triggerExcavation);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') triggerExcavation();
    });

    presetBtn.addEventListener('click', () => {
      input.value = '/Users/kingpin/Desktop/gitassist';
      triggerExcavation();
    });

    this.element = container;
    return container;
  }
}
