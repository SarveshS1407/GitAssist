/**
 * LandingView Component
 * Dedicated Minimal Homescreen with Direct Inline Git Repository Input
 */
export class LandingView {
  constructor({ onOpenRepository, onQuickAnalyze }) {
    this.onOpenRepository = onOpenRepository;
    this.onQuickAnalyze = onQuickAnalyze;
    this.element = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container minimal-homescreen-container';

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
          Paste a local Git repository directory or repository path to begin exploring its architecture, relationships, history, and impact.
        </p>
      </div>

      <!-- Central Git Repository Input Box & Action -->
      <div class="homescreen-input-card">
        <div class="input-glow-wrapper">
          <span class="input-icon">📁</span>
          <input 
            type="text" 
            id="homescreen-repo-input" 
            class="homescreen-input" 
            placeholder="Enter repository path (e.g. /Users/username/projects/my-repo)" 
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

    const triggerArchaeology = () => {
      const selectedPath = input.value.trim();
      if (!selectedPath) return;

      if (this.onQuickAnalyze) {
        this.onQuickAnalyze(selectedPath);
      } else if (this.onOpenRepository) {
        this.onOpenRepository();
      }
    };

    beginBtn.addEventListener('click', triggerArchaeology);
    input.addEventListener('keydown', (e) => {
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
