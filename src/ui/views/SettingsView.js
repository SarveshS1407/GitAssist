import { PageHeader } from '../components/PageHeader.js';
import { SettingsModal } from '../components/SettingsModal.js';

/**
 * SettingsView Component
 * Full-page configuration and settings console for GitAssist.
 */
export class SettingsView {
  constructor({ repositoryState } = {}) {
    this.repositoryState = repositoryState;
    this.activeTab = 'analysis';
    this.settings = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container settings-view';

    const header = new PageHeader({
      title: 'SYSTEM CONFIGURATION & SETTINGS',
      description: 'Configure air-gapped forensic parsing limits, local AI models, visual themes, and storage rules.',
      badge: 'Control Matrix',
      actions: [
        {
          label: '↺ Reset Defaults',
          variant: 'secondary',
          onClick: () => this.resetDefaults(container)
        },
        {
          label: '💾 Save Configuration',
          variant: 'primary',
          onClick: () => this.saveSettings(container)
        }
      ]
    });
    container.appendChild(header.render());

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'settings-page-wrapper';
    contentWrapper.innerHTML = `
      <div class="settings-loading-card" style="padding: 30px; text-align: center; color: var(--accent-cyan); font-family: var(--font-mono);">
        ⚡ INITIALIZING CONFIGURATION ENGINE...
      </div>
    `;
    container.appendChild(contentWrapper);

    // Fetch and render settings
    if (typeof window !== 'undefined' && window.fetch) {
      this.loadSettings(contentWrapper);
    } else {
      // Offline/SSR mock fallback
      this.settings = {
        analysis: { maxFileSizeKb: 500, ignorePatterns: ['node_modules/**'], churnCommitDepth: 100, complexityThreshold: 15, detectDuplication: true, detectSecrets: true, detectLicenses: true },
        ai: { provider: 'offline-rules', ollamaEndpoint: 'http://localhost:11434', ollamaModel: 'codellama', temperature: 0.2, maxTokens: 4096 },
        appearance: { theme: 'cyber-aurora', animationSpeed: 'normal', show3DCarousel: true, compactMode: false, highContrastGlow: true },
        system: { anonymousTelemetry: false, localCacheDir: '.gitassist-cache', enableAutoScan: true }
      };
      this.renderFullSettings(contentWrapper);
    }

    return container;
  }

