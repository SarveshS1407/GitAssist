import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';

/**
 * Call Graph View
 * Interactive symbol-level call graph, bidirectional caller/callee traversal,
 * execution path tracing, and fan-in/fan-out centrality analytics.
 */
export class CallGraphView {
  constructor({ repositoryState, onNavigate }) {
    this.repositoryState = repositoryState;
    this.onNavigate = onNavigate;
    this.activeSymbol = null;
    this.traversalDepth = 2;
    this.traversalDirection = 'both'; // 'both' | 'callers' | 'callees'
    this.allSymbols = [];
    this.selectedNode = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'view-container';

    const header = new PageHeader({
      title: 'Symbol Call Graph & Execution Topology',
      description: 'Bidirectional caller/callee traversal, fan-in/fan-out metrics, and invocation flow paths across functions, methods, and classes.',
      badge: 'Symbol Graph'
    });
    container.appendChild(header.render());

    if (!this.repositoryState || !this.repositoryState.isLoaded) {
      container.appendChild(new EmptyState({
        icon: '⚡',
        title: 'NO REPOSITORY LOADED',
        description: 'Open a local repository from the Central Telemetry overview to construct symbol-level call graphs.'
      }).render());
      return container;
    }

    const mainDeck = document.createElement('div');
    mainDeck.className = 'landing-card';
    mainDeck.style.display = 'flex';
    mainDeck.style.flexDirection = 'column';
    mainDeck.style.gap = '16px';

    mainDeck.innerHTML = `
      <!-- Controls Toolbar -->
      <div class="callgraph-toolbar" style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-holo); padding-bottom: 14px;">
        <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; flex: 1;">
          <div style="position: relative; min-width: 260px; flex: 1;">
            <label style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 4px;">FOCUS SYMBOL (FUNCTION / METHOD):</label>
            <input type="text" id="callgraph-symbol-input" 
              placeholder="Type symbol or select (e.g. handleRequest, parseFile)..."
              style="width: 100%; padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-holo); border-radius: 6px; color: var(--text-primary); font-family: var(--font-mono); font-size: 0.82rem;" />
            <div id="callgraph-autocomplete" class="callgraph-autocomplete" style="display: none;"></div>
          </div>

          <div>
            <label style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 4px;">DIRECTION:</label>
            <select id="callgraph-direction" style="padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-holo); border-radius: 6px; color: var(--text-primary); font-family: var(--font-mono); font-size: 0.82rem;">
              <option value="both" selected>Bidirectional (Inbound + Outbound)</option>
              <option value="callers">Callers Only (Who calls this)</option>
              <option value="callees">Callees Only (What this calls)</option>
            </select>
          </div>

          <div>
            <label style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 4px;">DEPTH:</label>
            <select id="callgraph-depth" style="padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-holo); border-radius: 6px; color: var(--text-primary); font-family: var(--font-mono); font-size: 0.82rem;">
              <option value="1">1 Hop (Direct Only)</option>
              <option value="2" selected>2 Hops (Default)</option>
              <option value="3">3 Hops (Deep Trace)</option>
              <option value="4">4 Hops (System Wide)</option>
            </select>
          </div>

          <div style="align-self: flex-end;">
            <button class="btn-primary" id="btn-refresh-callgraph" style="padding: 8px 16px; font-size: 0.8rem; height: 34px;">
              <span>⚡</span>
              <span>RENDER GRAPH</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Metrics & Centrality Bar -->
      <div id="callgraph-metrics-deck" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
        <div class="stat-card" style="padding: 10px 14px;">
          <div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">ROOT FOCUS SYMBOL</div>
          <div id="stat-root-name" style="font-size: 1.1rem; font-weight: 800; color: var(--accent-cyan); font-family: var(--font-mono); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">-</div>
          <div id="stat-root-file" style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">-</div>
        </div>
        <div class="stat-card" style="padding: 10px 14px;">
          <div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">INBOUND CALLERS (FAN-IN)</div>
          <div id="stat-callers-count" style="font-size: 1.3rem; font-weight: 800; color: var(--accent-emerald, #34d399); font-family: var(--font-mono); margin-top: 2px;">0</div>
          <div style="font-size: 0.7rem; color: var(--text-secondary);">Direct & transitive callers</div>
        </div>
        <div class="stat-card" style="padding: 10px 14px;">
          <div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">OUTBOUND CALLEES (FAN-OUT)</div>
          <div id="stat-callees-count" style="font-size: 1.3rem; font-weight: 800; color: var(--accent-neural, #c084fc); font-family: var(--font-mono); margin-top: 2px;">0</div>
          <div style="font-size: 0.7rem; color: var(--text-secondary);">Functions & methods invoked</div>
        </div>
        <div class="stat-card" style="padding: 10px 14px;">
          <div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">TOTAL GRAPH REACH</div>
          <div id="stat-total-nodes" style="font-size: 1.3rem; font-weight: 800; color: var(--accent-amber, #fbbf24); font-family: var(--font-mono); margin-top: 2px;">0</div>
          <div id="stat-depth-label" style="font-size: 0.7rem; color: var(--text-secondary);">Across 2 hops</div>
        </div>
      </div>

      <!-- Top Central Hubs Pills -->
      <div id="callgraph-hubs-bar" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; background: rgba(0,0,0,0.25); border: 1px solid var(--border-holo); border-radius: 6px; padding: 8px 12px;">
        <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">⚡ TOP CALL HUBS:</span>
        <div id="callgraph-hubs-pills" style="display: flex; gap: 6px; flex-wrap: wrap;">
          <span style="font-size: 0.72rem; color: var(--text-muted);">Loading call hubs...</span>
        </div>
      </div>

      <!-- Main Graph Canvas & Inspector Grid -->
      <div style="display: grid; grid-template-columns: 1fr 320px; gap: 16px; min-height: 480px;">
        <!-- Canvas Stage -->
        <div id="callgraph-stage" style="background: radial-gradient(circle at center, rgba(13, 19, 33, 0.95) 0%, rgba(5, 7, 13, 0.98) 100%); border: 1px solid var(--border-holo); border-radius: 8px; padding: 20px; position: relative; overflow: auto; display: flex; flex-direction: column;">
          <div id="callgraph-canvas-container" style="display: flex; justify-content: space-around; align-items: center; min-height: 420px; gap: 24px; position: relative;">
            <p style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">Constructing symbol call graph...</p>
          </div>
        </div>

        <!-- Symbol Inspector Drawer -->
        <div id="callgraph-inspector" style="background: var(--bg-blade); border: 1px solid var(--border-holo); border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 14px;">
          <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); border-bottom: 1px solid var(--border-holo); padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span>SYMBOL INSPECTOR</span>
            <span id="inspector-badge" class="badge" style="background: rgba(0,240,255,0.1); color: var(--accent-cyan); font-size: 0.65rem;">ACTIVE</span>
          </div>

          <div id="inspector-content">
            <p style="color: var(--text-muted); font-size: 0.8rem;">Select any node in the graph to inspect caller/callee telemetry, signature, and source location.</p>
          </div>
        </div>
      </div>
    `;

    container.appendChild(mainDeck);

    // Wire up events and data loading
    this.initData(mainDeck);

    return container;
  }

