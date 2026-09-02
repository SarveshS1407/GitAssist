/**
 * LandingView Component
 * Dedicated Archaeological Entrance Experience (No Sidebar)
 */
export class LandingView {
  constructor({ onOpenRepository, onQuickAnalyze }) {
    this.onOpenRepository = onOpenRepository;
    this.onQuickAnalyze = onQuickAnalyze;
    this.element = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container landing-entrance-container';

    container.innerHTML = `
      <!-- Architectural Atmosphere & Decorative Node Strata -->
      <div class="entrance-nodes-deco">
        <span class="deco-node">◈</span>
        <span class="deco-line"></span>
        <span class="deco-node">◈</span>
        <span class="deco-line"></span>
        <span class="deco-node">◈</span>
      </div>

      <!-- Main Entrance Hero -->
      <section class="entrance-hero">
        <div class="entrance-badge-container">
          <span class="brand-badge">LOCAL-FIRST SOFTWARE FORENSICS</span>
        </div>

        <div class="entrance-icon">🏛️</div>

        <h1 class="entrance-title">CODEBASE ARCHAEOLOGIST</h1>

        <p class="entrance-tagline">
          Uncover the hidden structure of your codebase.
        </p>

        <p class="entrance-description">
          A local-first investigation platform designed to explore unfamiliar software systems. 
          Excavate architecture, trace AST symbol relationships, decode Git chronology, and understand structural changes—completely offline.
        </p>

        <!-- Dominant Primary CTA -->
        <div class="entrance-cta-group">
          <button class="btn-primary entrance-btn-dominant" id="btn-begin-archaeology">
            <span>🚀</span>
            <span>BEGIN ARCHAEOLOGY</span>
          </button>
        </div>

        <!-- Subtle Quick Launch Alternative -->
        <div class="entrance-quick-link">
          <button type="button" class="entrance-subtle-link" id="btn-quick-launch">
            <span>⚡</span>
            <span>Or analyze current project: <code>/Users/kingpin/Desktop/gitassist</code></span>
          </button>
        </div>
      </section>

      <!-- Progressive Disclosure: What It Investigates -->
      <section class="entrance-capabilities-summary">
        <div class="entrance-capability-item">
          <span class="cap-icon">◈</span>
          <div>
            <div class="cap-title">Architecture & Subsystems</div>
            <div class="cap-text">Deconstruct complex systems into 3D module strata and living dependency graphs.</div>
          </div>
        </div>

        <div class="entrance-capability-item">
          <span class="cap-icon">📁</span>
          <div>
            <div class="cap-title">AST Symbol Relationships</div>
            <div class="cap-text">Extract classes, functions, and cross-file imports across JS, TS, and Python.</div>
          </div>
        </div>

        <div class="entrance-capability-item">
          <span class="cap-icon">📜</span>
          <div>
            <div class="cap-title">Git History & Chronology</div>
            <div class="cap-text">Navigate branch lineages, commit churn rates, and historical code ownership.</div>
          </div>
        </div>

        <div class="entrance-capability-item">
          <span class="cap-icon">🤖</span>
          <div>
            <div class="cap-title">Impact & Understanding</div>
            <div class="cap-text">Calculate blast radii, detect cyclic dependencies, and consult local AI analysis.</div>
          </div>
        </div>
      </section>
    `;

    // Connect Primary CTA
    container.querySelector('#btn-begin-archaeology').addEventListener('click', () => {
      if (this.onOpenRepository) this.onOpenRepository();
    });

    // Connect Subtle Preset Launch
    container.querySelector('#btn-quick-launch').addEventListener('click', () => {
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
