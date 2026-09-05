/**
 * ApiExtractor
 * Automatically extracts HTTP routes and API endpoints across multi-framework codebases.
 */
export class ApiExtractor {
  constructor() {
    this.routePatterns = [
      // 1. Express / Router / Fastify / Koa: app.get('/path', ...), router.post('/path', ...)
      {
        framework: 'Express/Fastify',
        regex: /(?:app|router|server)\s*\.\s*(get|post|put|delete|patch|options|head|all)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
        extract: (match) => {
          const parts = [...match.matchAll(/(?:app|router|server)\s*\.\s*(get|post|put|delete|patch|options|head|all)\s*\(\s*['"`]([^'"`]+)['"`]/gi)];
          return parts.map(p => ({ method: p[1].toUpperCase(), path: p[2] }));
        }
      },
      // 2. Custom Node HTTP handler matching: pathname === '/api/...'
      {
        framework: 'Node/HTTP',
        regex: /pathname\s*===?\s*['"`]([^'"`]+)['"`]/gi,
        extract: (match, line) => {
          const methodMatch = line.match(/req\.method\s*===?\s*['"`](GET|POST|PUT|DELETE|PATCH)['"`]/i);
          const method = methodMatch ? methodMatch[1].toUpperCase() : 'ANY';
          const paths = [...match.matchAll(/pathname\s*===?\s*['"`]([^'"`]+)['"`]/gi)];
          return paths.map(p => ({ method, path: p[1] }));
        }
      },
      // 3. Python Flask / FastAPI: @app.route('/path', methods=['GET']) or @app.get('/path')
      {
        framework: 'Flask/FastAPI',
        regex: /@(?:app|router|bp)\s*\.\s*(get|post|put|delete|patch|route)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
        extract: (match, line) => {
          const parts = [...match.matchAll(/@(?:app|router|bp)\s*\.\s*(get|post|put|delete|patch|route)\s*\(\s*['"`]([^'"`]+)['"`]/gi)];
          return parts.map(p => {
            let method = p[1].toUpperCase();
            if (method === 'ROUTE') {
              const m = line.match(/methods\s*=\s*\[\s*['"`]([A-Z]+)['"`]/i);
              method = m ? m[1].toUpperCase() : 'GET';
            }
            return { method, path: p[2] };
          });
        }
      }
    ];
  }

  /**
   * Extract endpoints across repository files
   * @param {Array<{ relativePath: string, content: string }>} files
   * @returns {{ totalEndpoints: number, methods: Object, endpoints: Array }}
   */
  extract(files = []) {
    const endpoints = [];
    const methodsCount = { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0, OTHER: 0 };
    const seen = new Set();

    for (const file of files) {
      if (!file || !file.content || typeof file.content !== 'string') continue;

      const lines = file.content.split(/\r?\n/);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line || line.trim().startsWith('//') || line.trim().startsWith('#')) continue;

        for (const pattern of this.routePatterns) {
          if (pattern.regex.test(line)) {
            pattern.regex.lastIndex = 0; // reset regex state
            const matches = pattern.extract(line, line);

            for (const m of matches) {
              const key = `${m.method}:${m.path}:${file.relativePath}`;
              if (!seen.has(key)) {
                seen.add(key);

                const methodKey = methodsCount[m.method] !== undefined ? m.method : 'OTHER';
                methodsCount[methodKey]++;

                endpoints.push({
                  method: m.method,
                  path: m.path,
                  file: file.relativePath,
                  line: i + 1,
                  framework: pattern.framework
                });
              }
            }
          }
        }
      }
    }

    // Sort endpoints alphabetically by path
    endpoints.sort((a, b) => a.path.localeCompare(b.path));

    return {
      totalEndpoints: endpoints.length,
      methods: methodsCount,
      endpoints
    };
  }
}
