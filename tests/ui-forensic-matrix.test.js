import { test, describe } from 'node:test';
import assert from 'node:assert';
import { OverviewView } from '../src/ui/views/OverviewView.js';

describe('Forensic Investigation Matrix Suite', () => {
  const allLensIds = [
    'architecture', 'impact', 'explorer', 'search', 'git', 'analysis',
    'archaeology', 'risk', 'features', 'tests', 'bugs', 'deadcode',
    'manifests', 'review', 'documentation', 'ai', 'duplication',
    'security', 'busfactor', 'techdebt', 'endpoints'
  ];

  test('all 21 forensic lenses generate vector SVG icons with stroke-width 2.2', () => {
    const view = new OverviewView({ repositoryState: { isLoaded: true } });

    for (const id of allLensIds) {
      const svg = view.getSvgIcon(id, 28);
      assert.ok(svg.includes('<svg'), `SVG tag must exist for ${id}`);
      assert.ok(svg.includes('stroke-width="2.2"'), `stroke-width must be 2.2 for ${id}`);
      assert.ok(svg.includes('viewBox="0 0 24 24"'), `viewBox must be 0 0 24 24 for ${id}`);
      assert.ok(svg.includes('width="28"'), `width must match size for ${id}`);
      assert.ok(svg.includes('</svg>'), `closing svg tag must exist for ${id}`);
    }
  });

  test('render generates professional Forensic Investigation Matrix markup', () => {
    const createMockElement = (tag) => {
      const el = {
        tagName: tag,
        className: '',
        style: {},
        children: [],
        innerHTML: '',
        classList: { add: () => {}, remove: () => {} },
        appendChild: (c) => el.children.push(c),
        querySelectorAll: () => [],
        querySelector: () => createMockElement('div'),
        addEventListener: () => {}
      };
      return el;
    };

    const originalDoc = globalThis.document;
    const originalWin = globalThis.window;
    globalThis.document = {
      createElement: createMockElement
    };
    globalThis.window = {
      addEventListener: () => {},
      removeEventListener: () => {}
    };

    try {
      const mockState = {
        isLoaded: true,
        repository: {
          languages: { JavaScript: { percentage: 100, files: 10, lines: 500 } }
        }
      };

      const view = new OverviewView({ repositoryState: mockState });
      const rendered = view.render();

      assert.ok(rendered);
      assert.strictEqual(rendered.className, 'view-container');

      // Verify the HTML templates generated on the sections
      const carouselSection = rendered.children.find(c => c.className === 'holomap-canvas-container');
      assert.ok(carouselSection, 'carouselSection must exist');
      assert.ok(carouselSection.innerHTML.includes('FORENSIC INVESTIGATION MATRIX // 3D STRATA ROTOR'), 'Must contain updated title');
      assert.ok(carouselSection.innerHTML.includes('[ORBITAL ROTOR • ARROWS • SELECT LENS]'), 'Must contain updated badge');
      assert.ok(!carouselSection.innerHTML.includes('MERRY-GO-ROUND'), 'Must not contain MERRY-GO-ROUND');
      assert.ok(!carouselSection.innerHTML.includes('HOLOGRAPHIC ACTION CAROUSEL'), 'Must not contain ACTION CAROUSEL');

      // Verify all 21 lens cards exist in HTML
      for (const id of allLensIds) {
        assert.ok(carouselSection.innerHTML.includes(`data-action="${id}"`), `Must contain action button for ${id}`);
      }
    } finally {
      if (!originalDoc) delete globalThis.document;
      else globalThis.document = originalDoc;

      if (!originalWin) delete globalThis.window;
      else globalThis.window = originalWin;
    }
  });

  test('getActionDetails provides rich telemetry for all 21 lenses', () => {
    const view = new OverviewView({ repositoryState: { isLoaded: true } });

    for (const id of allLensIds) {
      const details = view.getActionDetails(id);
      assert.ok(details, `Details must exist for ${id}`);
      assert.ok(details.title, `Title must exist for ${id}`);
      assert.ok(details.tagline, `Tagline must exist for ${id}`);
      assert.ok(details.cta, `CTA must exist for ${id}`);
    }
  });
});
