import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Architecture View
 * Visual dependency diagrams and module relationship graphs
 */
export class ArchitectureView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Architecture',
      description: 'Visual dependency diagrams and module relationship graphs.',
      badge: 'Mermaid.js'
    });

    const empty = new EmptyState({
      icon: '🏛️',
      title: 'Architecture & Module Flowcharts',
      description: 'Interactive Mermaid diagrams and dependency topology will render here once a repository is active.',
      badge: 'Pending Repository Connection'
    });

    container.appendChild(header.render());
    container.appendChild(empty.render());

    return container;
  }
}
