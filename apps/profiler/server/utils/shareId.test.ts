import { describe, expect, it } from 'vitest';
import { hashWellJson } from './shareId';

describe('hashWellJson', () => {
  it('is deterministic for the same input', async () => {
    const a = await hashWellJson('{"name":"test"}');
    const b = await hashWellJson('{"name":"test"}');
    expect(a).toBe(b);
  });

  it('produces a 16-character lowercase hex id', async () => {
    const id = await hashWellJson('{"name":"test"}');
    expect(id).toMatch(/^[0-9a-f]{16}$/);
  });

  it('matches a known SHA-256 vector', async () => {
    // sha256("hello") = 2cf24dba5fb0a30e...
    const id = await hashWellJson('hello');
    expect(id).toBe('2cf24dba5fb0a30e');
  });

  it('produces different ids for different inputs', async () => {
    const a = await hashWellJson('{"name":"a"}');
    const b = await hashWellJson('{"name":"b"}');
    expect(a).not.toBe(b);
  });
});
