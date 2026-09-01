import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Git Archaeology View
 * Historical commit timelines, branch topologies, and file churn
 */
export class GitView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Git Archaeology',
      description: 'Historical commit timelines, branch topologies, and file churn.',
      badge: 'Read-Only Git'
    });

    const empty = new EmptyState({
      icon: '📜',
      title: 'Commit Timeline & Archaeological Log',
      description: 'Inspect commit lineages, author chronologies, and historical diff metrics once a repository is active.',
      badge: 'Pending Repository Connection'
    });

    container.appendChild(header.render());
    container.appendChild(empty.render());

    return container;
  }
}
