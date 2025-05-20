import { test, expect } from '@playwright/test';
import express from 'express';
import { createServer } from 'http';
import { MockMCPServer, mockOutputs, mockManifest, mockLogs } from '../../client/src/mocks/mcp-server-mock';

const port = 3456;
let server;

test.beforeAll(async () => {
  const app = express();
  app.use(express.json());
  const mock = new MockMCPServer();
  app.get('/manifest', async (_req, res) => {
    const manifest = await mock.getManifest();
    res.json(manifest);
  });
  app.post('/tools/:slug', async (req, res) => {
    res.setHeader('Content-Type','text/event-stream');
    res.flushHeaders();
    const slug = req.params.slug;
    const logs = mockLogs[slug] || [];
    for (const l of logs) {
      res.write(`data: ${JSON.stringify({log:l})}\n\n`);
    }
    const out = mockOutputs[slug];
    res.write(`data: ${JSON.stringify(out)}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  });
  server = createServer(app);
  await new Promise(r => server.listen(port, r));
});

test.afterAll(async () => {
  await new Promise(r => server.close(r));
});

test('client can run tool via stream', async ({ request }) => {
  const resp = await request.get(`http://localhost:${port}/manifest`);
  expect(resp.ok()).toBeTruthy();
  const manifest = await resp.json();
  expect(manifest.tools.length).toBeGreaterThan(0);

  const exec = await request.post(`http://localhost:${port}/tools/text-summarizer`, {
    data: { input_text: 'a'.repeat(120) }
  });
  expect(exec.ok()).toBeTruthy();
});
