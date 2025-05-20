import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadHistory, saveServer, saveAuthToken, getAuthToken, saveExecution, clearHistory } from '../client/src/lib/storage';

// mock localStorage
const store: Record<string,string> = {};
(global as any).localStorage = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k]=v; },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k=>delete store[k]); }
};

test('save and load server', () => {
  saveServer({ url: 'http://a', name: 'A' });
  const hist = loadHistory();
  assert.equal(hist.recentServers.length, 1);
  assert.equal(hist.recentServers[0].url, 'http://a');
});

test('auth token helpers', () => {
  saveAuthToken('http://a', 't1');
  assert.equal(getAuthToken('http://a'), 't1');
});

test('save execution', () => {
  saveExecution({id:'1', toolSlug:'t', toolName:'T', serverUrl:'http://a', inputs:{}, status:'running', startTime:new Date().toISOString(), logs:[]});
  const hist = loadHistory();
  assert.equal(hist.executions.length, 1);
});

test('clear history', () => {
  clearHistory();
  const hist = loadHistory();
  assert.equal(hist.executions.length, 0);
  assert.equal(hist.recentServers.length, 0);
});
