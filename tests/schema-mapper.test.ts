import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mapSchemaTypeToFieldType, extractFieldDefinitions } from '../client/src/lib/schema-to-form';

const simpleSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', title: 'Name' },
    age: { type: 'integer', title: 'Age' },
    tags: { type: 'array', items: { type: 'string' } }
  }
};

test('map types', () => {
  assert.equal(mapSchemaTypeToFieldType({ type: 'string' }, 'foo'), 'text');
  assert.equal(mapSchemaTypeToFieldType({ type: 'boolean' }, 'flag'), 'checkbox');
  assert.equal(mapSchemaTypeToFieldType({ type: 'string', enum: ['a','b'] }, 'sel'), 'select');
});

test('extract definitions', () => {
  const fields = extractFieldDefinitions(simpleSchema as any);
  assert.equal(fields.length, 3);
  const names = fields.map(f => f.name).sort();
  assert.deepEqual(names, ['age','name','tags']);
});
