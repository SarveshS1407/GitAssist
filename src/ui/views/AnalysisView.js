import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Analysis View
 * Cyclomatic complexity, maintainability index, and hotspot risk analysis
 */
export class AnalysisView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Codebase Analysis',
      description: 'Cyclomatic complexity, maintainability index, and hotspot risk analysis.',
      badge: 'Code Quality'
    });

    const empty = new EmptyState({
      icon: '⚡',
      title: 'Architectural Metrics & Risk Hotspots',
      description: 'Inspect cyclomatic complexity, circular dependencies, and high-churn risk hotspots once a repository is active.',
      badge: 'Pending Repository Connection'
    });

    container.appendChild(header.render());
    container.appendChild(empty.render());

    return container;
  }
}
