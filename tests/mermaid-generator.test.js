import { test, describe } from 'node:test';
import assert from 'node:assert';
import { MermaidGenerator } from '../src/core/mermaid-generator.js';

describe('MermaidGenerator', () => {
  test('generates flowchart from module dependency graph', () => {
    const dependencyGraph = {
      modules: [{ name: 'core' }, { name: 'ui' }],
      nodes: [
        { id: 'src/core/parser.js', label: 'parser.js', module: 'core' },
        { id: 'src/ui/app.js', label: 'app.js', module: 'ui' }
      ],
      edges: [
        { source: 'src/ui/app.js', target: 'src/core/parser.js' }
      ]
    };

    const mermaid = MermaidGenerator.generateModuleFlowchart(dependencyGraph);
    assert.ok(mermaid.startsWith('flowchart TD'));
    assert.ok(mermaid.includes('subgraph core'));
    assert.ok(mermaid.includes('subgraph ui'));
    assert.ok(mermaid.includes('-->'));
  });

  test('generates class diagram from parsed symbols', () => {
    const files = [
      {
        language: 'JavaScript',
        symbols: [
          { name: 'GitAnalyzer', kind: 'class' },
          { name: 'parseCode', kind: 'function' }
        ]
      }
    ];

    const diagram = MermaidGenerator.generateClassDiagram(files);
    assert.ok(diagram.startsWith('classDiagram'));
    assert.ok(diagram.includes('class GitAnalyzer'));
  });
});
