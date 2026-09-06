/**
 * Sidebar Navigation Component
 * High-precision, organized forensic navigation deck with collapsible sectors,
 * vector SVG emblems, real-time lens filtering, and sector tracking.
 */
export class Sidebar {
  constructor({ activePage = 'overview', onNavigate, onPinToggle }) {
    this.activePage = activePage;
    this.onNavigate = onNavigate;
    this.onPinToggle = onPinToggle;
    this.isPinned = false;
    this.element = null;
    this.filterQuery = '';

    // Collapsed state tracking (collapse secondary sections by default for a clean, scannable layout)
    this.collapsedSections = new Set(['quality', 'intelligence']);

    this.sections = [
      {
        id: 'core',
        title: 'Core Deck',
        sector: 'SEC 01',
        items: [
          { id: 'overview', label: 'Forensic Matrix', badge: '#00', accent: '#00f0ff' },
          { id: 'explorer', label: 'Source Explorer', badge: '#03', accent: '#38bdf8' },
          { id: 'search', label: 'Code Search', badge: '#04', accent: '#818cf8' }
        ]
      },
      {
        id: 'architecture',
        title: 'Architecture & Graph',
        sector: 'SEC 02',
        items: [
          { id: 'architecture', label: 'Architecture Topology', badge: '#01', accent: '#00f0ff' },
          { id: 'impact', label: 'Blast Radius & Impact', badge: '#02', accent: '#f43f5e' },
          { id: 'features', label: 'Feature Mapping', badge: '#09', accent: '#c084fc' },
          { id: 'endpoints', label: 'API Endpoints', badge: '#21', accent: '#34d399' }
        ]
      },
      {
        id: 'lineage',
        title: 'Forensic Lineage',
        sector: 'SEC 03',
        items: [
          { id: 'git', label: 'Git Chrono-Strata', badge: '#05', accent: '#2dd4bf' },
          { id: 'analysis', label: 'Drift & Hotspots', badge: '#06', accent: '#fbbf24' },
          { id: 'archaeology', label: 'Evolutionary Synthesis', badge: '#07', accent: '#a855f7' },
          { id: 'bugs', label: 'Bug Archaeology', badge: '#11', accent: '#f87171' }
        ]
      },
      {
        id: 'quality',
        title: 'Health & Quality Audit',
        sector: 'SEC 04',
        items: [
          { id: 'risk', label: 'Risk Map', badge: '#08', accent: '#ef4444' },
          { id: 'tests', label: 'Test Intelligence', badge: '#10', accent: '#22d3ee' },
          { id: 'deadcode', label: 'Dead Code Signals', badge: '#12', accent: '#94a3b8' },
          { id: 'manifests', label: 'Dependency Health', badge: '#13', accent: '#38bdf8' },
          { id: 'duplication', label: 'Code Duplication', badge: '#17', accent: '#a78bfa' },
          { id: 'security', label: 'Security Audit', badge: '#18', accent: '#10b981' },
          { id: 'techdebt', label: 'Technical Debt', badge: '#20', accent: '#e879f9' },
          { id: 'review', label: 'Heuristic Review', badge: '#14', accent: '#f59e0b' }
        ]
      },
      {
        id: 'intelligence',
        title: 'Intelligence & Teams',
        sector: 'SEC 05',
        items: [
          { id: 'documentation', label: 'Subsystem Docs', badge: '#15', accent: '#60a5fa' },
          { id: 'contributors', label: 'Contributors', badge: '#05b', accent: '#f472b6' },
          { id: 'busfactor', label: 'Bus Factor & Silos', badge: '#19', accent: '#fb923c' },
          { id: 'ai', label: 'Codebase Q&A', badge: '#16', accent: '#00f0ff' }
        ]
      }
    ];

    // Ensure section containing activePage is always expanded
    this.ensureActiveSectionExpanded(this.activePage);
  }