  async initData(dom) {
    const symbolInput = dom.querySelector('#callgraph-symbol-input');
    const autocompleteEl = dom.querySelector('#callgraph-autocomplete');
    const directionSelect = dom.querySelector('#callgraph-direction');
    const depthSelect = dom.querySelector('#callgraph-depth');
    const btnRefresh = dom.querySelector('#btn-refresh-callgraph');

    if (typeof window === 'undefined') return;

    // 1. Fetch available symbols for autocomplete
    try {
      const symRes = await fetch('/api/symbols?limit=250');
      const symData = await symRes.json();
      this.allSymbols = symData.symbols || [];
    } catch {
      this.allSymbols = [];
    }

    // 2. Fetch top call hubs
    try {
      const metricRes = await fetch('/api/call-graph/metrics?limit=6');
      const metricData = await metricRes.json();
      this.renderHubs(dom, metricData.topCalled || []);
    } catch {
      // silent in headless/offline
    }

    // Autocomplete handler
    symbolInput.addEventListener('input', () => {
      const q = symbolInput.value.trim().toLowerCase();
      if (!q || q.length < 2) {
        autocompleteEl.style.display = 'none';
        return;
      }

      const matches = this.allSymbols
        .filter(s => s.name.toLowerCase().includes(q) || s.qualifiedName.toLowerCase().includes(q))
        .slice(0, 8);

      if (matches.length === 0) {
        autocompleteEl.style.display = 'none';
        return;
      }

      autocompleteEl.innerHTML = matches.map(s => `
        <div class="autocomplete-item" data-sym="${s.qualifiedName}">
          <span style="color: var(--accent-cyan); font-weight: 700;">${s.name}</span>
          <span style="font-size: 0.72rem; color: var(--text-muted); margin-left: 6px;">(${s.kind} in ${s.file})</span>
        </div>
      `).join('');
      autocompleteEl.style.display = 'block';

      autocompleteEl.querySelectorAll('.autocomplete-item').forEach(el => {
        el.addEventListener('click', () => {
          symbolInput.value = el.dataset.sym;
          autocompleteEl.style.display = 'none';
          this.loadCallGraph(dom, symbolInput.value);
        });
      });
    });

    document.addEventListener('click', (e) => {
      if (!symbolInput.contains(e.target) && !autocompleteEl.contains(e.target)) {
        autocompleteEl.style.display = 'none';
      }
    });

    btnRefresh.addEventListener('click', () => {
      this.traversalDirection = directionSelect.value;
      this.traversalDepth = parseInt(depthSelect.value, 10);
      this.loadCallGraph(dom, symbolInput.value.trim());
    });

    directionSelect.addEventListener('change', () => {
      this.traversalDirection = directionSelect.value;
      this.loadCallGraph(dom, symbolInput.value.trim());
    });

    depthSelect.addEventListener('change', () => {
      this.traversalDepth = parseInt(depthSelect.value, 10);
      this.loadCallGraph(dom, symbolInput.value.trim());
    });

    // Initial Load
    this.loadCallGraph(dom);
  }

