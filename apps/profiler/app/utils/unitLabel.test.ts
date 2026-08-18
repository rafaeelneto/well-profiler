import { describe, expect, it } from 'vitest';
import { resolveDiameterUnitLabel } from './unitLabel';

describe('resolveDiameterUnitLabel', () => {
  it('returns mm regardless of locale', () => {
    expect(resolveDiameterUnitLabel('mm', 'en')).toBe('mm');
    expect(resolveDiameterUnitLabel('mm', 'pt')).toBe('mm');
  });

  it('returns in. for inches in English', () => {
    expect(resolveDiameterUnitLabel('inches', 'en')).toBe('in.');
  });

  it('returns the double-quote symbol for inches in Portuguese', () => {
    expect(resolveDiameterUnitLabel('inches', 'pt')).toBe('"');
  });
});
