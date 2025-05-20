import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MCPClient, createToolExecution, completeToolExecution } from '../client/src/lib/mcp-client';

// mock fetch for executeTool
let fetchCalls: Array<{url: string, options?: any}> = [];

(global as any).fetch = async (url: string, options: any) => {
  fetchCalls.push({url, options});
  const body = JSON.stringify({ ok: true });
  return new Response(body, {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
};

test('create and complete execution', () => {
  const exec = createToolExecution('tool','Tool','http://srv',{a:1});
  assert.equal(exec.status, 'running');
  const done = completeToolExecution(exec, true, {done: true});
  assert.equal(done.status, 'completed');
  assert.deepEqual(done.outputs, {done: true});
});

test('executeTool sends request and yields result', async () => {
  const client = new MCPClient('http://srv');
  const gen = client.executeTool('tool', {a:1});
  const { value, done } = await gen.next();
  assert.ok(!done);
  assert.deepEqual(value, { success: true, result: { ok: true }, logs: [] });
  assert.equal(fetchCalls[0].url, 'http://srv/tools/tool');
});
