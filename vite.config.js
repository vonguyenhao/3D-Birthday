import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import unlockHandler from './api/unlock.js';
import memoryImagesHandler from './api/memory-images.js';

const readJsonBody = (request) =>
  new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
    });

    request.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    request.on('error', reject);
  });

function localUnlockApiPlugin() {
  const runHandler = async (handler, request, response) => {
    request.body = request.method === 'POST' ? await readJsonBody(request) : {};
    request.query = Object.fromEntries(new URL(request.url, 'http://localhost').searchParams.entries());

    const responseAdapter = {
      setHeader(name, value) {
        response.setHeader(name, value);
        return this;
      },
      status(code) {
        response.statusCode = code;
        return this;
      },
      json(payload) {
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(payload));
        return this;
      },
    };

    handler(request, responseAdapter);
  };

  return {
    name: 'local-unlock-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/unlock', async (request, response) => {
        try {
          await runHandler(unlockHandler, request, response);
        } catch {
          response.statusCode = 400;
          response.setHeader('Content-Type', 'application/json');
          response.end(
            JSON.stringify({
              success: false,
              message: 'Something went wrong while checking your answers. Please try again.',
            }),
          );
        }
      });

      server.middlewares.use('/api/memory-images', async (request, response) => {
        try {
          await runHandler(memoryImagesHandler, request, response);
        } catch {
          response.statusCode = 400;
          response.setHeader('Content-Type', 'application/json');
          response.end(
            JSON.stringify({
              success: false,
              message: 'Something went wrong while checking private memory image access.',
            }),
          );
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [react(), localUnlockApiPlugin()],
  };
});
