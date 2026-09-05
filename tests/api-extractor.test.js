import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ApiExtractor } from '../src/core/api-extractor.js';

describe('ApiExtractor', () => {
  test('extracts Express style endpoints with methods', () => {
    const extractor = new ApiExtractor();
    const files = [
      {
        relativePath: 'src/routes/users.js',
        content: `
app.get('/api/users', (req, res) => {});
router.post('/api/users/create', (req, res) => {});
router.delete('/api/users/:id', (req, res) => {});
        `.trim()
      }
    ];

    const result = extractor.extract(files);
    assert.strictEqual(result.totalEndpoints, 3);
    assert.strictEqual(result.methods.GET, 1);
    assert.strictEqual(result.methods.POST, 1);
    assert.strictEqual(result.methods.DELETE, 1);

    const getEp = result.endpoints.find(e => e.path === '/api/users');
    assert.ok(getEp);
    assert.strictEqual(getEp.method, 'GET');
    assert.strictEqual(getEp.line, 1);
  });

  test('extracts Python Flask endpoints', () => {
    const extractor = new ApiExtractor();
    const files = [
      {
        relativePath: 'app.py',
        content: `
@app.route('/health', methods=['GET'])
def health():
    return {"status": "ok"}
        `.trim()
      }
    ];

    const result = extractor.extract(files);
    assert.strictEqual(result.totalEndpoints, 1);
    assert.strictEqual(result.endpoints[0].path, '/health');
    assert.strictEqual(result.endpoints[0].method, 'GET');
  });
});
