/**
 * EmptyState Component
 * Standard empty state card for views when data is absent or feature is not yet loaded
 */
export class EmptyState {
  constructor({ icon = '📭', title, description, badge = 'Pending Repository Connection', actionText, onAction }) {
    this.icon = icon;
    this.title = title;
    this.description = description;
    this.badge = badge;
    this.actionText = actionText;
    this.onAction = onAction;
  }

  render() {
    const card = document.createElement('div');
    card.className = 'placeholder-card';

    let actionBtnHtml = '';
    if (this.actionText && this.onAction) {
      actionBtnHtml = `
        <button class="btn-primary" id="empty-state-action" style="margin-top: 10px;">
          <span>${this.actionText}</span>
        </button>
      `;
    }

    card.innerHTML = `
      <div class="empty-state-icon" style="font-size: 2.4rem; margin-bottom: 4px;">${this.icon}</div>
      <h3 style="color: var(--text-primary); font-size: 1.15rem; font-weight: 600;">${this.title}</h3>
      <p style="color: var(--text-secondary); max-width: 500px; font-size: 0.9rem; line-height: 1.5;">${this.description}</p>
      ${this.badge ? `<span class="landing-card-badge" style="color: var(--accent-primary); border: 1px solid var(--border-default); margin-top: 6px;">${this.badge}</span>` : ''}
      ${actionBtnHtml}
    `;

    if (this.actionText && this.onAction) {
      const btn = card.querySelector('#empty-state-action');
      if (btn) btn.addEventListener('click', this.onAction);
    }

    return card;
  }
}
