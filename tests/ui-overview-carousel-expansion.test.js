import { test, describe } from 'node:test';
import assert from 'node:assert';
import { OverviewView } from '../src/ui/views/OverviewView.js';

describe('OverviewView Carousel Expansion', () => {
  test('includes rich details for all new specialized lenses', () => {
    const view = new OverviewView({ repositoryState: { isLoaded: true } });

    const newLensIds = ['duplication', 'security', 'busfactor', 'techdebt', 'endpoints'];

    for (const id of newLensIds) {
      const details = view.getActionDetails(id);
      assert.ok(details, `Details should exist for ${id}`);
      assert.ok(details.title, `Title should exist for ${id}`);
      assert.ok(details.overview.length > 20, `Overview should be detailed for ${id}`);
      assert.strictEqual(details.questionsAnswered.length, 3, `Should have 3 questions for ${id}`);
      assert.strictEqual(details.capabilities.length, 4, `Should have 4 capabilities for ${id}`);
      assert.ok(details.useCase.length > 10, `Should have a use case for ${id}`);
    }
  });
});
