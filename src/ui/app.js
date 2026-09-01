import { AppShell } from './components/AppShell.js';
import { Router } from './router.js';
import { Dialog } from './components/Dialog.js';
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

  promptOpenRepository() {
    const content = document.createElement('div');
    content.innerHTML = `
      <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">
        Local Repository Path:
      </label>
      <input type="text" id="repo-path-input" 
        placeholder="/Users/username/projects/my-repo" 
        value="/Users/kingpin/Desktop/gitassist"
        style="width: 100%; padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-default); border-radius: 6px; color: var(--text-primary); font-family: var(--font-mono); font-size: 0.85rem;" />
      <p style="margin-top: 8px; font-size: 0.78rem; color: var(--text-muted);">
        Enter the absolute filesystem path to any Git repository or code directory.
      </p>
    `;

    const dialog = new Dialog({
      title: 'Open Local Repository',
      content,
      confirmText: 'Open',
      cancelText: 'Cancel',
      onConfirm: (overlay) => {
        const input = overlay.querySelector('#repo-path-input');
        const selectedPath = input ? input.value.trim() : '';
        if (selectedPath) {
          alert(`Selected repository path:\n${selectedPath}\n\n(Backend validation will connect in Backend Step 5)`);
        }
      }
    });

    dialog.open();
  }

  renderView(routeId) {
    const ViewClass = this.routes[routeId] || OverviewView;
    const viewInstance = new ViewClass({
      repositoryState: this.repositoryState,
      onOpenRepository: () => this.promptOpenRepository()
    });

    this.shell.setContent(viewInstance.render());
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
