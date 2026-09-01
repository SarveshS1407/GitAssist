import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * AI View
 * Local natural language querying and architecture context packaging
 */
export class AiView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'AI Assistant',
      description: 'Local natural language querying and architecture context packaging.',
      badge: 'Local Heuristics'
    });

    const empty = new EmptyState({
      icon: '🤖',
      title: 'Local AI & Context Packager',
      description: 'Query your repository offline or package targeted context blast radii for LLMs once a repository is active.',
      badge: 'Pending Repository Connection'
    });

    container.appendChild(header.render());
    container.appendChild(empty.render());

    return container;
  }
}
