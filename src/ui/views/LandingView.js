/**
 * Landing / Empty State View
 * Shown when no repository is currently active.
 */
export class LandingView {
  constructor({ onOpenRepository }) {
    this.onOpenRepository = onOpenRepository;
    this.element = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    container.innerHTML = `
      <!-- Hero Section -->
      <section class="landing-hero">
        <div class="hero-icon">🏛️</div>
        <h1 class="hero-title">Codebase Archaeologist</h1>
        <p class="hero-description">
          Analyze your codebase, understand its architecture, explore Git history, and uncover relationships across your project.
        </p>
        <div class="hero-actions">
          <button class="btn-primary" id="btn-open-repo">
            <span>📁</span>
            <span>Open Repository</span>
          </button>
        </div>
      </section>

      <!-- Placeholders Grid -->
      <section class="landing-grid">
        <!-- 1. Recent Repositories -->
        <div class="landing-card">
          <div class="landing-card-header">
            <h3 class="landing-card-title">
              <span>🕒</span>
              <span>Recent Repositories</span>
            </h3>
            <span class="landing-card-badge">Placeholder</span>
          </div>
          <div class="landing-card-content">
            <ul class="placeholder-list">
              <li class="placeholder-item">
                <span>📁</span>
                <span>No recent repositories yet. Opened repositories will appear here for instant reloading.</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 2. Repository History -->
        <div class="landing-card">
          <div class="landing-card-header">
            <h3 class="landing-card-title">
              <span>📜</span>
              <span>Repository History</span>
            </h3>
            <span class="landing-card-badge">Placeholder</span>
          </div>
          <div class="landing-card-content">
            <ul class="placeholder-list">
              <li class="placeholder-item">
                <span>🔍</span>
                <span>History will track past archaeological scans, architectural diffs, and complexity trends.</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 3. Quick Actions -->
        <div class="landing-card">
          <div class="landing-card-header">
            <h3 class="landing-card-title">
              <span>⚡</span>
              <span>Quick Actions</span>
            </h3>
            <span class="landing-card-badge">Available</span>
          </div>
          <div class="landing-card-content">
            <ul class="placeholder-list">
              <li class="placeholder-item">
                <span>⌨️</span>
                <span>Global Search: Click <code>⌘K</code> in header</span>
              </li>
              <li class="placeholder-item">
                <span>🧭</span>
                <span>Sidebar: Switch between 8 architectural views</span>
              </li>
              <li class="placeholder-item">
                <span>🔒</span>
                <span>Local-First: 100% offline analysis</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    `;

    container.querySelector('#btn-open-repo').addEventListener('click', () => {
      if (this.onOpenRepository) {
        this.onOpenRepository();
      } else {
        const repoPath = prompt('Enter absolute path to local repository:');
        if (repoPath) {
          alert(`Selected path: ${repoPath}\n(Repository validation and loading will connect in Step 5)`);
        }
      }
    });

    this.element = container;
    return container;
  }
}
