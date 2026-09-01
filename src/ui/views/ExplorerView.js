import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Explorer View
 * Interactive file tree navigation and code symbol inspection
 */
export class ExplorerView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Explorer',
      description: 'Interactive file tree navigation and code symbol inspection.',
      badge: 'AST Index'
    });

    const empty = new EmptyState({
      icon: '📁',
      title: 'File Tree & AST Symbol Explorer',
      description: 'Browse directories, files, functions, and classes across the repository once connected.',
      badge: 'Pending Repository Connection'
    });

    container.appendChild(header.render());
    container.appendChild(empty.render());

    return container;
  }
}
