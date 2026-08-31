import http from 'node:http';
import path from 'node:path';
import url from 'node:url';
import { ApiRouter } from './api/routes.js';

const PORT = process.env.PORT || 3333;
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

const router = new ApiRouter(ROOT_DIR);

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  try {
    await router.handleRequest(req, res, parsedUrl);
  } catch (err) {
    console.error('[Server Error]', err);
    router.sendJson(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  ⚡ GitAssist Intelligence Server Running`);
  console.log(`  🔗 Local UI: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
