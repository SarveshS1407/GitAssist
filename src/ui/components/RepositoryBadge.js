/**
 * RepositoryBadge Component
 * Shows active repository path, branch name, and status in the header or views
 */
export class RepositoryBadge {
  constructor({ name, branch = 'main', isGit = true }) {
    this.name = name;
    this.branch = branch;
    this.isGit = isGit;
  }

  render() {
    const badge = document.createElement('div');
    badge.className = 'repo-badge';

    if (!this.name) {
      badge.innerHTML = `
        <span class="repo-badge-dot inactive"></span>
        <span class="repo-badge-text">No Repository Loaded</span>
      `;
      return badge;
    }

    badge.innerHTML = `
      <span class="repo-badge-dot active"></span>
      <span class="repo-badge-name">📁 ${this.name}</span>
      ${this.isGit ? `<span class="repo-badge-branch">🌿 ${this.branch}</span>` : ''}
    `;

    return badge;
  }
}