  ensureActiveSectionExpanded(pageId) {
    for (const sec of this.sections) {
      if (sec.items.some(item => item.id === pageId)) {
        this.collapsedSections.delete(sec.id);
        break;
      }
    }
  }

  getNavSvg(id, size = 15) {
    const s = size;
    const icons = {
      overview: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="2" x2="12" y2="22"/></svg>`,
      explorer: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"/><polyline points="9 13 12 16 16 12"/></svg>`,
      search: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/><path d="M11 8v6m-3-3h6" stroke-width="1.8"/></svg>`,
      architecture: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="4" r="2.5"/><circle cx="4" cy="20" r="2.5"/><circle cx="20" cy="20" r="2.5"/><line x1="12" y1="6.5" x2="4" y2="17.5"/><line x1="12" y1="6.5" x2="20" y2="17.5"/><line x1="6.5" y1="20" x2="17.5" y2="20"/></svg>`,
      impact: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="2.5" fill="currentColor"/><circle cx="12" cy="12" r="6" stroke-dasharray="2 2"/><circle cx="12" cy="12" r="9.5"/><path d="M12 1.5v2m0 17v2M1.5 12h2m17 0h2"/></svg>`,
      features: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
      endpoints: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8"/><path d="M11.5 3a17 17 0 0 0 0 18m1-18a17 17 0 0 1 0 18"/></svg>`,
      git: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="6" cy="5" r="2.5"/><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="9" r="2.5"/><path d="M6 7.5v9m0-4.5a8 8 0 0 0 8-4"/></svg>`,
      analysis: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
      archaeology: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 21h18M3 7h18M6 7v14M18 7v14M12 3L2 7h20L12 3zM12 11v6"/></svg>`,
      bugs: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="7" y="8" width="10" height="11" rx="4"/><path d="M12 8V4m-5 9H3m18 0h-4M6 9l-3-2m18 0l-3 2m0 7l3 2m-18 0l3-2"/></svg>`,
      risk: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>`,
      tests: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 2v6.5a4 4 0 0 1-1.2 2.8L4 16.5A3 3 0 0 0 6.2 21h11.6a3 3 0 0 0 2.2-4.5l-3.8-5.2a4 4 0 0 1-1.2-2.8V2"/><line x1="7" y1="2" x2="17" y2="2"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>`,
      deadcode: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><line x1="6" y1="8.5" x2="6" y2="21"/><line x1="8" y1="14" x2="16" y2="16" stroke-dasharray="2 2"/><line x1="18" y1="8" x2="18" y2="15.5"/><line x1="14" y1="3" x2="20" y2="9"/><line x1="20" y1="3" x2="14" y2="9"/></svg>`,
      manifests: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
      duplication: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/><line x1="11" y1="12" x2="17" y2="12"/><line x1="11" y1="15" x2="15" y2="15"/></svg>`,
      security: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>`,
      techdebt: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/><path d="M12 1.5v2m0 17v2M1.5 12h2m17 0h2" stroke-dasharray="1 3"/></svg>`,
      review: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
      documentation: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
      contributors: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="3.5"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      busfactor: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="3" width="16" height="16" rx="3"/><circle cx="8" cy="15" r="1.5" fill="currentColor"/><circle cx="16" cy="15" r="1.5" fill="currentColor"/><line x1="4" y1="11" x2="20" y2="11"/><line x1="6" y1="19" x2="6" y2="21"/><line x1="18" y1="19" x2="18" y2="21"/></svg>`,
      ai: `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/><path d="M8 15h8m-4-11V2m-5 20v-2m10 2v-2M2 9h2m-2 6h2m16-6h2m-2 6h2"/></svg>`
    };
    return icons[id] || `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>`;
  }

  setActive(pageId) {
    this.activePage = pageId;
    this.ensureActiveSectionExpanded(pageId);

    if (!this.element) return;

    // Update section expanded state in DOM
    this.sections.forEach(sec => {
      const secEl = this.element.querySelector(`[data-section-id="${sec.id}"]`);
      if (secEl) {
        const isCollapsed = this.collapsedSections.has(sec.id);
        secEl.classList.toggle('is-collapsed', isCollapsed);
      }
    });

    const items = this.element.querySelectorAll('.nav-item');
    items.forEach(el => {
      if (el.dataset.page === pageId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  render() {
    const sidebar = document.createElement('aside');
    sidebar.className = `app-sidebar ${this.isPinned ? 'is-pinned' : ''}`;
    sidebar.id = 'app-sidebar-drawer';

    const sectionsHtml = this.sections.map(sec => {
      const isCollapsed = this.collapsedSections.has(sec.id);
      return `
        <div class="sidebar-section ${isCollapsed ? 'is-collapsed' : ''}" data-section-id="${sec.id}">
          <button type="button" class="sidebar-section-header" data-toggle-sec="${sec.id}" title="Click to expand/collapse ${sec.title}">
            <div class="section-header-left">
              <span class="section-chevron">▾</span>
              <span class="section-sector-pill">${sec.sector}</span>
              <span class="sidebar-section-title">${sec.title}</span>
            </div>
            <span class="section-item-count">${sec.items.length}</span>
          </button>

          <div class="sidebar-nav-collapsible">
            <ul class="sidebar-nav-list">
              ${sec.items.map(item => `
                <li class="sidebar-nav-entry" data-page-id="${item.id}" data-search-tokens="${item.label.toLowerCase()} ${item.id} ${item.badge.toLowerCase()}">
                  <a class="nav-item ${item.id === this.activePage ? 'active' : ''}" data-page="${item.id}" style="--item-accent: ${item.accent};">
                    <span class="nav-icon-badge" style="color: ${item.accent};">
                      ${this.getNavSvg(item.id, 15)}
                    </span>
                    <span class="nav-label">${item.label}</span>
                    <span class="nav-badge-pill">${item.badge}</span>
                    <span class="nav-active-pip"></span>
                  </a>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;
    }).join('');

    sidebar.innerHTML = `
      <div class="sidebar-header-bar">
        <div class="sidebar-brand-mini">
          <span class="brand-glyph-radar">◈</span>
          <div>
            <div class="brand-text">FORENSIC COMMAND</div>
            <div class="brand-subtext">21 TACTICAL LENSES</div>
          </div>
        </div>
        <div class="sidebar-header-actions">
          <button type="button" class="btn-sidebar-tool" id="btn-sidebar-collapse-all" title="Toggle Expand/Collapse All Sectors">
            ⇕
          </button>
          <button type="button" class="btn-sidebar-pin ${this.isPinned ? 'active' : ''}" id="btn-sidebar-pin" title="${this.isPinned ? 'Unpin (Auto-collapse on exit)' : 'Pin Sidebar (Keep expanded)'}">
            ${this.isPinned ? '📌' : '📍'}
          </button>
        </div>
      </div>

      <!-- Quick Filter Bar -->
      <div class="sidebar-filter-deck">
        <div class="sidebar-filter-input-wrap">
          <span class="sidebar-filter-lens-icon">🔍</span>
          <input type="text" class="sidebar-filter-input" id="sidebar-filter-input" placeholder="Quick filter lenses..." spellcheck="false" autocomplete="off" />
          <button type="button" class="sidebar-filter-clear-btn" id="sidebar-filter-clear" title="Clear filter">✕</button>
        </div>
      </div>

      <div class="sidebar-nav-container" id="sidebar-nav-scrollable">
        ${sectionsHtml}
        <div class="sidebar-no-results" id="sidebar-no-matches" style="display: none;">
          <span>◈</span>
          <p>No matching lenses found</p>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="system-status-indicator">
          <span class="status-dot-pulse"></span>
          <span>AIR-GAPPED // ONLINE</span>
        </div>
        <span class="sidebar-version-pill">v0.1.0</span>
      </div>
    `;

    // 1. Accordion Toggle Handlers
    sidebar.querySelectorAll('[data-toggle-sec]').forEach(headerBtn => {
      headerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const secId = headerBtn.dataset.toggleSec;
        const secEl = sidebar.querySelector(`[data-section-id="${secId}"]`);
        if (!secEl) return;

        if (this.collapsedSections.has(secId)) {
          this.collapsedSections.delete(secId);
          secEl.classList.remove('is-collapsed');
        } else {
          this.collapsedSections.add(secId);
          secEl.classList.add('is-collapsed');
        }
      });
    });

    // 2. Expand / Collapse All Toggle
    const toggleAllBtn = sidebar.querySelector('#btn-sidebar-collapse-all');
    toggleAllBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const allCollapsed = this.collapsedSections.size === this.sections.length;
      if (allCollapsed) {
        // Expand all
        this.collapsedSections.clear();
        sidebar.querySelectorAll('.sidebar-section').forEach(el => el.classList.remove('is-collapsed'));
      } else {
        // Collapse all
        this.sections.forEach(sec => this.collapsedSections.add(sec.id));
        sidebar.querySelectorAll('.sidebar-section').forEach(el => el.classList.add('is-collapsed'));
      }
    });

    // 3. Quick Filter Logic
    const filterInput = sidebar.querySelector('#sidebar-filter-input');
    const clearBtn = sidebar.querySelector('#sidebar-filter-clear');
    const noMatchesEl = sidebar.querySelector('#sidebar-no-matches');

    const applyFilter = (q) => {
      this.filterQuery = (q || '').trim().toLowerCase();
      clearBtn.style.display = this.filterQuery ? 'flex' : 'none';

      let totalVisible = 0;

      this.sections.forEach(sec => {
        const secEl = sidebar.querySelector(`[data-section-id="${sec.id}"]`);
        if (!secEl) return;

        let visibleInSection = 0;
        const entries = secEl.querySelectorAll('.sidebar-nav-entry');

        entries.forEach(entry => {
          const tokens = entry.dataset.searchTokens || '';
          const match = !this.filterQuery || tokens.includes(this.filterQuery);
          entry.style.display = match ? '' : 'none';
          if (match) {
            visibleInSection++;
            totalVisible++;
          }
        });

        // If filter is active and section has matches, ensure it is expanded
        if (this.filterQuery && visibleInSection > 0) {
          secEl.classList.remove('is-collapsed');
          secEl.style.display = '';
        } else if (this.filterQuery && visibleInSection === 0) {
          secEl.style.display = 'none';
        } else {
          secEl.style.display = '';
          const wasCollapsed = this.collapsedSections.has(sec.id);
          secEl.classList.toggle('is-collapsed', wasCollapsed);
        }
      });

      if (noMatchesEl) {
        noMatchesEl.style.display = (this.filterQuery && totalVisible === 0) ? 'flex' : 'none';
      }
    };

    filterInput?.addEventListener('input', (e) => applyFilter(e.target.value));
    clearBtn?.addEventListener('click', () => {
      if (filterInput) filterInput.value = '';
      applyFilter('');
      filterInput?.focus();
    });

    filterInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        filterInput.value = '';
        applyFilter('');
        filterInput.blur();
      }
    });

    // 4. Pin Toggle Handler
    const pinBtn = sidebar.querySelector('#btn-sidebar-pin');
    pinBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.isPinned = !this.isPinned;
      sidebar.classList.toggle('is-pinned', this.isPinned);
      pinBtn.classList.toggle('active', this.isPinned);
      pinBtn.innerHTML = this.isPinned ? '📌' : '📍';
      pinBtn.title = this.isPinned ? 'Unpin (Auto-collapse on exit)' : 'Pin Sidebar (Keep expanded)';
      if (this.onPinToggle) this.onPinToggle(this.isPinned);
    });

    // 5. Nav Item Selection
    sidebar.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = item.dataset.page;
        this.setActive(pageId);
        if (this.onNavigate) this.onNavigate(pageId);
      });
    });

    this.element = sidebar;
    return sidebar;
  }
}
