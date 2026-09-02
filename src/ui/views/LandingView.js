/**
 * LandingView Component
 * Dedicated Archaeological Expedition Homepage & Product Introduction
 */
export class LandingView {
  constructor({ onOpenRepository, onQuickAnalyze }) {
    this.onOpenRepository = onOpenRepository;
    this.onQuickAnalyze = onQuickAnalyze;
    this.element = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    container.innerHTML = `
      <!-- 1. Hero Expedition Section -->
      <section class="landing-hero">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: -4px;">
          <span class="brand-badge" style="font-size: 0.72rem; padding: 4px 10px;">LOCAL-FIRST // ZERO DEPENDENCY // OFFLINE</span>
        </div>
        <div class="hero-icon">🏛️</div>
        <h1 class="hero-title" style="font-size: 2.6rem; letter-spacing: -0.02em;">Codebase Archaeologist</h1>
        <p class="hero-description" style="font-size: 1.1rem; max-width: 680px; color: var(--text-secondary); line-height: 1.6;">
          Step inside unfamiliar software systems. Excavate living module strata, trace AST symbol relationships, decode Git chronology, and uncover architectural health.
        </p>

        <!-- Direct Primary Action Buttons -->
        <div style="display: flex; flex-wrap: wrap; gap: 14px; margin-top: 8px; justify-content: center;">
          <button class="btn-primary" id="btn-open-repo-main" style="padding: 12px 24px; font-size: 0.95rem;">
            <span>🚀</span>
            <span>Begin Archaeological Dig</span>
          </button>
          <button class="btn-secondary" id="btn-analyze-current" style="padding: 12px 22px; font-size: 0.92rem; border-color: var(--accent-cyan);">
            <span>⚡</span>
            <span>Analyze Current Project (1-Click)</span>
          </button>
        </div>
      </section>

      <!-- 2. Interactive Archaeological Lenses (Capabilities Grid) -->
      <section style="display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-strata); padding-bottom: 8px;">
          <h2 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); font-family: var(--font-mono); letter-spacing: 0.04em;">
            ◈ ARCHAEOLOGICAL CAPABILITIES & INVESTIGATION LENSES
          </h2>
          <span class="landing-card-badge">Core Toolset</span>
        </div>

        <div class="landing-grid">
          <!-- Capability 1: Living Strata Holomap -->
          <div class="landing-card" style="border-top: 3px solid var(--accent-cyan);">
            <div class="landing-card-header">
              <h3 class="landing-card-title">
                <span>◈</span>
                <span>Spatial Strata Holomap</span>
              </h3>
              <span class="landing-card-badge">3D Subsystems</span>
            </div>
            <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5;">
              Visual 3D perspective decomposition of your codebase's modules, subsystems, and dependency layers with real-time health telemetry.
            </p>
          </div>

          <!-- Capability 2: AST Symbol Explorer -->
          <div class="landing-card" style="border-top: 3px solid var(--accent-neural);">
            <div class="landing-card-header">
              <h3 class="landing-card-title">
                <span>📁</span>
                <span>Deep AST Symbol Index</span>
              </h3>
              <span class="landing-card-badge">Symbol Parser</span>
            </div>
            <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5;">
              Instantly parse and extract classes, function signatures, imports, and exports across JavaScript, TypeScript, and Python files.
            </p>
          </div>

          <!-- Capability 3: Chrono-Strata Git Lineage -->
          <div class="landing-card" style="border-top: 3px solid var(--accent-amber);">
            <div class="landing-card-header">
              <h3 class="landing-card-title">
                <span>📜</span>
                <span>Chrono-Strata Git Lineage</span>
              </h3>
              <span class="landing-card-badge">Read-Only Git</span>
            </div>
            <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5;">
              Interactive timeline of commit strata, branch divergency, author ownership, and churn frequency without altering your repo.
            </p>
          </div>

          <!-- Capability 4: AI Field Investigator -->
          <div class="landing-card" style="border-top: 3px solid var(--success);">
            <div class="landing-card-header">
              <h3 class="landing-card-title">
                <span>🤖</span>
                <span>AI Field Investigator</span>
              </h3>
              <span class="landing-card-badge">Local Engine</span>
            </div>
            <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5;">
              Offline natural language queries to ask architectural questions, calculate blast radii, and package structured prompt context.
            </p>
          </div>
        </div>
      </section>

      <!-- 3. How Archaeological Investigation Works -->
      <section class="landing-card" style="background: var(--bg-blade);">
        <div class="landing-card-header">
          <h3 class="landing-card-title">
            <span>⚡</span>
            <span>How Codebase Archaeology Works</span>
          </h3>
          <span class="landing-card-badge">3-Step Process</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-top: 8px;">
          <div style="background: var(--bg-input); border: 1px solid var(--border-strata); border-radius: 8px; padding: 16px;">
            <div style="color: var(--accent-cyan); font-weight: 800; font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 6px;">
              STEP 01 // TARGET
            </div>
            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem; margin-bottom: 4px;">
              Select Local Path
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
              Provide any directory path on your computer. Completely offline and local-first.
            </div>
          </div>

          <div style="background: var(--bg-input); border: 1px solid var(--border-strata); border-radius: 8px; padding: 16px;">
            <div style="color: var(--accent-cyan); font-weight: 800; font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 6px;">
              STEP 02 // EXCAVATE
            </div>
            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem; margin-bottom: 4px;">
              Parse AST & History
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
              Algorithmic scanners parse code symbols, calculate complexity metrics, and index Git churn.
            </div>
          </div>

          <div style="background: var(--bg-input); border: 1px solid var(--border-strata); border-radius: 8px; padding: 16px;">
            <div style="color: var(--accent-cyan); font-weight: 800; font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 6px;">
              STEP 03 // EXPLORE
            </div>
            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem; margin-bottom: 4px;">
              Navigate Living Holomap
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
              Explore modules with the 3D deck, trace symbols, export Mermaid diagrams, and consult the AI.
            </div>
          </div>
        </div>
      </section>
    `;

    // Connect Action Listeners
    container.querySelector('#btn-open-repo-main').addEventListener('click', () => {
      if (this.onOpenRepository) this.onOpenRepository();
    });

    container.querySelector('#btn-analyze-current').addEventListener('click', () => {
      if (this.onQuickAnalyze) {
        this.onQuickAnalyze('/Users/kingpin/Desktop/gitassist');
      } else if (this.onOpenRepository) {
        this.onOpenRepository();
      }
    });

    this.element = container;
    return container;
  }
}
