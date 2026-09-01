/**
 * StatCard Component
 * Reusable metric card displaying key indicators (LOC, files, complexity, commits)
 */
export class StatCard {
  constructor({ label, value, subtext, icon, trend }) {
    this.label = label;
    this.value = value;
    this.subtext = subtext;
    this.icon = icon;
    this.trend = trend;
  }

  render() {
    const card = document.createElement('div');
    card.className = 'stat-card';

    card.innerHTML = `
      <div class="stat-card-header">
        <span class="stat-card-label">${this.label}</span>
        ${this.icon ? `<span class="stat-card-icon">${this.icon}</span>` : ''}
      </div>
      <div class="stat-card-value">${this.value}</div>
      ${this.subtext ? `<div class="stat-card-subtext">${this.subtext}</div>` : ''}
      ${this.trend ? `<div class="stat-card-trend">${this.trend}</div>` : ''}
    `;

    return card;
  }
}
