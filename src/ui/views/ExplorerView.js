import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Explorer View
 * Interactive file tree navigation, live search filter, and in-browser source code viewer
 */
export class ExplorerView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
    this.selectedFile = null;
    this.searchQuery = '';
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Source Code Explorer',
      description: 'Browse repository file hierarchy, extracted AST symbols, and inspect in-browser source code.',
      badge: 'Code Viewer'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '📁',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository from the Central Telemetry overview to inspect its file hierarchy and AST symbols.'
      }).render());
      return container;
    }

    const splitLayout = document.createElement('div');
    splitLayout.style.display = 'grid';
    splitLayout.style.gridTemplateColumns = '340px 1fr';
    splitLayout.style.gap = '16px';

    // Left Pane: File Tree & Filter
    const leftPane = document.createElement('div');
    leftPane.className = 'landing-card';

    leftPane.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>📁</span>
          <span id="explorer-files-count">Loading files...</span>
        </h3>
      </div>

      <div style="margin-top: 8px;">
        <input type="text" id="file-search-filter" 
          placeholder="Filter files or symbols..." 
          style="width: 100%; padding: 6px 10px; background: var(--bg-input); border: 1px solid var(--border-holo); border-radius: 6px; color: var(--text-primary); font-family: var(--font-mono); font-size: 0.78rem;" />
      </div>

      <div id="file-list-pane" style="margin-top: 10px; display: flex; flex-direction: column; gap: 4px; max-height: 540px; overflow-y: auto;">
        <p style="color: var(--accent-cyan); font-size: 0.8rem; font-family: var(--font-mono);">Loading repository hierarchy...</p>
      </div>
    `;

    // Right Pane: Source Code Viewer
    const rightPane = document.createElement('div');
    rightPane.className = 'landing-card';
    rightPane.id = 'source-code-pane';

    const renderSourceViewer = async (filePath) => {
      this.selectedFile = filePath;
      rightPane.innerHTML = `
        <div class="landing-card-header">
          <h3 class="landing-card-title">
            <span>📄</span>
            <span>${filePath}</span>
          </h3>
          <span class="landing-card-badge">Source Viewer</span>
        </div>

        <div id="source-code-content" style="margin-top: 10px; background: var(--bg-input); border: 1px solid var(--border-strata); border-radius: 6px; padding: 14px; font-family: var(--font-mono); font-size: 0.78rem; max-height: 500px; overflow: auto;">
          <span style="color: var(--accent-cyan);">Loading source code for ${filePath}...</span>
        </div>
      `;

      try {
        const res = await fetch(`/api/file?path=${encodeURIComponent(filePath)}`);
        if (res.ok) {
          const fileData = await res.json();
          const lines = (fileData.content || '// Source file content empty or binary').split('\n');
          const codeHtml = lines.map((l, i) => `
            <div style="display: flex; gap: 12px; line-height: 1.5;">
              <span style="color: var(--text-muted); width: 32px; text-align: right; user-select: none; flex-shrink: 0;">${i + 1}</span>
              <span style="color: var(--text-primary); white-space: pre-wrap; word-break: break-all;">${escapeHtml(l)}</span>
            </div>
          `).join('');

          rightPane.querySelector('#source-code-content').innerHTML = codeHtml;
        } else {
          rightPane.querySelector('#source-code-content').innerHTML = `
            <div style="color: var(--text-muted);">
              File preview unavailable for ${filePath}
            </div>
          `;
        }
      } catch (err) {
        rightPane.querySelector('#source-code-content').innerHTML = `<span style="color: var(--danger);">Failed to load file: ${err.message}</span>`;
      }
    };

    const loadFiles = async () => {
      const listEl = leftPane.querySelector('#file-list-pane');
      const countEl = leftPane.querySelector('#explorer-files-count');

      try {
        const res = await fetch('/api/metrics');
        const data = await res.json();
        const files = data.files || [];

        countEl.textContent = `Files (${files.length})`;

        const renderFileList = (filter = '') => {
          const filtered = files.filter(f => f.relativePath.toLowerCase().includes(filter.toLowerCase()));
          if (filtered.length === 0) {
            listEl.innerHTML = '<p style="color: var(--text-muted); font-size: 0.8rem; padding: 10px;">No matching files found.</p>';
            return;
          }

          listEl.innerHTML = filtered.map(f => `
            <div class="file-tree-item ${f.relativePath === this.selectedFile ? 'active' : ''}" data-file="${f.relativePath}" style="padding: 8px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; background: ${f.relativePath === this.selectedFile ? 'var(--bg-blade-hover)' : 'transparent'}; border: 1px solid ${f.relativePath === this.selectedFile ? 'var(--accent-cyan)' : 'transparent'};">
              <span style="font-family: var(--font-mono); font-size: 0.78rem; color: ${f.relativePath === this.selectedFile ? 'var(--accent-cyan)' : 'var(--text-primary)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                📄 ${f.relativePath}
              </span>
              <span style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">${f.metrics?.loc || 0}L</span>
            </div>
          `).join('');

          listEl.querySelectorAll('.file-tree-item').forEach(item => {
            item.addEventListener('click', () => {
              listEl.querySelectorAll('.file-tree-item').forEach(i => {
                i.style.background = 'transparent';
                i.style.borderColor = 'transparent';
              });
              item.style.background = 'var(--bg-blade-hover)';
              item.style.borderColor = 'var(--accent-cyan)';
              renderSourceViewer(item.dataset.file);
            });
          });
        };

        leftPane.querySelector('#file-search-filter').addEventListener('input', (e) => {
          renderFileList(e.target.value.trim());
        });

        if (files.length > 0) {
          this.selectedFile = files[0].relativePath;
          renderFileList();
          renderSourceViewer(this.selectedFile);
        }
      } catch (err) {
        listEl.innerHTML = `<p style="color: var(--danger);">Failed to load files: ${err.message}</p>`;
      }
    };

    loadFiles();

    splitLayout.appendChild(leftPane);
    splitLayout.appendChild(rightPane);
    container.appendChild(splitLayout);

    return container;
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