  renderHubs(dom, topCalled) {
    const hubsContainer = dom.querySelector('#callgraph-hubs-pills');
    if (!hubsContainer || topCalled.length === 0) return;

    hubsContainer.innerHTML = topCalled.map(hub => `
      <button class="callgraph-hub-pill" data-sym="${hub.symbol.qualifiedName}" style="padding: 3px 8px; border-radius: 4px; background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.25); color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.72rem; cursor: pointer;">
        ⚡ ${hub.symbol.name} <span style="color: var(--text-muted);">(${hub.count} calls)</span>
      </button>
    `).join('');

    hubsContainer.querySelectorAll('.callgraph-hub-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const sym = btn.dataset.sym;
        const input = dom.querySelector('#callgraph-symbol-input');
        if (input) input.value = sym;
        this.loadCallGraph(dom, sym);
      });
    });
  }

  async loadCallGraph(dom, symbolRef = '') {
    const stage = dom.querySelector('#callgraph-canvas-container');
    stage.innerHTML = '<p style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">Constructing symbol call graph...</p>';

    try {
      const url = `/api/call-graph?symbol=${encodeURIComponent(symbolRef)}&depth=${this.traversalDepth}&direction=${this.traversalDirection}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.root) {
        stage.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No symbol calls found for query: "${symbolRef}". Try selecting a top hub or another function.</p>`;
        return;
      }

      this.activeSymbol = data.root;
      const symbolInput = dom.querySelector('#callgraph-symbol-input');
      if (symbolInput && !symbolRef) {
        symbolInput.value = data.root.qualifiedName;
      }

      this.updateStats(dom, data);
      this.renderGraphTree(dom, data);
      this.renderInspector(dom, data.root);
    } catch (err) {
      stage.innerHTML = `<p style="color: var(--danger); font-size: 0.85rem;">Failed to load call graph: ${err.message}</p>`;
    }
  }

  updateStats(dom, data) {
    const rootName = dom.querySelector('#stat-root-name');
    const rootFile = dom.querySelector('#stat-root-file');
    const callersCount = dom.querySelector('#stat-callers-count');
    const calleesCount = dom.querySelector('#stat-callees-count');
    const totalNodes = dom.querySelector('#stat-total-nodes');
    const depthLabel = dom.querySelector('#stat-depth-label');

    if (rootName) rootName.textContent = data.root.name;
    if (rootFile) rootFile.textContent = `${data.root.file}:${data.root.lineStart || 1}`;
    if (callersCount) callersCount.textContent = data.stats.callerCount;
    if (calleesCount) calleesCount.textContent = data.stats.calleeCount;
    if (totalNodes) totalNodes.textContent = data.stats.totalNodes;
    if (depthLabel) depthLabel.textContent = `Across ${this.traversalDepth} hop${this.traversalDepth > 1 ? 's' : ''} (${this.traversalDirection})`;
  }

  renderGraphTree(dom, data) {
    const stage = dom.querySelector('#callgraph-canvas-container');
    stage.innerHTML = '';

    const callers = data.nodes.filter(n => n.direction === 'caller');
    const callees = data.nodes.filter(n => n.direction === 'callee');
    const root = data.root;

    const layoutContainer = document.createElement('div');
    layoutContainer.style.display = 'flex';
    layoutContainer.style.width = '100%';
    layoutContainer.style.justifyContent = 'space-between';
    layoutContainer.style.alignItems = 'center';
    layoutContainer.style.gap = '32px';

    // 1. Inbound Callers Column
    const callersCol = document.createElement('div');
    callersCol.style.flex = '1';
    callersCol.style.display = 'flex';
    callersCol.style.flexDirection = 'column';
    callersCol.style.gap = '10px';

    const callersHeader = document.createElement('div');
    callersHeader.style.fontFamily = 'var(--font-mono)';
    callersHeader.style.fontSize = '0.75rem';
    callersHeader.style.fontWeight = '700';
    callersHeader.style.color = 'var(--accent-emerald, #34d399)';
    callersHeader.style.marginBottom = '6px';
    callersHeader.innerHTML = `⬅ INBOUND CALLERS (${callers.length})`;
    callersCol.appendChild(callersHeader);

    if (callers.length === 0) {
      callersCol.innerHTML += '<div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); padding: 8px; border: 1px dashed var(--border-holo); border-radius: 6px;">No callers detected (Entrypoint or isolated)</div>';
    } else {
      callers.forEach(c => {
        const nodeEl = this.createNodeElement(c, 'caller', dom);
        callersCol.appendChild(nodeEl);
      });
    }

    // 2. Central Root Symbol Node
    const rootCol = document.createElement('div');
    rootCol.style.display = 'flex';
    rootCol.style.flexDirection = 'column';
    rootCol.style.alignItems = 'center';
    rootCol.style.justifyContent = 'center';
    rootCol.style.padding = '0 16px';

    const rootNodeEl = document.createElement('div');
    rootNodeEl.className = 'callgraph-root-node';
    rootNodeEl.style.background = 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(176, 38, 255, 0.15))';
    rootNodeEl.style.border = '2px solid var(--accent-cyan)';
    rootNodeEl.style.boxShadow = '0 0 25px rgba(0, 240, 255, 0.35)';
    rootNodeEl.style.borderRadius = '10px';
    rootNodeEl.style.padding = '16px 20px';
    rootNodeEl.style.textAlign = 'center';
    rootNodeEl.style.minWidth = '220px';

    rootNodeEl.innerHTML = `
      <div style="font-size: 0.65rem; color: var(--accent-cyan); font-family: var(--font-mono); font-weight: 800; letter-spacing: 1px;">CURRENT FOCUS ROOT</div>
      <div style="font-size: 1.15rem; font-weight: 900; color: #fff; font-family: var(--font-mono); margin: 6px 0;">${root.name}</div>
      <div style="font-size: 0.75rem; color: var(--text-secondary); font-family: var(--font-mono);">${root.parentClass ? `${root.parentClass} • ` : ''}${root.kind}</div>
      <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 6px;">${root.file}</div>
    `;

    rootNodeEl.addEventListener('click', () => this.renderInspector(dom, root));
    rootCol.appendChild(rootNodeEl);

    // 3. Outbound Callees Column
    const calleesCol = document.createElement('div');
    calleesCol.style.flex = '1';
    calleesCol.style.display = 'flex';
    calleesCol.style.flexDirection = 'column';
    calleesCol.style.gap = '10px';

    const calleesHeader = document.createElement('div');
    calleesHeader.style.fontFamily = 'var(--font-mono)';
    calleesHeader.style.fontSize = '0.75rem';
    calleesHeader.style.fontWeight = '700';
    calleesHeader.style.color = 'var(--accent-neural, #c084fc)';
    calleesHeader.style.marginBottom = '6px';
    calleesHeader.innerHTML = `OUTBOUND CALLEES (${callees.length}) ➡`;
    calleesCol.appendChild(calleesHeader);

    if (callees.length === 0) {
      calleesCol.innerHTML += '<div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); padding: 8px; border: 1px dashed var(--border-holo); border-radius: 6px;">No outgoing calls (Leaf operation)</div>';
    } else {
      callees.forEach(c => {
        const nodeEl = this.createNodeElement(c, 'callee', dom);
        calleesCol.appendChild(nodeEl);
      });
    }

    layoutContainer.appendChild(callersCol);
    layoutContainer.appendChild(rootCol);
    layoutContainer.appendChild(calleesCol);

    stage.appendChild(layoutContainer);
  }

  createNodeElement(node, role, dom) {
    const el = document.createElement('div');
    el.className = 'callgraph-node-card';
    const isCaller = role === 'caller';
    const accent = isCaller ? 'var(--accent-emerald, #34d399)' : 'var(--accent-neural, #c084fc)';

    el.style.background = 'var(--bg-blade)';
    el.style.border = `1px solid ${accent}`;
    el.style.borderRadius = '6px';
    el.style.padding = '10px 12px';
    el.style.cursor = 'pointer';
    el.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';

    el.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.85rem; font-weight: 800; color: #fff; font-family: var(--font-mono);">${node.name}</span>
        <span class="badge" style="font-size: 0.65rem; color: ${accent}; border: 1px solid ${accent}; background: rgba(0,0,0,0.3);">${node.kind || 'fn'}</span>
      </div>
      <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        ${node.parentClass ? `${node.parentClass} • ` : ''}${node.file}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 0.68rem; color: var(--text-muted); font-family: var(--font-mono);">
        <span>Depth: ${node.depth || 1} hop</span>
        <span style="color: var(--accent-cyan);">Click to refocus ⚡</span>
      </div>
    `;

    el.addEventListener('mouseenter', () => {
      el.style.transform = 'translateX(4px)';
      el.style.boxShadow = `0 0 12px ${accent}`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'none';
      el.style.boxShadow = 'none';
    });

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      this.renderInspector(dom, node);
      // Double click or explicit focus
      const symbolInput = dom.querySelector('#callgraph-symbol-input');
      if (symbolInput) symbolInput.value = node.qualifiedName;
      this.loadCallGraph(dom, node.qualifiedName);
    });

    return el;
  }

  renderInspector(dom, symbol) {
    const container = dom.querySelector('#inspector-content');
    if (!container || !symbol) return;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div>
          <div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">QUALIFIED SYMBOL</div>
          <div style="font-size: 0.95rem; font-weight: 800; color: var(--accent-cyan); font-family: var(--font-mono); word-break: break-all;">
            ${symbol.qualifiedName || symbol.name}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div style="background: rgba(0,0,0,0.25); padding: 6px 10px; border-radius: 4px; border: 1px solid var(--border-holo);">
            <div style="font-size: 0.65rem; color: var(--text-muted);">KIND</div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #fff;">${symbol.kind || 'function'}</div>
          </div>
          <div style="background: rgba(0,0,0,0.25); padding: 6px 10px; border-radius: 4px; border: 1px solid var(--border-holo);">
            <div style="font-size: 0.65rem; color: var(--text-muted);">LINES</div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #fff;">L${symbol.lineStart || 1} - L${symbol.lineEnd || symbol.lineStart || 1}</div>
          </div>
        </div>

        <div>
          <div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">SOURCE FILE</div>
          <div style="font-size: 0.75rem; color: var(--text-primary); font-family: var(--font-mono); word-break: break-all; margin-top: 2px;">
            ${symbol.file}
          </div>
        </div>

        ${symbol.signature ? `
          <div>
            <div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">SIGNATURE</div>
            <div style="font-size: 0.72rem; color: var(--accent-amber, #fbbf24); font-family: var(--font-mono); background: rgba(0,0,0,0.4); padding: 6px 8px; border-radius: 4px; margin-top: 2px; overflow-x: auto;">
              <code>${symbol.signature}</code>
            </div>
          </div>
        ` : ''}

        ${symbol.calls && symbol.calls.length > 0 ? `
          <div>
            <div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">INVOCATIONS RECORDED (${symbol.calls.length})</div>
            <div style="max-height: 120px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
              ${symbol.calls.slice(0, 10).map(c => `
                <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-secondary); background: rgba(255,255,255,0.03); padding: 3px 6px; border-radius: 3px;">
                  • <code>${c.fullCall}()</code> (line ${c.line})
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 6px;">
          <button class="btn-primary" id="btn-focus-symbol" style="padding: 6px 12px; font-size: 0.75rem;">
            <span>⚡</span>
            <span>FOCUS THIS SYMBOL</span>
          </button>
        </div>
      </div>
    `;

    const focusBtn = container.querySelector('#btn-focus-symbol');
    if (focusBtn) {
      focusBtn.addEventListener('click', () => {
        const input = dom.querySelector('#callgraph-symbol-input');
        if (input) input.value = symbol.qualifiedName;
        this.loadCallGraph(dom, symbol.qualifiedName);
      });
    }
  }
}
