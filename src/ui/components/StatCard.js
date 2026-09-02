/**
 * StatCard Component
 * High-Impact Futuristic Cyber Metric Card with Gradient Typography & Colored Lighting
 */
export class StatCard {
  constructor({ label, value, subtext, icon, trend, variant = null } = {}) {
    this.label = label;
    this.value = value;
    this.subtext = subtext;
    this.icon = icon;
    this.trend = trend;
    this.variant = variant;
  }

  render() {
    const card = document.createElement('div');
    card.className = this.variant ? `stat-card stat-card-${this.variant}` : 'stat-card';

    const valueClass = this.variant ? `stat-card-value text-gradient-${this.variant}` : 'stat-card-value';
    const iconClass = this.variant ? `stat-card-icon stat-icon-${this.variant}` : 'stat-card-icon';
    const trendClass = this.variant ? `stat-card-trend stat-trend-${this.variant}` : 'stat-card-trend';

    card.innerHTML = `
      <div class="stat-card-header">
        <span class="stat-card-label">${this.label}</span>
        ${this.icon ? `<span class="${iconClass}">${this.icon}</span>` : ''}
      </div>
      <div class="${valueClass}">${this.value}</div>
      ${this.subtext ? `<div class="stat-card-subtext">${this.subtext}</div>` : ''}
      ${this.trend ? `<div class="${trendClass}">${this.trend}</div>` : ''}
    `;

    return card;
  }
}
