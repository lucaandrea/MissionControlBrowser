import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { MCPClient } from '../client/src/lib/mcp-client.js';

// small shim to test SSE parser
const client = new MCPClient('http://example.com');

async function collect(stream) {
  const arr = [];
  for await (const e of stream) arr.push(e);
  return arr;
}

test('parseSSE basic event', async () => {
  const data = 'event: log\ndata: "hello"\n\n';
  const resp = new Response(Readable.from([data]), { headers: { 'content-type': 'text/event-stream' } });
  const gen = client['parseSSE'](resp);
  const events = await collect(gen);
  assert.deepEqual(events, [{ type: 'log', data: '"hello"' }]);
});
