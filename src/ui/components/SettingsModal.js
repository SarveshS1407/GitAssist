/**
 * SettingsModal Component
 * Interactive slide-over and modal configuration console for GitAssist.
 * Controls analysis parameters, AI/LLM providers, appearance, and local telemetry.
 */
export class SettingsModal {
  constructor() {
    this.overlay = null;
    this.activeTab = 'analysis';
    this.settings = null;
    this.isLoading = false;
    this.isSaving = false;
  }

  async open() {
    this.close(); // Remove any existing instance

    this.overlay = document.createElement('div');
    this.overlay.className = 'settings-modal-overlay';
    this.overlay.id = 'settings-modal-overlay';

    this.renderSkeleton();
    document.body.appendChild(this.overlay);

    await this.fetchSettings();
    this.renderContent();

    // Close on Escape
    this.escHandler = (e) => {
      if (e.key === 'Escape') this.close();
    };
    window.addEventListener('keydown', this.escHandler);
  }

  close() {
    if (this.escHandler) {
      window.removeEventListener('keydown', this.escHandler);
      this.escHandler = null;
    }
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  async fetchSettings() {
    this.isLoading = true;
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        this.settings = data.settings;
      }
    } catch (err) {
      console.error('[SettingsModal] Failed to load settings:', err);
    } finally {
      this.isLoading = false;
    }
  }

  renderSkeleton() {
    this.overlay.innerHTML = `
      <div class="settings-modal-card">
        <div class="settings-laser-header"></div>
        <div class="settings-header">
          <div class="settings-title-wrap">
            <span class="settings-title-icon">⚙️</span>
            <h3 class="settings-title text-gradient-cyber">GITASSIST SYSTEM CONFIGURATION</h3>
          </div>
          <button class="settings-close-btn" id="btn-settings-close" title="Close (Esc)">✕</button>
        </div>
        <div class="settings-body-loading" style="padding: 40px; text-align: center; color: var(--accent-cyan); font-family: var(--font-mono);">
          ⚡ ACCESSING SYSTEM CONFIGURATION MATRIX...
        </div>
      </div>
    `;

    this.overlay.querySelector('#btn-settings-close')?.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
  }

  renderContent() {
    if (!this.overlay) return;

    const s = this.settings || {
      analysis: { maxFileSizeKb: 500, ignorePatterns: [], churnCommitDepth: 100, complexityThreshold: 15, detectDuplication: true, detectSecrets: true, detectLicenses: true },
      ai: { provider: 'offline-rules', ollamaEndpoint: 'http://localhost:11434', ollamaModel: 'codellama', temperature: 0.2, maxTokens: 4096 },
      appearance: { theme: 'cyber-aurora', animationSpeed: 'normal', show3DCarousel: true, compactMode: false, highContrastGlow: true },
      system: { anonymousTelemetry: false, localCacheDir: '.gitassist-cache', enableAutoScan: true }
    };

    const modal = this.overlay.querySelector('.settings-modal-card');
    if (!modal) return;

    modal.innerHTML = `
      <div class="settings-laser-header"></div>
      
      <div class="settings-header">
        <div class="settings-title-wrap">
          <span class="settings-title-icon">⚙️</span>
          <div>
            <h3 class="settings-title text-gradient-cyber">SYSTEM CONFIGURATION</h3>
            <span class="settings-subtitle">Air-gapped intelligence parameters & telemetry configuration</span>
          </div>
        </div>
        <button class="settings-close-btn" id="btn-settings-close" title="Close (Esc)">✕</button>
      </div>

      <!-- Navigation Tabs -->
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

      <!-- Tab Content Panels -->
      <div class="settings-content-area" id="settings-content-area">
        ${this.renderTabContent(s)}
      </div>

      <!-- Footer Action Bar -->
      <div class="settings-footer">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="status-indicator-dot online"></span>
          <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">
            LOCAL STORAGE: .gitassist-settings.json
          </span>
        </div>
        <div class="settings-footer-actions">
          <button class="settings-btn secondary" id="btn-reset-settings" title="Restore all default settings">
            <span>↺ Reset Defaults</span>
          </button>
          <button class="settings-btn secondary" id="btn-cancel-settings">
            <span>Cancel</span>
          </button>
          <button class="settings-btn primary" id="btn-save-settings">
            <span>💾 Save Configuration</span>
          </button>
        </div>
      </div>
    `;

    // Wire events
    modal.querySelector('#btn-settings-close')?.addEventListener('click', () => this.close());
    modal.querySelector('#btn-cancel-settings')?.addEventListener('click', () => this.close());

    // Tab switching
    modal.querySelectorAll('.settings-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.renderContent();
      });
    });

    // Reset settings
    modal.querySelector('#btn-reset-settings')?.addEventListener('click', async () => {
      if (confirm('Reset all GitAssist configuration settings to defaults?')) {
        try {
          const res = await fetch('/api/settings/reset', { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            this.settings = data.settings;
            this.showToast('Settings restored to factory defaults', 'success');
            this.renderContent();
          }
        } catch (err) {
          this.showToast('Failed to reset settings: ' + err.message, 'error');
        }
      }
    });

    // Save settings
    modal.querySelector('#btn-save-settings')?.addEventListener('click', async () => {
      await this.saveCurrentForm();
    });

    // Test connection button (if on AI tab)
    modal.querySelector('#btn-test-ai')?.addEventListener('click', async () => {
      await this.testAiConnection();
    });
  }

  renderTabContent(s) {
    if (this.activeTab === 'analysis') {
      return `
        <div class="settings-tab-panel">
          <div class="settings-field-group">
            <h4 class="settings-group-title">◈ AST & Static Parsing Thresholds</h4>
            
            <div class="settings-grid-2">
              <div class="settings-field">
                <label class="settings-label" for="set-max-file-size">
                  Max File Parse Size (KB)
                  <span class="settings-help">Files exceeding this size are indexed as metadata only.</span>
                </label>
                <input type="number" id="set-max-file-size" class="settings-input" value="${s.analysis.maxFileSizeKb || 500}" min="50" max="10000" step="50" />
              </div>

              <div class="settings-field">
                <label class="settings-label" for="set-complexity-thresh">
                  Cyclomatic Complexity Alert
                  <span class="settings-help">Functions exceeding this complexity score are flagged as high risk.</span>
                </label>
                <input type="number" id="set-complexity-thresh" class="settings-input" value="${s.analysis.complexityThreshold || 15}" min="5" max="50" />
              </div>
            </div>

            <div class="settings-field" style="margin-top: 14px;">
              <label class="settings-label" for="set-churn-depth">
                Git Commit History Depth
                <span class="settings-help">Number of recent commits analyzed for author ownership and churn volatility.</span>
              </label>
              <input type="number" id="set-churn-depth" class="settings-input" value="${s.analysis.churnCommitDepth || 100}" min="10" max="1000" step="10" />
            </div>
          </div>

          <div class="settings-field-group" style="margin-top: 20px;">
            <h4 class="settings-group-title">◈ Automated Forensic Scanners</h4>
            
            <div class="settings-toggles-list">
              <label class="settings-toggle-item">
                <input type="checkbox" id="set-detect-dup" ${s.analysis.detectDuplication ? 'checked' : ''} />
                <span class="settings-toggle-slider"></span>
                <span class="settings-toggle-label">
                  <strong>Code Duplication & Clone Block Detector</strong>
                  <small>Scans rolling token hashes for copy-paste clones and block redundancies.</small>
                </span>
              </label>

              <label class="settings-toggle-item">
                <input type="checkbox" id="set-detect-sec" ${s.analysis.detectSecrets ? 'checked' : ''} />
                <span class="settings-toggle-slider"></span>
                <span class="settings-toggle-label">
                  <strong>Security Scanner & Secret Leak Auditor</strong>
                  <small>Flags high-entropy secrets, leaked API keys, tokens, and hazardous calls.</small>
                </span>
              </label>

              <label class="settings-toggle-item">
                <input type="checkbox" id="set-detect-lic" ${s.analysis.detectLicenses ? 'checked' : ''} />
                <span class="settings-toggle-slider"></span>
                <span class="settings-toggle-label">
                  <strong>Software License & Copyleft Auditor</strong>
                  <small>Detects OSI licenses and flags commercial copyleft compliance risks.</small>
                </span>
              </label>
            </div>
          </div>

          <div class="settings-field-group" style="margin-top: 20px;">
            <h4 class="settings-group-title">◈ Exclusion Glob Patterns</h4>
            <div class="settings-field">
              <label class="settings-label" for="set-ignore-patterns">
                Paths and Globs to Ignore (one per line)
              </label>
              <textarea id="set-ignore-patterns" class="settings-textarea" rows="4">${(s.analysis.ignorePatterns || []).join('\n')}</textarea>
            </div>
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
              <label class="settings-label" for="set-ai-provider">
                Active AI Reasoning Engine
                <span class="settings-help">Select between 100% offline deterministic rules or local LLMs.</span>
              </label>
              <select id="set-ai-provider" class="settings-select">
                <option value="offline-rules" ${s.ai.provider === 'offline-rules' ? 'selected' : ''}>Offline Deterministic AST Rules (Zero Network / Fast)</option>
                <option value="ollama-local" ${s.ai.provider === 'ollama-local' ? 'selected' : ''}>Ollama Local LLM (Localhost AI Daemon)</option>
                <option value="custom-endpoint" ${s.ai.provider === 'custom-endpoint' ? 'selected' : ''}>Custom OpenAI-Compatible Local Endpoint</option>
              </select>
            </div>

            <div class="settings-grid-2" style="margin-top: 14px;">
              <div class="settings-field">
                <label class="settings-label" for="set-ollama-endpoint">
                  Ollama / API Endpoint URL
                </label>
                <input type="text" id="set-ollama-endpoint" class="settings-input" value="${s.ai.ollamaEndpoint || 'http://localhost:11434'}" placeholder="http://localhost:11434" />
              </div>

              <div class="settings-field">
                <label class="settings-label" for="set-ollama-model">
                  Model Identifier
                </label>
                <input type="text" id="set-ollama-model" class="settings-input" value="${s.ai.ollamaModel || 'codellama'}" placeholder="e.g. codellama, llama3, mistral" />
              </div>
            </div>

            <div class="settings-grid-2" style="margin-top: 14px;">
              <div class="settings-field">
                <label class="settings-label" for="set-ai-temp">
                  Temperature: <strong id="val-ai-temp">${s.ai.temperature ?? 0.2}</strong>
                  <span class="settings-help">Lower values produce deterministic, grounded forensic findings.</span>
                </label>
                <input type="range" id="set-ai-temp" class="settings-slider" min="0" max="1" step="0.05" value="${s.ai.temperature ?? 0.2}" />
              </div>

              <div class="settings-field">
                <label class="settings-label" for="set-ai-tokens">
                  Max Context Window (Tokens)
                </label>
                <input type="number" id="set-ai-tokens" class="settings-input" value="${s.ai.maxTokens || 4096}" min="1024" max="32768" step="1024" />
              </div>
            </div>

            <div style="margin-top: 18px; display: flex; align-items: center; gap: 12px;">
              <button class="settings-btn secondary" id="btn-test-ai" style="padding: 8px 14px;">
                <span>🔌 Test Endpoint Connection</span>
              </button>
              <div id="ai-test-result" style="font-family: var(--font-mono); font-size: 0.76rem; color: var(--text-muted);"></div>
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
              <label class="settings-label" for="set-app-theme">
                Color Palette Theme
              </label>
              <select id="set-app-theme" class="settings-select">
                <option value="cyber-aurora" ${s.appearance.theme === 'cyber-aurora' ? 'selected' : ''}>Cyber Aurora (Cyan / Magenta / Deep Navy - Default)</option>
                <option value="synthwave" ${s.appearance.theme === 'synthwave' ? 'selected' : ''}>Synthwave Neon (Violet / Electric Coral)</option>
                <option value="midnight-terminal" ${s.appearance.theme === 'midnight-terminal' ? 'selected' : ''}>Midnight Terminal (Emerald / Matrix Phosphor)</option>
                <option value="deep-space" ${s.appearance.theme === 'deep-space' ? 'selected' : ''}>Deep Space Dark (Charcoal / Titanium White)</option>
              </select>
            </div>

            <div class="settings-grid-2" style="margin-top: 14px;">
              <div class="settings-field">
                <label class="settings-label" for="set-anim-speed">
                  Animation & Transition Cadence
                </label>
                <select id="set-anim-speed" class="settings-select">
                  <option value="fast" ${s.appearance.animationSpeed === 'fast' ? 'selected' : ''}>High Velocity (0.2s)</option>
                  <option value="normal" ${s.appearance.animationSpeed === 'normal' ? 'selected' : ''}>Normal Holographic (0.4s)</option>
                  <option value="reduced" ${s.appearance.animationSpeed === 'reduced' ? 'selected' : ''}>Reduced Motion / Static</option>
                </select>
              </div>
            </div>
          </div>

          <div class="settings-field-group" style="margin-top: 20px;">
            <h4 class="settings-group-title">◈ Display Features</h4>
            
            <div class="settings-toggles-list">
              <label class="settings-toggle-item">
                <input type="checkbox" id="set-show-carousel" ${s.appearance.show3DCarousel ? 'checked' : ''} />
                <span class="settings-toggle-slider"></span>
                <span class="settings-toggle-label">
                  <strong>3D Holographic Forensic Strata Rotor</strong>
                  <small>Render interactive 21-sector 3D cylindrical forensic turntable on Overview dashboard.</small>
                </span>
              </label>

              <label class="settings-toggle-item">
                <input type="checkbox" id="set-high-contrast" ${s.appearance.highContrastGlow ? 'checked' : ''} />
                <span class="settings-toggle-slider"></span>
                <span class="settings-toggle-label">
                  <strong>High-Contrast Neon Laser Emblems</strong>
                  <small>Enhance borders and text shadows with laser-phosphor bloom.</small>
                </span>
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
            
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 14px 16px; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 8px; color: var(--success); font-family: var(--font-cyber); font-weight: 800; font-size: 0.9rem;">
                <span>🛡️</span>
                <span>100% LOCAL-FIRST & AIR-GAPPED</span>
              </div>
              <p style="margin: 6px 0 0 0; font-size: 0.78rem; color: var(--text-secondary); line-height: 1.45;">
                GitAssist runs entirely on your machine. Your source code, commits, symbols, AST structures, and git history NEVER leave your local filesystem.
              </p>
            </div>

            <div class="settings-field">
              <label class="settings-label" for="set-cache-dir">
                Local Cache Directory
                <span class="settings-help">Temporary directory used for indexing caches and AST memoization.</span>
              </label>
              <input type="text" id="set-cache-dir" class="settings-input" value="${s.system.localCacheDir || '.gitassist-cache'}" />
            </div>

            <div class="settings-toggles-list" style="margin-top: 14px;">
              <label class="settings-toggle-item">
                <input type="checkbox" id="set-telemetry" ${s.system.anonymousTelemetry ? 'checked' : ''} />
                <span class="settings-toggle-slider"></span>
                <span class="settings-toggle-label">
                  <strong>Anonymous Local Diagnostic Telemetry</strong>
                  <small>Disabled by default. When off, zero analytical telemetry is collected.</small>
                </span>
              </label>
            </div>
          </div>
        </div>
      `;
    }

    return '';
  }

  async testAiConnection() {
    const resultEl = this.overlay.querySelector('#ai-test-result');
    if (!resultEl) return;

    resultEl.innerHTML = '<span style="color: var(--accent-cyan);">⚡ Pinging endpoint...</span>';

    const provider = this.overlay.querySelector('#set-ai-provider')?.value;
    const endpoint = this.overlay.querySelector('#set-ollama-endpoint')?.value;

    try {
      const res = await fetch('/api/settings/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, ollamaEndpoint: endpoint })
      });
      const data = await res.json();
      if (data.success) {
        resultEl.innerHTML = `<span style="color: var(--success);">✓ ${data.message}</span>`;
      } else {
        resultEl.innerHTML = `<span style="color: var(--danger);">✗ ${data.message}</span>`;
      }
    } catch (err) {
      resultEl.innerHTML = `<span style="color: var(--danger);">✗ Network Error: ${err.message}</span>`;
    }
  }

  async saveCurrentForm() {
    const modal = this.overlay.querySelector('.settings-modal-card');
    if (!modal) return;

    const currentUpdates = {};

    // Collect fields if they exist in current view
    const maxFileSize = modal.querySelector('#set-max-file-size');
    const complexityThresh = modal.querySelector('#set-complexity-thresh');
    const churnDepth = modal.querySelector('#set-churn-depth');
    const detectDup = modal.querySelector('#set-detect-dup');
    const detectSec = modal.querySelector('#set-detect-sec');
    const detectLic = modal.querySelector('#set-detect-lic');
    const ignorePatterns = modal.querySelector('#set-ignore-patterns');

    if (maxFileSize || complexityThresh || churnDepth || detectDup || ignorePatterns) {
      currentUpdates.analysis = {
        ...(this.settings?.analysis || {})
      };
      if (maxFileSize) currentUpdates.analysis.maxFileSizeKb = parseInt(maxFileSize.value, 10) || 500;
      if (complexityThresh) currentUpdates.analysis.complexityThreshold = parseInt(complexityThresh.value, 10) || 15;
      if (churnDepth) currentUpdates.analysis.churnCommitDepth = parseInt(churnDepth.value, 10) || 100;
      if (detectDup) currentUpdates.analysis.detectDuplication = detectDup.checked;
      if (detectSec) currentUpdates.analysis.detectSecrets = detectSec.checked;
      if (detectLic) currentUpdates.analysis.detectLicenses = detectLic.checked;
      if (ignorePatterns) {
        currentUpdates.analysis.ignorePatterns = ignorePatterns.value
          .split('\n')
          .map(p => p.trim())
          .filter(Boolean);
      }
    }

    const aiProvider = modal.querySelector('#set-ai-provider');
    const ollamaEndpoint = modal.querySelector('#set-ollama-endpoint');
    const ollamaModel = modal.querySelector('#set-ollama-model');
    const aiTemp = modal.querySelector('#set-ai-temp');
    const aiTokens = modal.querySelector('#set-ai-tokens');

    if (aiProvider || ollamaEndpoint || ollamaModel) {
      currentUpdates.ai = {
        ...(this.settings?.ai || {})
      };
      if (aiProvider) currentUpdates.ai.provider = aiProvider.value;
      if (ollamaEndpoint) currentUpdates.ai.ollamaEndpoint = ollamaEndpoint.value;
      if (ollamaModel) currentUpdates.ai.ollamaModel = ollamaModel.value;
      if (aiTemp) currentUpdates.ai.temperature = parseFloat(aiTemp.value) || 0.2;
      if (aiTokens) currentUpdates.ai.maxTokens = parseInt(aiTokens.value, 10) || 4096;
    }

    const appTheme = modal.querySelector('#set-app-theme');
    const animSpeed = modal.querySelector('#set-anim-speed');
    const showCarousel = modal.querySelector('#set-show-carousel');
    const highContrast = modal.querySelector('#set-high-contrast');

    if (appTheme || animSpeed || showCarousel) {
      currentUpdates.appearance = {
        ...(this.settings?.appearance || {})
      };
      if (appTheme) currentUpdates.appearance.theme = appTheme.value;
      if (animSpeed) currentUpdates.appearance.animationSpeed = animSpeed.value;
      if (showCarousel) currentUpdates.appearance.show3DCarousel = showCarousel.checked;
      if (highContrast) currentUpdates.appearance.highContrastGlow = highContrast.checked;
    }

    const cacheDir = modal.querySelector('#set-cache-dir');
    const telemetry = modal.querySelector('#set-telemetry');

    if (cacheDir || telemetry) {
      currentUpdates.system = {
        ...(this.settings?.system || {})
      };
      if (cacheDir) currentUpdates.system.localCacheDir = cacheDir.value;
      if (telemetry) currentUpdates.system.anonymousTelemetry = telemetry.checked;
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: currentUpdates })
      });

      if (res.ok) {
        const data = await res.json();
        this.settings = data.settings;
        this.showToast('Configuration updated and persisted successfully', 'success');
        setTimeout(() => this.close(), 600);
      } else {
        this.showToast('Server returned error while saving', 'error');
      }
    } catch (err) {
      this.showToast('Network error: ' + err.message, 'error');
    }
  }

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `settings-toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : '⚠️'}</span>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
}
