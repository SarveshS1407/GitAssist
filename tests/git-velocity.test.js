import { test, describe } from 'node:test';
import assert from 'node:assert';
import { GitService } from '../src/services/git-service.js';

describe('GitService Velocity & Contributor Analytics', () => {
  test('calculates steady velocity and cadence from commit history', async () => {
    const gitService = new GitService(process.cwd());
    const velocity = await gitService.getCommitVelocity(20);

    assert.ok(velocity);
    assert.ok(velocity.totalCommits >= 0);
    assert.ok(typeof velocity.velocityScore === 'string');
    assert.ok(['HYPERACTIVE', 'HIGH VELOCITY', 'STEADY', 'MODERATE', 'LOW CADENCE', 'QUIESCENT'].includes(velocity.velocityScore));
  });

  test('extracts author distribution and percentage shares', async () => {
    const gitService = new GitService(process.cwd());
    const stats = await gitService.getAuthorStats(50);

    assert.ok(Array.isArray(stats));
    if (stats.length > 0) {
      assert.ok(stats[0].name);
      assert.ok(stats[0].commitsCount > 0);
      assert.ok(typeof stats[0].percentage === 'number');
    }
  });
});
