import { AppShell } from './components/AppShell.js';
import { Router } from './router.js';
import { RepositoryState } from './state/repository-state.js';
import { Dialog } from './components/Dialog.js';
import { OverviewView } from './views/OverviewView.js';
import { ExplorerView } from './views/ExplorerView.js';
import { ArchitectureView } from './views/ArchitectureView.js';
import { ImpactView } from './views/ImpactView.js';
import { GitView } from './views/GitView.js';
import { SearchView } from './views/SearchView.js';
import { ContributorsView } from './views/ContributorsView.js';
import { AnalysisView } from './views/AnalysisView.js';
import { ArchaeologyView } from './views/ArchaeologyView.js';
import { RiskView } from './views/RiskView.js';
import { FeatureMapView } from './views/FeatureMapView.js';
import { TestIntelligenceView } from './views/TestIntelligenceView.js';
import { BugArchaeologyView } from './views/BugArchaeologyView.js';
import { DeadCodeView } from './views/DeadCodeView.js';
import { ManifestView } from './views/ManifestView.js';
import { DocumentationView } from './views/DocumentationView.js';
import { ReviewView } from './views/ReviewView.js';
import { AiView } from './views/AiView.js';
import { DuplicationView } from './views/DuplicationView.js';
import { SecurityView } from './views/SecurityView.js';

/**
 * Application Entry Point
 * Coordinates routing, active repository state, backend API integration, and view rendering
 */
class App {
  constructor() {
    this.repositoryState = new RepositoryState();

    this.routes = {
      overview: OverviewView,
      explorer: ExplorerView,
      architecture: ArchitectureView,
      impact: ImpactView,
      git: GitView,
      search: SearchView,
      contributors: ContributorsView,
      analysis: AnalysisView,
      archaeology: ArchaeologyView,
      risk: RiskView,
      features: FeatureMapView,
      tests: TestIntelligenceView,
      bugs: BugArchaeologyView,
      deadcode: DeadCodeView,
      manifests: ManifestView,
      documentation: DocumentationView,
      review: ReviewView,
      ai: AiView,
      duplication: DuplicationView,
      security: SecurityView
    };

    const initialRoute = window.location.hash.replace('#', '') || 'overview';
    this.router = new Router(this.routes, initialRoute);
    this.shell = new AppShell({
      router: this.router,
      repositoryState: this.repositoryState,
      initialPage: initialRoute
    });
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

    // Listen for repository state changes and re-render current view
    this.repositoryState.subscribe(() => {
      this.renderView(this.router.getCurrentRoute());
    });

    // Register global archaeological keyboard navigation shortcuts
    this.setupKeyboardShortcuts();

    // Render Initial View
    this.renderView(this.router.getCurrentRoute());
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // ⌘K or Ctrl+K triggers Forensic Code Search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.router.navigate('search');
        return;
      }

      // Ignore digit hotkeys if currently typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return;
      }

      // 1-6 Tactical Lens Switching
      const lensMap = {
        '1': 'overview',
        '2': 'explorer',
        '3': 'architecture',
        '4': 'git',
        '5': 'search',
        '6': 'ai'
      };

      if (lensMap[e.key]) {
        this.router.navigate(lensMap[e.key]);
      }
    });
  }

  async openRepository(selectedPath) {
    if (!selectedPath) return;

    // Transition immediately into Excavation Mode
    this.repositoryState.setIndexing(true, 15, 'DISCOVERING REPOSITORY', selectedPath);
    this.router.navigate('overview');

    // Create non-blocking stage updates while backend request is in-flight
    const timer1 = setTimeout(() => {
      if (this.repositoryState.getState().isIndexing) {
        this.repositoryState.setIndexing(true, 45, 'SCANNING STRUCTURE & DIRECTORIES', selectedPath);
      }
    }, 180);

    const timer2 = setTimeout(() => {
      if (this.repositoryState.getState().isIndexing) {
        this.repositoryState.setIndexing(true, 75, 'MAPPING ARTIFACTS & EXTENSIONS', selectedPath);
      }
    }, 380);

    try {
      const res = await fetch('/api/repository/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: selectedPath })
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to open repository');
      }

      // Visual Unlock transition
      this.repositoryState.setIndexing(true, 100, 'EXCAVATION COMPLETE // UNLOCKING ARTIFACT', selectedPath);

      // Brief 400ms reveal so user sees the holographic artifact unlock before workspace opens
      await new Promise(r => setTimeout(r, 400));

      this.repositoryState.setRepository({
        path: data.summary.path,
        name: data.summary.name,
        branch: data.summary.branch || 'main',
        summary: data.summary
      });
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      console.error('[Open Repository Error]', err);
      this.repositoryState.setError(err.message, selectedPath);
    }
  }

  promptOpenRepository() {
    const content = document.createElement('div');
    content.innerHTML = `
      <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">
        Local Filesystem Path:
      </label>
      <input type="text" id="repo-path-input" 
        placeholder="/Users/username/projects/my-repo" 
        value="/Users/kingpin/Desktop/gitassist"
        style="width: 100%; padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-default); border-radius: 6px; color: var(--text-primary); font-family: var(--font-mono); font-size: 0.85rem;" />
      
      <div style="margin-top: 10px; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 0.75rem; color: var(--text-muted);">Quick preset:</span>
        <button type="button" id="btn-preset-current" class="btn-secondary" style="padding: 3px 8px; font-size: 0.75rem;">
          ⚡ Current GitAssist Repo
        </button>
      </div>

      <p style="margin-top: 12px; font-size: 0.78rem; color: var(--text-muted); line-height: 1.4;">
        💡 <strong>Local-first tool:</strong> Enter the absolute directory path to any folder on your machine (e.g. <code>/Users/kingpin/Desktop/gitassist</code>).
      </p>
    `;

    content.querySelector('#btn-preset-current').addEventListener('click', () => {
      const input = content.querySelector('#repo-path-input');
      if (input) input.value = '/Users/kingpin/Desktop/gitassist';
    });

    const dialog = new Dialog({
      title: 'Open Local Repository',
      content,
      confirmText: 'Open & Analyze',
      cancelText: 'Cancel',
      onConfirm: async (overlay) => {
        const input = overlay.querySelector('#repo-path-input');
        const selectedPath = input ? input.value.trim() : '';
        if (selectedPath) {
          await this.openRepository(selectedPath);
        }
      }
    });

    dialog.open();
  }

  renderView(routeId) {
    const ViewClass = this.routes[routeId] || OverviewView;
    const viewInstance = new ViewClass({
      repositoryState: this.repositoryState.getState(),
      onOpenRepository: () => this.promptOpenRepository(),
      onQuickAnalyze: (path) => this.openRepository(path),
      onReset: () => this.repositoryState.reset(),
      onClearError: () => {
        this.repositoryState.state.error = null;
        this.repositoryState.state.isIndexing = false;
        this.repositoryState.notify();
      }
    });

    this.shell.setContent(viewInstance.render());
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  window.app = app;
  app.init();
});
