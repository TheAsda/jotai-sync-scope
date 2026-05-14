import { act, renderHook } from '@testing-library/react';
import { atom, useAtom, useAtomValue } from 'jotai';
import { splitAtom } from 'jotai/utils';
import type { PropsWithChildren } from 'react';
import { describe, expect, test } from 'vitest';

import { SyncScopeProvider } from '../src/sync-store-provider';

describe(SyncScopeProvider, () => {
  test('simple sync', () => {
    const sourceAtom = atom(0);
    const targetAtom = atom(0);

    const Provider = (props: PropsWithChildren) => {
      return (
        <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>{props.children}</SyncScopeProvider>
      );
    };

    const { result } = renderHook(
      () => {
        const [source, setSource] = useAtom(sourceAtom);
        const [target, setTarget] = useAtom(targetAtom);
        return {
          source,
          setSource,
          target,
          setTarget,
        };
      },
      { wrapper: Provider }
    );
    const { result: globalScope } = renderHook(() => {
      const [global, setGlobal] = useAtom(sourceAtom);
      return {
        global,
        setGlobal,
      };
    });
    const expectEqualValues = (value: number) => {
      expect(result.current.source).toBe(value);
      expect(result.current.target).toBe(value);
      expect(globalScope.current.global).toBe(value);
    };

    expectEqualValues(0);

    act(() => {
      result.current.setTarget(10);
    });

    expectEqualValues(10);

    act(() => {
      result.current.setSource(20);
    });

    expectEqualValues(20);

    act(() => {
      globalScope.current.setGlobal(100);
    });

    expectEqualValues(100);
  });

  test('nested sync', () => {
    const sourceAtom = atom(0);
    const targetAtom = atom(0);
    const nestedAtom = atom(0);

    const Provider = (props: PropsWithChildren) => {
      return (
        <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>{props.children}</SyncScopeProvider>
      );
    };
    const Provider2 = (props: PropsWithChildren) => {
      return (
        <Provider>
          <SyncScopeProvider atoms={[[targetAtom, nestedAtom]]}>{props.children}</SyncScopeProvider>
        </Provider>
      );
    };

    const { result: globalScope } = renderHook(() => {
      const [global, setGlobal] = useAtom(sourceAtom);
      return {
        global,
        setGlobal,
      };
    });
    const { result } = renderHook(
      () => {
        const [source, setSource] = useAtom(sourceAtom);
        const [target, setTarget] = useAtom(targetAtom);
        return {
          source,
          setSource,
          target,
          setTarget,
        };
      },
      { wrapper: Provider }
    );
    const { result: nestedScope } = renderHook(
      () => {
        const [nested, setNested] = useAtom(nestedAtom);
        return {
          nested,
          setNested,
        };
      },
      { wrapper: Provider2 }
    );

    const expectEqualValues = (value: number) => {
      expect(result.current.source).toBe(value);
      expect(result.current.target).toBe(value);
      expect(globalScope.current.global).toBe(value);
      expect(nestedScope.current.nested).toBe(value);
    };

    expectEqualValues(0);

    act(() => {
      result.current.setTarget(10);
    });

    expectEqualValues(10);

    act(() => {
      result.current.setSource(20);
    });

    expectEqualValues(20);

    act(() => {
      globalScope.current.setGlobal(100);
    });

    expectEqualValues(100);
  });

  test('derived sync', () => {
    const sourceAtom = atom(0);
    const targetAtom = atom(0);
    const derivedAtom = atom(
      (get) => get(targetAtom) * 10,
      (get, set, value: number | ((oldValue: number) => number)) => {
        if (typeof value === 'function') {
          value = value(get(targetAtom) * 10);
        }
        set(targetAtom, Math.floor(value / 10));
      }
    );

    const Provider = (props: PropsWithChildren) => {
      return (
        <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>{props.children}</SyncScopeProvider>
      );
    };

    const { result } = renderHook(
      () => {
        const [source, setSource] = useAtom(sourceAtom);
        const [target, setTarget] = useAtom(targetAtom);
        const [derived, setDerived] = useAtom(derivedAtom);
        return {
          source,
          setSource,
          target,
          setTarget,
          derived,
          setDerived,
        };
      },
      { wrapper: Provider }
    );
    const { result: globalScope } = renderHook(() => {
      const [global, setGlobal] = useAtom(sourceAtom);
      return {
        global,
        setGlobal,
      };
    });

    const expectEqualValues = (value: number) => {
      expect(result.current.source).toBe(value);
      expect(result.current.target).toBe(value);
      expect(globalScope.current.global).toBe(value);
      expect(result.current.derived).toBe(value * 10);
    };

    expectEqualValues(0);

    act(() => {
      result.current.setTarget(10);
    });

    expectEqualValues(10);

    act(() => {
      result.current.setSource(20);
    });

    expectEqualValues(20);

    act(() => {
      globalScope.current.setGlobal(100);
    });

    expectEqualValues(100);

    act(() => {
      result.current.setDerived(111 * 10);
    });

    expectEqualValues(111);
  });

  test('nested derived sync', () => {
    const sourceAtom = atom(0);
    const targetAtom = atom(0);
    const nestedAtom = atom(0);
    const derivedAtom = atom(
      (get) => get(nestedAtom) * 10,
      (get, set, value: number | ((oldValue: number) => number)) => {
        if (typeof value === 'function') {
          value = value(get(nestedAtom) * 10);
        }
        set(nestedAtom, Math.floor(value / 10));
      }
    );

    const Provider = (props: PropsWithChildren) => {
      return (
        <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>{props.children}</SyncScopeProvider>
      );
    };
    const Provider2 = (props: PropsWithChildren) => {
      return (
        <Provider>
          <SyncScopeProvider atoms={[[targetAtom, nestedAtom]]}>{props.children}</SyncScopeProvider>
        </Provider>
      );
    };

    const { result: globalScope } = renderHook(() => {
      const [global, setGlobal] = useAtom(sourceAtom);
      return {
        global,
        setGlobal,
      };
    });
    const { result } = renderHook(
      () => {
        const [source, setSource] = useAtom(sourceAtom);
        const [target, setTarget] = useAtom(targetAtom);
        return {
          source,
          setSource,
          target,
          setTarget,
        };
      },
      { wrapper: Provider }
    );
    const { result: nestedScope } = renderHook(
      () => {
        const [nested, setNested] = useAtom(nestedAtom);
        const [derived, setDerived] = useAtom(derivedAtom);
        return {
          nested,
          setNested,
          derived,
          setDerived,
        };
      },
      { wrapper: Provider2 }
    );

    const expectEqualValues = (value: number) => {
      expect(result.current.source).toBe(value);
      expect(result.current.target).toBe(value);
      expect(globalScope.current.global).toBe(value);
      expect(nestedScope.current.nested).toBe(value);
      expect(nestedScope.current.derived).toBe(value * 10);
    };

    expectEqualValues(0);

    act(() => {
      result.current.setTarget(10);
    });

    expectEqualValues(10);

    act(() => {
      result.current.setSource(20);
    });

    expectEqualValues(20);

    act(() => {
      globalScope.current.setGlobal(100);
    });

    expectEqualValues(100);

    act(() => {
      nestedScope.current.setDerived(111 * 10);
    });

    expectEqualValues(111);
  });

  test('splitAtom', () => {
    const arrayAtom = atom<string[]>(['a', 'b', 'c']);
    const itemsAtoms = splitAtom(arrayAtom);
    const syncedAtom = atom('');

    const Provider = (props: PropsWithChildren) => {
      const atoms = useAtomValue(itemsAtoms);
      return (
        <SyncScopeProvider atoms={[[atoms[1], syncedAtom]]}>{props.children}</SyncScopeProvider>
      );
    };

    const { result: globalScope } = renderHook(() => {
      const [array, setArray] = useAtom(arrayAtom);
      return {
        array,
        setArray,
      };
    });

    const { result } = renderHook(
      () => {
        const [synced, setSynced] = useAtom(syncedAtom);
        return {
          synced,
          setSynced,
        };
      },
      {
        wrapper: Provider,
      }
    );

    expect(result.current.synced).toEqual('b');
    expect(globalScope.current.array).toEqual(['a', 'b', 'c']);

    act(() => {
      result.current.setSynced('d');
    });

    expect(result.current.synced).toEqual('d');
    expect(globalScope.current.array).toEqual(['a', 'd', 'c']);

    act(() => {
      globalScope.current.setArray(['a', 'e', 'c']);
    });

    expect(result.current.synced).toEqual('e');
    expect(globalScope.current.array).toEqual(['a', 'e', 'c']);
  });
});
