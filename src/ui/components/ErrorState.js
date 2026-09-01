/**
 * ErrorState Component
 * Displays user-friendly error banners and retry actions
 */
export class ErrorState {
  constructor({ title = 'Error Loading Repository', message, onRetry }) {
    this.title = title;
    this.message = message || 'An unexpected error occurred while processing the repository.';
    this.onRetry = onRetry;
  }

  render() {
    const card = document.createElement('div');
    card.className = 'placeholder-card error-card';

    let retryHtml = '';
    if (this.onRetry) {
      retryHtml = `
        <button class="btn-secondary" id="btn-error-retry" style="margin-top: 12px;">
          <span>🔄</span>
          <span>Try Again</span>
        </button>
      `;
    }

    card.innerHTML = `
      <div style="font-size: 2.4rem;">⚠️</div>
      <h3 style="color: var(--danger); font-size: 1.15rem;">${this.title}</h3>
      <p style="color: var(--text-secondary); max-width: 540px; font-size: 0.9rem; line-height: 1.5;">${this.message}</p>
      ${retryHtml}
    `;

    if (this.onRetry) {
      const btn = card.querySelector('#btn-error-retry');
      if (btn) btn.addEventListener('click', this.onRetry);
    }

    return card;
  }
}
