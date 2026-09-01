import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';

/**
 * AppShell Component
 * Assembles Header, Sidebar, and the dynamic Main Content container
 */
export class AppShell {
  constructor({ router, repositoryState, initialPage = 'overview' }) {
    this.router = router;
    this.repositoryState = repositoryState;
    this.currentPage = initialPage;
    this.element = null;
    this.mainContentEl = null;

    this.header = new Header({
      repositoryState: this.repositoryState,
      onSearchClick: () => this.router.navigate('search'),
      onSettingsClick: () => alert('Settings panel will be implemented in future step.'),
      onBrandClick: () => this.router.navigate('overview')
    });

    this.sidebar = new Sidebar({
      activePage: initialPage,
      onNavigate: (pageId) => this.router.navigate(pageId)
    });
  }

  render() {
    const container = document.createElement('div');
    container.className = 'app-shell';

    // 1. Header
    container.appendChild(this.header.render());

    // 2. Body Container (Sidebar + Main)
    const body = document.createElement('div');
    body.className = 'app-body';

    body.appendChild(this.sidebar.render());

    const main = document.createElement('main');
    main.className = 'app-main';
    main.id = 'main-workspace';
    body.appendChild(main);

    container.appendChild(body);

    this.element = container;
    this.mainContentEl = main;

    return container;
  }

  /**
   * Sets content of the main workspace
   * @param {HTMLElement|string} content
   */
  setContent(content) {
    if (!this.mainContentEl) return;
    this.mainContentEl.innerHTML = '';
    if (typeof content === 'string') {
      this.mainContentEl.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.mainContentEl.appendChild(content);
    }
  }

  /**
   * Synchronizes active sidebar selection
   * @param {string} pageId
   */
  setActivePage(pageId) {
    this.currentPage = pageId;
    this.sidebar.setActive(pageId);
  }
}
