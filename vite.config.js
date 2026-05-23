import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

const mockDbPath = path.resolve(process.cwd(), 'local_database.json');

const dbSyncPlugin = () => ({
  name: 'db-sync',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/sync') {
        if (req.method === 'GET') {
          if (!fs.existsSync(mockDbPath)) {
            fs.writeFileSync(mockDbPath, JSON.stringify({}));
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(fs.readFileSync(mockDbPath, 'utf8'));
        } else if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            fs.writeFileSync(mockDbPath, body);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          });
        }
      } else {
        next();
      }
    });
  }
});

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  plugins: [dbSyncPlugin()]
});
