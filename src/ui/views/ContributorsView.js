import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Contributors View
 * Codebase ownership distribution and author analytics
 */
export class ContributorsView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Contributors',
      description: 'Codebase ownership distribution and author analytics.',
      badge: 'Authorship'
    });

    const empty = new EmptyState({
      icon: '👥',
      title: 'Contributor Leaderboard & Ownership',
      description: 'Identify primary authors, code churn by contributor, and maintainer distribution once a repository is loaded.',
      badge: 'Pending Repository Connection'
    });

    container.appendChild(header.render());
    container.appendChild(empty.render());

    return container;
  }
}
