import { test, describe } from 'node:test';
import assert from 'node:assert';
import { CircularDependencyDetector } from '../src/core/circular-detector.js';
import { MermaidGenerator } from '../src/core/mermaid-generator.js';

describe('CircularDependencyDetector', () => {
  test('detects simple circular import loop A -> B -> A', () => {
    const edges = [
      { source: 'a.js', target: 'b.js' },
      { source: 'b.js', target: 'a.js' }
    ];

    const cycles = CircularDependencyDetector.detectCycles(edges);
    assert.ok(cycles.length > 0, 'Should detect cycle between a.js and b.js');
  });

  test('returns empty when graph is a DAG (no cycles)', () => {
    const edges = [
      { source: 'a.js', target: 'b.js' },
      { source: 'b.js', target: 'c.js' }
    ];

    const cycles = CircularDependencyDetector.detectCycles(edges);
    assert.strictEqual(cycles.length, 0);
  });
});

describe('MermaidGenerator', () => {
  test('generates valid flowchart with nodes and subgraphs', () => {
    const graph = {
      nodes: [{ id: 'src/main.js', label: 'main.js', module: 'src' }],
      edges: [{ source: 'src/main.js', target: 'src/utils.js' }],
      modules: ['src']
    };

    const mermaidText = MermaidGenerator.generateModuleFlowchart(graph);
    assert.ok(mermaidText.includes('flowchart TD'));
    assert.ok(mermaidText.includes('subgraph'));
    assert.ok(mermaidText.includes('-->'));
  });
});
