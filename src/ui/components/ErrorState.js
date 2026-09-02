/**
 * ErrorState Component
 * Displays user-friendly error banners, retry actions, and homescreen return
 */
export class ErrorState {
  constructor({
    title = 'EXCAVATION FAILED',
    message,
    onRetry,
    onBack
  } = {}) {
    this.title = title;
    this.message = message || 'An unexpected error occurred while processing the repository.';
    this.onRetry = onRetry;
    this.onBack = onBack;
  }

  render() {
    const card = document.createElement('div');
    card.className = 'excavation-failure-card';

    card.innerHTML = `
      <div style="font-size: 2.8rem; filter: drop-shadow(0 0 12px rgba(255, 0, 85, 0.4));">⚠️</div>
      
      <div>
        <h2 style="color: var(--danger); font-family: var(--font-mono); font-size: 1.25rem; letter-spacing: 0.05em; margin: 0;">
          ${this.title}
        </h2>
        <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">
          ARCHAEOLOGICAL SECTOR ERROR // ZERO-CLOUD RUNTIME
        </div>
      </div>

      <div style="background: rgba(255, 0, 85, 0.08); border: 1px solid rgba(255, 0, 85, 0.25); border-radius: 8px; padding: 14px 18px; max-width: 560px; width: 100%;">
        <p style="color: var(--text-primary); font-size: 0.88rem; line-height: 1.55; margin: 0; font-family: var(--font-mono); word-break: break-word;">
          ${this.message}
        </p>
      </div>

      <div class="failure-actions-row">
        ${this.onRetry ? `
          <button class="btn-primary" id="btn-error-retry" style="padding: 10px 20px; font-size: 0.88rem; border-color: var(--accent-cyan);">
            <span>🔄</span>
            <span>RETRY EXCAVATION</span>
          </button>
        ` : ''}

        ${this.onBack ? `
          <button class="btn-secondary" id="btn-error-back" style="padding: 10px 20px; font-size: 0.88rem;">
            <span>←</span>
            <span>BACK TO HOMESCREEN</span>
          </button>
        ` : ''}
      </div>
    `;

    if (this.onRetry) {
      const btn = card.querySelector('#btn-error-retry');
      if (btn) btn.addEventListener('click', this.onRetry);
    }

    if (this.onBack) {
      const btnBack = card.querySelector('#btn-error-back');
      if (btnBack) btnBack.addEventListener('click', this.onBack);
    }

    return card;
  }
}
