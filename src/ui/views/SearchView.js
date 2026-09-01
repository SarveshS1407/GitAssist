import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Search View
 * Instant full-text indexing for symbols, definitions, and files
 */
export class SearchView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Search Index',
      description: 'Instant full-text indexing for symbols, definitions, and files.',
      badge: 'Fast In-Memory'
    });

    const empty = new EmptyState({
      icon: '🔍',
      title: 'Repository Search Index',
      description: 'Search across functions, classes, interfaces, and file names once a repository is active.',
      badge: 'Pending Repository Connection'
    });

    container.appendChild(header.render());
    container.appendChild(empty.render());

    return container;
  }
}
