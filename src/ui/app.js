import { AppShell } from './components/AppShell.js';
import { Router } from './router.js';
import { OverviewView } from './views/OverviewView.js';
import { ExplorerView } from './views/ExplorerView.js';
import { ArchitectureView } from './views/ArchitectureView.js';
import { GitView } from './views/GitView.js';
import { SearchView } from './views/SearchView.js';
import { ContributorsView } from './views/ContributorsView.js';
import { AnalysisView } from './views/AnalysisView.js';
import { AiView } from './views/AiView.js';

/**
 * Application Entry Point
 * Coordinates routing, active repository state, and view rendering
 */
class App {
  constructor() {
    this.repositoryState = {
      isLoaded: false,
      repositoryPath: null,
      repositoryName: null,
      isIndexing: false,
      error: null
    };

    this.routes = {
      overview: OverviewView,
      explorer: ExplorerView,
      architecture: ArchitectureView,
      git: GitView,
      search: SearchView,
      contributors: ContributorsView,
      analysis: AnalysisView,
      ai: AiView
    };

    const initialRoute = window.location.hash.replace('#', '') || 'overview';
    this.router = new Router(this.routes, initialRoute);
    this.shell = new AppShell({ router: this.router, initialPage: initialRoute });
  }

  init() {
    const root = document.getElementById('app');
    if (!root) {
      console.error('Root #app container not found.');
      return;
    }

    // Render Shell into DOM
    root.appendChild(this.shell.render());

    // Listen for route changes
    this.router.onRouteChange((routeId) => {
      this.renderView(routeId);
      this.shell.setActivePage(routeId);
    });

    // Render Initial View
    this.renderView(this.router.getCurrentRoute());
  }

  renderView(routeId) {
    const ViewClass = this.routes[routeId] || OverviewView;
    const viewInstance = new ViewClass({
      repositoryState: this.repositoryState,
      onOpenRepository: () => {
        const path = prompt('Enter absolute path to local repository:');
        if (path) {
          alert(`Selected path: ${path}\n(Repository validation and loading will connect in Step 5)`);
        }
      }
    });

    this.shell.setContent(viewInstance.render());
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