  async loadSettings(wrapper) {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        this.settings = data.settings;
      }
    } catch (err) {
      console.error('[SettingsView] Error loading settings:', err);
    }
    this.renderFullSettings(wrapper);
  }

  renderFullSettings(wrapper) {
    const s = this.settings || {
      analysis: { maxFileSizeKb: 500, ignorePatterns: [], churnCommitDepth: 100, complexityThreshold: 15, detectDuplication: true, detectSecrets: true, detectLicenses: true },
      ai: { provider: 'offline-rules', ollamaEndpoint: 'http://localhost:11434', ollamaModel: 'codellama', temperature: 0.2, maxTokens: 4096 },
      appearance: { theme: 'cyber-aurora', animationSpeed: 'normal', show3DCarousel: true, compactMode: false, highContrastGlow: true },
      system: { anonymousTelemetry: false, localCacheDir: '.gitassist-cache', enableAutoScan: true }
    };

    wrapper.innerHTML = `
      <div class="settings-page-card">
        <div class="settings-tabs-bar">
          <button class="settings-tab-btn ${this.activeTab === 'analysis' ? 'active' : ''}" data-tab="analysis">
            <span>🔍</span>
            <span>Excavation & Analysis</span>
          </button>
          <button class="settings-tab-btn ${this.activeTab === 'ai' ? 'active' : ''}" data-tab="ai">
            <span>🤖</span>
            <span>AI & LLM Engine</span>
          </button>
          <button class="settings-tab-btn ${this.activeTab === 'appearance' ? 'active' : ''}" data-tab="appearance">
            <span>🎨</span>
            <span>Appearance & Visuals</span>
          </button>
          <button class="settings-tab-btn ${this.activeTab === 'system' ? 'active' : ''}" data-tab="system">
            <span>🛡️</span>
            <span>Privacy & Storage</span>
          </button>
        </div>

        <div class="settings-content-area" id="page-settings-content">
          ${this.renderTabBody(s)}
        </div>
      </div>
    `;

    wrapper.querySelectorAll('.settings-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.renderFullSettings(wrapper);
      });
    });

    wrapper.querySelector('#btn-page-test-ai')?.addEventListener('click', async () => {
      const resEl = wrapper.querySelector('#page-ai-test-result');
      if (!resEl) return;
      resEl.innerHTML = '<span style="color: var(--accent-cyan);">⚡ Pinging endpoint...</span>';
      const provider = wrapper.querySelector('#page-set-ai-provider')?.value;
      const endpoint = wrapper.querySelector('#page-set-ollama-endpoint')?.value;
      try {
        const res = await fetch('/api/settings/test-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, ollamaEndpoint: endpoint })
        });
        const data = await res.json();
        if (data.success) {
          resEl.innerHTML = `<span style="color: var(--success);">✓ ${data.message}</span>`;
        } else {
          resEl.innerHTML = `<span style="color: var(--danger);">✗ ${data.message}</span>`;
        }
      } catch (err) {
        resEl.innerHTML = `<span style="color: var(--danger);">✗ Error: ${err.message}</span>`;
      }
    });
  }

  renderTabBody(s) {
    if (this.activeTab === 'analysis') {
      return `
        <div class="settings-tab-panel">
          <div class="settings-field-group">
            <h4 class="settings-group-title">◈ AST & Static Parsing Limits</h4>
            <div class="settings-grid-2">
              <div class="settings-field">
                <label class="settings-label" for="page-set-max-file-size">Max File Parse Size (KB)</label>
                <input type="number" id="page-set-max-file-size" class="settings-input" value="${s.analysis.maxFileSizeKb || 500}" />
              </div>
              <div class="settings-field">
                <label class="settings-label" for="page-set-complexity-thresh">Cyclomatic Complexity Threshold</label>
                <input type="number" id="page-set-complexity-thresh" class="settings-input" value="${s.analysis.complexityThreshold || 15}" />
              </div>
            </div>
            <div class="settings-field" style="margin-top: 14px;">
              <label class="settings-label" for="page-set-churn-depth">Git Commit History Depth</label>
              <input type="number" id="page-set-churn-depth" class="settings-input" value="${s.analysis.churnCommitDepth || 100}" />
            </div>
          </div>

          <div class="settings-field-group" style="margin-top: 20px;">
            <h4 class="settings-group-title">◈ Active Scanners</h4>
            <div class="settings-toggles-list">
              <label class="settings-toggle-item">
                <input type="checkbox" id="page-set-detect-dup" ${s.analysis.detectDuplication ? 'checked' : ''} />
                <span class="settings-toggle-slider"></span>
                <span class="settings-toggle-label"><strong>Code Duplication Detector</strong></span>
              </label>
              <label class="settings-toggle-item">
                <input type="checkbox" id="page-set-detect-sec" ${s.analysis.detectSecrets ? 'checked' : ''} />
                <span class="settings-toggle-slider"></span>
                <span class="settings-toggle-label"><strong>Security & Secret Leak Auditor</strong></span>
              </label>
              <label class="settings-toggle-item">
                <input type="checkbox" id="page-set-detect-lic" ${s.analysis.detectLicenses ? 'checked' : ''} />
                <span class="settings-toggle-slider"></span>
                <span class="settings-toggle-label"><strong>Software License & Copyleft Auditor</strong></span>
              </label>
            </div>
          </div>

          <div class="settings-field-group" style="margin-top: 20px;">
            <h4 class="settings-group-title">◈ Exclusion Glob Patterns</h4>
            <textarea id="page-set-ignore-patterns" class="settings-textarea" rows="4">${(s.analysis.ignorePatterns || []).join('\n')}</textarea>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'ai') {
      return `
        <div class="settings-tab-panel">
          <div class="settings-field-group">
            <h4 class="settings-group-title">◈ Local Intelligence Provider</h4>
            <div class="settings-field">
              <label class="settings-label" for="page-set-ai-provider">Active AI Engine</label>
              <select id="page-set-ai-provider" class="settings-select">
                <option value="offline-rules" ${s.ai.provider === 'offline-rules' ? 'selected' : ''}>Offline Deterministic AST Rules (Zero Network)</option>
                <option value="ollama-local" ${s.ai.provider === 'ollama-local' ? 'selected' : ''}>Ollama Local LLM (localhost:11434)</option>
                <option value="custom-endpoint" ${s.ai.provider === 'custom-endpoint' ? 'selected' : ''}>Custom OpenAI-Compatible Endpoint</option>
              </select>
            </div>

            <div class="settings-grid-2" style="margin-top: 14px;">
              <div class="settings-field">
                <label class="settings-label" for="page-set-ollama-endpoint">Ollama / API Endpoint URL</label>
                <input type="text" id="page-set-ollama-endpoint" class="settings-input" value="${s.ai.ollamaEndpoint || 'http://localhost:11434'}" />
              </div>
              <div class="settings-field">
                <label class="settings-label" for="page-set-ollama-model">Model Identifier</label>
                <input type="text" id="page-set-ollama-model" class="settings-input" value="${s.ai.ollamaModel || 'codellama'}" />
              </div>
            </div>

            <div style="margin-top: 18px; display: flex; align-items: center; gap: 12px;">
              <button class="settings-btn secondary" id="btn-page-test-ai"><span>🔌 Test Endpoint Connection</span></button>
              <div id="page-ai-test-result" style="font-family: var(--font-mono); font-size: 0.76rem;"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'appearance') {
      return `
        <div class="settings-tab-panel">
          <div class="settings-field-group">
            <h4 class="settings-group-title">◈ Visual Styling & Theme</h4>
            <div class="settings-field">
              <label class="settings-label" for="page-set-app-theme">Color Theme</label>
              <select id="page-set-app-theme" class="settings-select">
                <option value="cyber-aurora" ${s.appearance.theme === 'cyber-aurora' ? 'selected' : ''}>Cyber Aurora (Default)</option>
                <option value="synthwave" ${s.appearance.theme === 'synthwave' ? 'selected' : ''}>Synthwave Neon</option>
                <option value="midnight-terminal" ${s.appearance.theme === 'midnight-terminal' ? 'selected' : ''}>Midnight Terminal</option>
                <option value="deep-space" ${s.appearance.theme === 'deep-space' ? 'selected' : ''}>Deep Space Dark</option>
              </select>
            </div>

            <div class="settings-toggles-list" style="margin-top: 20px;">
              <label class="settings-toggle-item">
                <input type="checkbox" id="page-set-show-carousel" ${s.appearance.show3DCarousel ? 'checked' : ''} />
                <span class="settings-toggle-slider"></span>
                <span class="settings-toggle-label"><strong>3D Holographic Forensic Strata Rotor</strong></span>
              </label>
              <label class="settings-toggle-item">
                <input type="checkbox" id="page-set-high-contrast" ${s.appearance.highContrastGlow ? 'checked' : ''} />
                <span class="settings-toggle-slider"></span>
                <span class="settings-toggle-label"><strong>High-Contrast Laser Glow</strong></span>
              </label>
            </div>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'system') {
      return `
        <div class="settings-tab-panel">
          <div class="settings-field-group">
            <h4 class="settings-group-title">◈ Privacy & Zero-Exfiltration Guarantees</h4>
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 14px 16px;">
              <div style="color: var(--success); font-family: var(--font-cyber); font-weight: 800;">🛡️ 100% AIR-GAPPED & LOCAL-FIRST</div>
              <p style="margin: 6px 0 0 0; font-size: 0.78rem; color: var(--text-secondary);">Source code and commits never leave your machine.</p>
            </div>
            <div class="settings-field" style="margin-top: 14px;">
              <label class="settings-label" for="page-set-cache-dir">Local Cache Directory</label>
              <input type="text" id="page-set-cache-dir" class="settings-input" value="${s.system.localCacheDir || '.gitassist-cache'}" />
            </div>
          </div>
        </div>
      `;
    }

    return '';
  }

  async saveSettings(container) {
    const updates = {};
    const maxFileSize = container.querySelector('#page-set-max-file-size');
    const complexity = container.querySelector('#page-set-complexity-thresh');
    const churn = container.querySelector('#page-set-churn-depth');
    const dup = container.querySelector('#page-set-detect-dup');
    const sec = container.querySelector('#page-set-detect-sec');
    const lic = container.querySelector('#page-set-detect-lic');
    const ignore = container.querySelector('#page-set-ignore-patterns');

    if (maxFileSize || complexity || churn) {
      updates.analysis = {
        ...(this.settings?.analysis || {})
      };
      if (maxFileSize) updates.analysis.maxFileSizeKb = parseInt(maxFileSize.value, 10) || 500;
      if (complexity) updates.analysis.complexityThreshold = parseInt(complexity.value, 10) || 15;
      if (churn) updates.analysis.churnCommitDepth = parseInt(churn.value, 10) || 100;
      if (dup) updates.analysis.detectDuplication = dup.checked;
      if (sec) updates.analysis.detectSecrets = sec.checked;
      if (lic) updates.analysis.detectLicenses = lic.checked;
      if (ignore) updates.analysis.ignorePatterns = ignore.value.split('\n').map(p => p.trim()).filter(Boolean);
    }

    const aiProvider = container.querySelector('#page-set-ai-provider');
    const ollama = container.querySelector('#page-set-ollama-endpoint');
    const model = container.querySelector('#page-set-ollama-model');
    if (aiProvider || ollama) {
      updates.ai = {
        ...(this.settings?.ai || {})
      };
      if (aiProvider) updates.ai.provider = aiProvider.value;
      if (ollama) updates.ai.ollamaEndpoint = ollama.value;
      if (model) updates.ai.ollamaModel = model.value;
    }

    const theme = container.querySelector('#page-set-app-theme');
    const carousel = container.querySelector('#page-set-show-carousel');
    const glow = container.querySelector('#page-set-high-contrast');
    if (theme || carousel) {
      updates.appearance = {
        ...(this.settings?.appearance || {})
      };
      if (theme) updates.appearance.theme = theme.value;
      if (carousel) updates.appearance.show3DCarousel = carousel.checked;
      if (glow) updates.appearance.highContrastGlow = glow.checked;
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updates })
      });
      if (res.ok) {
        const data = await res.json();
        this.settings = data.settings;
        alert('Configuration saved successfully!');
      }
    } catch (err) {
      alert('Error saving configuration: ' + err.message);
    }
  }

  async resetDefaults(container) {
    if (confirm('Reset all GitAssist configuration settings to factory defaults?')) {
      try {
        const res = await fetch('/api/settings/reset', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          this.settings = data.settings;
          const wrapper = container.querySelector('.settings-page-wrapper');
          if (wrapper) this.renderFullSettings(wrapper);
          alert('Settings reset to factory defaults.');
        }
      } catch (err) {
        alert('Error resetting settings: ' + err.message);
      }
    }
  }
}
