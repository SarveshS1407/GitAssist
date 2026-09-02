import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { StatCard } from '../src/ui/components/StatCard.js';
import { PageHeader } from '../src/ui/components/PageHeader.js';
import { RepositoryBadge } from '../src/ui/components/RepositoryBadge.js';

describe('UI Primitives Components Suite', () => {
  function createMockElement() {
    let _innerHTML = '';
    let _textContent = '';
    const children = [];

    return {
      className: '',
      set innerHTML(val) { _innerHTML = val; },
      get innerHTML() {
        return _innerHTML + children.map(c => c.innerHTML || c.textContent || '').join('');
      },
      set textContent(val) { _textContent = val; },
      get textContent() { return _textContent; },
      appendChild: (child) => {
        children.push(child);
      },
      addEventListener: () => {},
      querySelector: () => ({ addEventListener: () => {} }),
      querySelectorAll: () => []
    };
  }

  beforeEach(() => {
    global.document = {
      createElement: () => createMockElement()
    };
  });

  test('StatCard renders metrics, labels, trends, and icons correctly', () => {
    const card = new StatCard({
      label: 'Lines of Code',
      value: '19,358',
      subtext: 'Calculated source lines',
      icon: '📝',
      trend: '✓ HIGH HEALTH'
    });

    const el = card.render();
    assert.ok(el);
    assert.strictEqual(el.className, 'stat-card');
    assert.ok(el.innerHTML.includes('Lines of Code'));
    assert.ok(el.innerHTML.includes('19,358'));
    assert.ok(el.innerHTML.includes('HIGH HEALTH'));
  });

  test('PageHeader renders title, description, badge, and custom actions', () => {
    const header = new PageHeader({
      title: 'EXCAVATION SECTOR',
      description: 'Forensic AST & Strata Inspection',
      badge: 'ACTIVE',
      actions: [
        { label: 'EXPORT', icon: '💾', onClick: () => {} }
      ]
    });

    const el = header.render();
    assert.ok(el);
    assert.strictEqual(el.className, 'view-header');
    assert.ok(el.innerHTML.includes('EXCAVATION SECTOR'));
    assert.ok(el.innerHTML.includes('ACTIVE'));
  });

  test('RepositoryBadge displays active repository name and branch', () => {
    const badge = new RepositoryBadge({
      name: 'veritas-mortis',
      branch: 'main',
      isGit: true
    });

    const el = badge.render();
    assert.ok(el);
    assert.strictEqual(el.className, 'repo-badge');
    assert.ok(el.innerHTML.includes('veritas-mortis'));
    assert.ok(el.innerHTML.includes('main'));
  });
});
