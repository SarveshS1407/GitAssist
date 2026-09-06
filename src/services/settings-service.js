import path from 'node:path';
import fs from 'node:fs/promises';

export const DEFAULT_SETTINGS = {
  analysis: {
    maxFileSizeKb: 500,
    ignorePatterns: [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      '.next/**',
      'coverage/**',
      '*.lock',
      'package-lock.json'
    ],
    churnCommitDepth: 100,
    complexityThreshold: 15,
    detectDuplication: true,
    detectSecrets: true,
    detectLicenses: true
  },
  ai: {
    provider: 'offline-rules', // 'offline-rules' | 'ollama-local' | 'custom-endpoint'
    ollamaEndpoint: 'http://localhost:11434',
    ollamaModel: 'codellama',
    customApiKey: '',
    temperature: 0.2,
    maxTokens: 4096
  },
  appearance: {
    theme: 'cyber-aurora', // 'cyber-aurora' | 'synthwave' | 'midnight-terminal' | 'deep-space'
    animationSpeed: 'normal',
    show3DCarousel: true,
    compactMode: false,
    highContrastGlow: true
  },
  system: {
    anonymousTelemetry: false,
    localCacheDir: '.gitassist-cache',
    enableAutoScan: true
  }
};

export class SettingsService {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.settingsFilePath = path.join(rootDir, '.gitassist-settings.json');
    this.currentSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    this.isLoaded = false;
  }

  async loadSettings() {
    try {
      const content = await fs.readFile(this.settingsFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      this.currentSettings = this.deepMerge(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), parsed);
      this.isLoaded = true;
    } catch {
      // If file doesn't exist or is unreadable, fallback to defaults
      this.currentSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      this.isLoaded = true;
    }
    return this.currentSettings;
  }

  async getSettings() {
    if (!this.isLoaded) {
      await this.loadSettings();
    }
    return JSON.parse(JSON.stringify(this.currentSettings));
  }

  async updateSettings(updates = {}) {
    if (!this.isLoaded) {
      await this.loadSettings();
    }

    this.currentSettings = this.deepMerge(this.currentSettings, updates);

    try {
      await fs.writeFile(
        this.settingsFilePath,
        JSON.stringify(this.currentSettings, null, 2),
        'utf-8'
      );
    } catch (err) {
      console.warn(`[SettingsService] Could not persist settings to file: ${err.message}`);
    }

    return JSON.parse(JSON.stringify(this.currentSettings));
  }

  async resetSettings() {
    this.currentSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    try {
      await fs.writeFile(
        this.settingsFilePath,
        JSON.stringify(this.currentSettings, null, 2),
        'utf-8'
      );
    } catch (err) {
      console.warn(`[SettingsService] Could not persist reset settings to file: ${err.message}`);
    }
    return JSON.parse(JSON.stringify(this.currentSettings));
  }

  async testConnection(aiConfig = {}) {
    const provider = aiConfig.provider || this.currentSettings.ai.provider;
    if (provider === 'offline-rules') {
      return {
        success: true,
        provider: 'offline-rules',
        message: 'Offline Deterministic AST Rules Engine is active and verified.',
        latencyMs: 1
      };
    }

    const endpoint = (aiConfig.ollamaEndpoint || this.currentSettings.ai.ollamaEndpoint || '').replace(/\/$/, '');
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${endpoint}/api/tags`, { signal: controller.signal });
      clearTimeout(timeout);

      const latencyMs = Date.now() - start;
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          success: true,
          provider: 'ollama-local',
          message: `Connected to Ollama at ${endpoint} (${latencyMs}ms)`,
          models: (data.models || []).map(m => m.name),
          latencyMs
        };
      }
      return {
        success: false,
        provider,
        message: `Endpoint returned HTTP ${res.status}: ${res.statusText}`,
        latencyMs
      };
    } catch (err) {
      return {
        success: false,
        provider,
        message: `Connection failed: ${err.message}. Ensure Ollama is running at ${endpoint}`,
        latencyMs: Date.now() - start
      };
    }
  }

  deepMerge(target, source) {
    if (!source || typeof source !== 'object') return target;
    for (const key of Object.keys(source)) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }
}
