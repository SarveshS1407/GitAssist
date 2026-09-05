import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * SecurityView
 * Visualizes exposed secrets, vulnerabilities, and security posture score
 */
export class SecurityView {
  constructor({ repositoryState }) {
    this.repositoryState = repositoryState;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Security & Secrets Audit',
      description: 'Air-gapped scan for exposed API keys, private credentials, and dangerous code execution sinks.',
      badge: 'Security Posture'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '🔒',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository to execute the automated security and secret audit.'
      }).render());
      return container;
    }

    const card = document.createElement('div');
    card.className = 'landing-card';
    card.innerHTML = `
      <div class="landing-card-header">
        <h3 class="landing-card-title">
          <span>🛡️</span>
          <span>Security Audit & Vulnerabilities</span>
        </h3>
        <span class="landing-card-badge" id="security-status-badge">Auditing...</span>
      </div>
      <div id="security-content-container" style="margin-top: 14px;">
        <p style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">Scanning source files for secret leaks and CVE patterns...</p>
      </div>
    `;
    container.appendChild(card);

    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      this.loadData(card);
    }

    return container;
  }

  async loadData(card) {
    const statusBadge = card.querySelector('#security-status-badge');
    const content = card.querySelector('#security-content-container');

    try {
      const res = await fetch('/api/analysis/security');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const { score = 100, grade = 'A', counts = {}, findings = [] } = data;

      if (statusBadge) {
        statusBadge.textContent = `Score: ${score}/100 (Grade ${grade})`;
        statusBadge.style.color = score >= 85 ? 'var(--success)' : score >= 70 ? 'var(--warning)' : 'var(--danger)';
      }

      const countsHtml = `
        <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
          <div class="stat-pill" style="border-color: ${counts.critical > 0 ? 'var(--danger)' : 'rgba(255,255,255,0.1)'};">
            <strong style="color: ${counts.critical > 0 ? 'var(--danger)' : '#cbd5e1'};">${counts.critical || 0}</strong> Critical
          </div>
          <div class="stat-pill" style="border-color: ${counts.high > 0 ? '#f97316' : 'rgba(255,255,255,0.1)'};">
            <strong style="color: ${counts.high > 0 ? '#f97316' : '#cbd5e1'};">${counts.high || 0}</strong> High
          </div>
          <div class="stat-pill"><strong>${counts.medium || 0}</strong> Medium</div>
          <div class="stat-pill"><strong>${counts.low || 0}</strong> Low</div>
        </div>
      `;

      if (findings.length === 0) {
        content.innerHTML = `
          ${countsHtml}
          <div style="padding: 24px; text-align: center; color: var(--success); font-family: var(--font-mono); background: rgba(16, 185, 129, 0.08); border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2);">
            🔒 Zero exposed secrets or critical vulnerabilities detected. Clean security posture!
          </div>
        `;
        return;
      }

      content.innerHTML = `
        ${countsHtml}
        ${findings.map((f, idx) => {
          const color = f.severity === 'CRITICAL' ? 'var(--danger)' : f.severity === 'HIGH' ? '#f97316' : '#fbbf24';
          return `
            <div class="card p-3 mb-3" style="background: rgba(0, 0, 0, 0.4); border: 1px solid ${color}40; border-left: 3px solid ${color}; border-radius: 8px; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-family: var(--font-cyber); font-size: 0.85rem; color: ${color}; font-weight: 700;">
                  [${f.severity}] ${f.ruleName}
                </span>
                <span style="font-family: var(--font-mono); font-size: 0.74rem; color: #94a3b8;">
                  Line ${f.line}
                </span>
              </div>
              <div style="font-size: 0.78rem; font-family: var(--font-mono); color: #cbd5e1; margin-bottom: 8px;">
                📁 <strong>${f.file}</strong> • ${f.description}
              </div>
              <pre style="background: rgba(4, 8, 18, 0.95); padding: 10px; border-radius: 6px; font-size: 0.74rem; overflow-x: auto; color: #f87171; border: 1px solid rgba(255, 255, 255, 0.08); margin: 0;"><code>${this.escapeHtml(f.snippet)}</code></pre>
            </div>
          `;
        }).join('')}
      `;
    } catch (err) {
      if (statusBadge) statusBadge.textContent = 'Scan Failed';
      content.innerHTML = `<p style="color: var(--danger); font-size: 0.85rem;">Error: ${err.message}</p>`;
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
