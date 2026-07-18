import { generateId } from '../id';

describe('generateId', () => {
  it('returns a non-empty string', () => {
    expect(typeof generateId()).toBe('string');
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('produces unique values across many calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateId()));
    expect(ids.size).toBe(1000);
  });

  it('matches the documented "<time>-<random>" shape', () => {
    expect(generateId()).toMatch(/^[a-z0-9]+-[a-z0-9]{8}$/);
  });
});
