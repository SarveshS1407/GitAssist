/**
 * PageHeader Component
 * Renders consistent titles, descriptions, and optional action buttons/badges
 */
export class PageHeader {
  constructor({ title, description, badge, actions = [] } = {}) {
    this.title = title;
    this.description = description;
    this.badge = badge;
    this.actions = actions; // Array of { label, icon, onClick, variant: 'primary' | 'secondary' }
  }

  render() {
    const headerEl = document.createElement('div');
    headerEl.className = 'view-header';

    const topRow = document.createElement('div');
    topRow.className = 'view-header-top';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'view-title-group';

    const titleEl = document.createElement('h1');
    titleEl.className = 'view-title';
    titleEl.textContent = this.title;
    titleGroup.appendChild(titleEl);

    if (this.badge) {
      const badgeEl = document.createElement('span');
      badgeEl.className = 'header-badge';
      badgeEl.textContent = this.badge;
      titleGroup.appendChild(badgeEl);
    }

    topRow.appendChild(titleGroup);

    if (this.actions && this.actions.length > 0) {
      const actionsContainer = document.createElement('div');
      actionsContainer.className = 'view-actions';

      for (const action of this.actions) {
        const btn = document.createElement('button');
        btn.className = action.variant === 'primary' ? 'btn-primary' : 'btn-secondary';
        btn.innerHTML = `${action.icon ? `<span>${action.icon}</span>` : ''}<span>${action.label}</span>`;
        if (action.onClick) btn.addEventListener('click', action.onClick);
        actionsContainer.appendChild(btn);
      }
      topRow.appendChild(actionsContainer);
    }

    headerEl.appendChild(topRow);

    if (this.description) {
      const descEl = document.createElement('p');
      descEl.className = 'view-description';
      descEl.textContent = this.description;
      headerEl.appendChild(descEl);
    }

    return headerEl;
  }
}
