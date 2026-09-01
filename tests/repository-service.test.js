import { test, describe } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import url from 'node:url';
import { RepositoryService } from '../src/services/repository-service.js';
import { GitService } from '../src/services/git-service.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

describe('RepositoryService & GitService', () => {
  test('validates current valid repository directory', async () => {
    const result = await RepositoryService.validateRepository(ROOT_DIR);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.isGitRepository, true);
    assert.ok(result.name);
    assert.ok(result.branch);
  });

  test('handles non-existent path gracefully', async () => {
    const result = await RepositoryService.validateRepository('/non/existent/path/for/sure');
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('Directory does not exist'));
  });

  test('handles null or invalid path types safely', async () => {
    const result = await RepositoryService.validateRepository(null);
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('valid filesystem path'));
  });

  test('opens and scans repository returning complete metadata', async () => {
    const result = await RepositoryService.openRepository(ROOT_DIR);
    assert.ok(result.summary);
    assert.strictEqual(result.summary.name, 'gitassist');
    assert.ok(result.files.length > 0);
    assert.ok(result.summary.totalLines > 0);
    assert.ok(result.summary.avgMaintainability > 0);
    assert.ok(Array.isArray(result.dependencyGraph.nodes));
    assert.ok(Array.isArray(result.hotspots));
  });

  test('GitService returns branch and commit history in read-only mode', async () => {
    const gitService = new GitService(ROOT_DIR);
    const branch = await gitService.getCurrentBranch();
    assert.ok(branch);

    const commits = await gitService.getCommits(10);
    assert.ok(Array.isArray(commits));
    assert.ok(commits.length > 0);

    const treeStatus = await gitService.getWorkingTreeStatus();
    assert.ok(typeof treeStatus.clean === 'boolean');
  });
});
