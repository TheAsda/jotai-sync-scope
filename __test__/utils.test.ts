import { describe, expect, test } from 'vitest';

import { areMapsEqual } from '../src/utils';

describe(areMapsEqual, () => {
  test('equal maps', () => {
    expect(areMapsEqual(new Map(), new Map())).toBe(true);
    expect(areMapsEqual(new Map([['a', 1]]), new Map([['a', 1]]))).toBe(true);
    expect(areMapsEqual(new Map([['a', 1]]), new Map([['a', 2]]))).toBe(false);
  });

  test('unequal maps', () => {
    expect(areMapsEqual(new Map(), new Map([['a', 1]]))).toBe(false);
    expect(areMapsEqual(new Map([['a', 1]]), new Map())).toBe(false);
  });
});
