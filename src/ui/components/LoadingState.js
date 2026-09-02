/**
 * LoadingState Component
 * Interactive Cyber-Archaeological Excavation Sequence HUD
 */
export class LoadingState {
  constructor({
    stage = 'DISCOVERING REPOSITORY',
    progress = 25,
    target = '',
    subtext = 'Mapping AST symbols, dependency loops, and structural strata...',
    onCancel = null
  } = {}) {
    this.stage = stage;
    this.progress = Math.min(100, Math.max(0, progress));
    this.target = target;
    this.subtext = subtext;
    this.onCancel = onCancel;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'excavation-container';

    // Extract human-readable target name
    let targetDisplay = 'ACTIVE REPOSITORY';
    if (this.target) {
      const parts = this.target.split('/');
      targetDisplay = parts[parts.length - 1] || this.target;
    }

    const isUnlocked = this.progress >= 100 || this.stage.includes('COMPLETE');

    // Conceptual stages computation
    const stages = [
      { id: 1, name: 'DISCOVER', label: '01 // DISCOVER', min: 0 },
      { id: 2, name: 'SCAN STRATA', label: '02 // SCAN STRATA', min: 30 },
      { id: 3, name: 'MAP ARTIFACTS', label: '03 // MAP ARTIFACTS', min: 60 },
      { id: 4, name: 'UNLOCK MODEL', label: '04 // UNLOCK MODEL', min: 95 }
    ];

    const currentStageIndex = this.progress >= 95 ? 3 : this.progress >= 60 ? 2 : this.progress >= 30 ? 1 : 0;

    const stepperHtml = stages.map((s, idx) => {
      let stateClass = '';
      let icon = '○';
      if (idx < currentStageIndex || isUnlocked) {
        stateClass = 'completed';
        icon = '✓';
      } else if (idx === currentStageIndex) {
        stateClass = 'active';
        icon = '◉';
      }
      return `
        <div class="excavation-step-card ${stateClass}">
          <div class="step-num">${icon} ${s.label}</div>
          <div class="step-name">${s.name}</div>
        </div>
      `;
    }).join('');

    const approxArtifacts = Math.max(12, Math.round((this.progress / 100) * 142));

    container.innerHTML = `
      <!-- Top Telemetry Bar -->
      <div class="excavation-header-bar">
        <div class="excavation-tag-pill">
          <span>◈</span>
          <span>EXCAVATION PROTOCOL // SECTOR RECON</span>
        </div>
        <div class="excavation-coord">
          TARGET: <span style="color: var(--text-primary); font-weight: 700;">${targetDisplay}</span> • ZERO-CLOUD AUDIT
        </div>
      </div>

      <!-- Central Relic & Radar Arena -->
      <div class="relic-radar-stage">
        <div class="radar-scope-box">
          <div class="radar-ring-outer"></div>
          <div class="radar-ring-inner"></div>
          <div class="radar-ring-core"></div>
          <div class="radar-sweeper"></div>

          <!-- Central Archaeological Monolith Relic -->
          <div class="relic-monolith-node ${isUnlocked ? 'unlocked' : ''}">
            <span>${isUnlocked ? '💎' : '🏛️'}</span>
          </div>

          <!-- Ambient Floating Data Fragments -->
          <div class="floating-particle-node" style="top: 15px; left: -10px; animation-delay: 0.2s;">
            <span>0x7F_AST</span>
          </div>
          <div class="floating-particle-node" style="bottom: 25px; right: -15px; animation-delay: 0.7s;">
            <span>LOC_STRATA</span>
          </div>
          <div class="floating-particle-node" style="top: 35px; right: -25px; animation-delay: 1.2s;">
            <span>DIR_TREE</span>
          </div>
          <div class="floating-particle-node" style="bottom: 10px; left: -20px; animation-delay: 1.8s;">
            <span>BLOB_REF</span>
          </div>
        </div>

        <!-- Stage Information -->
        <div class="excavation-info-block">
          <div class="excavation-main-title">
            <span>⚡</span>
            <span>${this.stage}</span>
          </div>
          <p class="excavation-subtext">
            ${isUnlocked ? 'Repository model compiled successfully. Revealing archaeological workspace...' : this.subtext}
          </p>
        </div>
      </div>

      <!-- Conceptual Stages Stepper -->
      <div class="excavation-stepper">
        ${stepperHtml}
      </div>

      <!-- Linear Precision Progress Gauge -->
      <div class="excavation-gauge-box">
        <div class="gauge-meta-row">
          <span style="color: var(--text-muted);">EXCAVATION PROGRESS</span>
          <span style="color: var(--accent-cyan); font-weight: 800;">${this.progress}%</span>
        </div>
        <div class="gauge-track">
          <div class="gauge-fill" style="width: ${this.progress}%;"></div>
        </div>
        <div class="gauge-meta-row" style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">
          <span>SECTOR: 0xRECON_${this.progress}</span>
          <span>ARTIFACTS DISCOVERED: ~${approxArtifacts}</span>
        </div>
      </div>

      <!-- Live Terminal Log Stream -->
      <div class="excavation-terminal-feed">
        <div class="terminal-line">
          <span style="color: var(--text-muted);">[0.00s]</span>
          <span>> Ingestion initiated for sector path: ${this.target || 'target repository'}</span>
        </div>
        <div class="terminal-line ${this.progress >= 30 ? '' : 'active'}">
          <span style="color: var(--text-muted);">[0.08s]</span>
          <span>> Validating repository root & Git lineage tracking</span>
        </div>
        ${this.progress >= 30 ? `
          <div class="terminal-line ${this.progress >= 60 ? '' : 'active'}">
            <span style="color: var(--text-muted);">[0.18s]</span>
            <span>> Traversed directory hierarchy & filtered ignored paths (.git, node_modules)</span>
          </div>
        ` : ''}
        ${this.progress >= 60 ? `
          <div class="terminal-line ${this.progress >= 95 ? '' : 'active'}">
            <span style="color: var(--text-muted);">[0.32s]</span>
            <span>> Mapping source artifacts, line metrics, and language strata</span>
          </div>
        ` : ''}
        ${isUnlocked ? `
          <div class="terminal-line active" style="color: var(--success);">
            <span style="color: var(--success);">[0.45s]</span>
            <span>> Repository model compiled. Digital relic unlocked.</span>
          </div>
        ` : ''}
      </div>
    `;

    return container;
  }
}
