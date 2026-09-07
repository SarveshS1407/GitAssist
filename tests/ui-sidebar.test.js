import { test, describe } from 'node:test';
import assert from 'node:assert';
import { Sidebar } from '../src/ui/components/Sidebar.js';

describe('Sidebar Component Suite', () => {
  test('instantiates with 5 sectors and 25 total lenses', () => {
    const sidebar = new Sidebar({ activePage: 'overview' });
    assert.strictEqual(sidebar.sections.length, 5, 'Must have 5 sectors');

    const totalLenses = sidebar.sections.reduce((acc, sec) => acc + sec.items.length, 0);
    assert.strictEqual(totalLenses, 25, 'Must have 25 total tactical lenses');
  });

  test('auto-expands sector containing the active page', () => {
    const sidebar = new Sidebar({ activePage: 'techdebt' }); // techdebt is in 'quality' sector
    assert.ok(!sidebar.collapsedSections.has('quality'), 'Sector containing activePage must be expanded');
  });

  test('generates vector SVG markup for lenses without emojis', () => {
    const sidebar = new Sidebar({ activePage: 'overview' });
    const lensIds = ['overview', 'architecture', 'callgraph', 'impact', 'git', 'security', 'techdebt', 'endpoints'];

    for (const id of lensIds) {
      const svg = sidebar.getNavSvg(id, 15);
      assert.ok(svg.includes('<svg'), `Must produce svg tag for ${id}`);
      assert.ok(svg.includes('viewBox="0 0 24 24"'), `Must have standard viewBox for ${id}`);
      assert.ok(svg.includes('width="15"'), `Must respect size parameter for ${id}`);
    }
  });

  test('render generates organized accordion layout and search input', () => {
    const createMockElement = (tag) => {
      const el = {
        tagName: tag,
        className: '',
        style: {},
        children: [],
        innerHTML: '',
        classList: {
          add: () => {},
          remove: () => {},
          toggle: () => {}
        },
        appendChild: (c) => el.children.push(c),
        querySelectorAll: () => [],
        querySelector: () => createMockElement('div'),
        addEventListener: () => {}
      };
      return el;
    };

    const originalDoc = globalThis.document;
    globalThis.document = {
      createElement: createMockElement
    };

    try {
      const sidebar = new Sidebar({ activePage: 'overview' });
      const rendered = sidebar.render();
      assert.ok(rendered, 'Sidebar must render element');
      assert.ok(rendered.innerHTML.includes('FORENSIC COMMAND'), 'Must have brand header');
      assert.ok(rendered.innerHTML.includes('sidebar-filter-input'), 'Must have quick filter bar');
      assert.ok(rendered.innerHTML.includes('SEC 01'), 'Must display sector badge');
      assert.ok(rendered.innerHTML.includes('SEC 04'), 'Must display health & quality sector');
    } finally {
      if (!originalDoc) delete globalThis.document;
      else globalThis.document = originalDoc;
    }
  });
});
