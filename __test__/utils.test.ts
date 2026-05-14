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

  test('maps with undefined values', () => {
    expect(areMapsEqual(new Map([['a', undefined]]), new Map([['a', undefined]]))).toBe(true);
    expect(areMapsEqual(new Map([['a', undefined]]), new Map([['a', 1]]))).toBe(false);
  });

  test('maps with same size but different keys', () => {
    expect(areMapsEqual(new Map([['a', 1]]), new Map([['b', 1]]))).toBe(false);
  });

  test('maps with object values use reference equality', () => {
    const obj = { x: 1 };
    expect(areMapsEqual(new Map([['a', obj]]), new Map([['a', obj]]))).toBe(true);
    expect(areMapsEqual(new Map([['a', { x: 1 }]]), new Map([['a', { x: 1 }]]))).toBe(false);
  });

  test('maps with multiple entries', () => {
    expect(areMapsEqual(
      new Map([['a', 1], ['b', 2], ['c', 3]]),
      new Map([['a', 1], ['b', 2], ['c', 3]])
    )).toBe(true);
    expect(areMapsEqual(
      new Map([['a', 1], ['b', 2], ['c', 3]]),
      new Map([['a', 1], ['b', 2], ['c', 4]])
    )).toBe(false);
  });

  test('maps with NaN values', () => {
    expect(areMapsEqual(new Map([['a', NaN]]), new Map([['a', NaN]]))).toBe(false);
  });
});
