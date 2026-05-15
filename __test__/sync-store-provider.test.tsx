import { act, renderHook } from '@testing-library/react';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithReset, useResetAtom, splitAtom } from 'jotai/utils';
import { type PropsWithChildren, useState } from 'react';
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

  test('multiple atom pairs in single provider', () => {
    const sourceA = atom(0);
    const targetA = atom(0);
    const sourceB = atom(0);
    const targetB = atom(0);

    const Provider = (props: PropsWithChildren) => (
      <SyncScopeProvider
        atoms={[
          [sourceA, targetA],
          [sourceB, targetB],
        ]}
      >
        {props.children}
      </SyncScopeProvider>
    );

    const { result } = renderHook(
      () => {
        const [sA, setSA] = useAtom(sourceA);
        const [tA, setTA] = useAtom(targetA);
        const [sB, setSB] = useAtom(sourceB);
        const [tB, setTB] = useAtom(targetB);
        return { sA, setSA, tA, setTA, sB, setSB, tB, setTB };
      },
      { wrapper: Provider }
    );

    const { result: globalScope } = renderHook(() => {
      const [gA, setGA] = useAtom(sourceA);
      const [gB, setGB] = useAtom(sourceB);
      return { gA, setGA, gB, setGB };
    });

    expect(result.current.sA).toBe(0);
    expect(result.current.tA).toBe(0);
    expect(result.current.sB).toBe(0);
    expect(result.current.tB).toBe(0);

    act(() => {
      result.current.setTA(10);
    });
    expect(result.current.sA).toBe(10);
    expect(result.current.tA).toBe(10);
    expect(result.current.sB).toBe(0);
    expect(globalScope.current.gA).toBe(10);

    act(() => {
      result.current.setTB(20);
    });
    expect(result.current.sB).toBe(20);
    expect(result.current.tB).toBe(20);
    expect(result.current.sA).toBe(10);
    expect(globalScope.current.gB).toBe(20);

    act(() => {
      result.current.setSA(30);
    });
    expect(result.current.tA).toBe(30);
    expect(result.current.tB).toBe(20);

    act(() => {
      result.current.setSB(40);
    });
    expect(result.current.tB).toBe(40);
    expect(result.current.tA).toBe(30);
  });

  test('dynamic atoms prop change', () => {
    const sourceA = atom(0);
    const targetA = atom(0);
    const sourceB = atom(0);
    const targetB = atom(0);

    type AtomPair = [typeof sourceA, typeof targetA];
    let setWrapperAtoms: (atoms: AtomPair[]) => void;

    const DynamicProvider = (props: PropsWithChildren) => {
      const [atoms, setAtoms] = useState<AtomPair[]>([[sourceA, targetA]]);
      setWrapperAtoms = setAtoms;
      return <SyncScopeProvider atoms={atoms}>{props.children}</SyncScopeProvider>;
    };

    const { result } = renderHook(
      () => {
        const [sA, setSA] = useAtom(sourceA);
        const [tA, setTA] = useAtom(targetA);
        const [sB, setSB] = useAtom(sourceB);
        const [tB, setTB] = useAtom(targetB);
        return { sA, setSA, tA, setTA, sB, setSB, tB, setTB };
      },
      { wrapper: DynamicProvider }
    );

    act(() => {
      result.current.setTA(10);
    });
    expect(result.current.sA).toBe(10);
    expect(result.current.tA).toBe(10);

    act(() => {
      setWrapperAtoms([[sourceB, targetB]]);
    });

    act(() => {
      result.current.setTB(20);
    });
    expect(result.current.sB).toBe(20);
    expect(result.current.tB).toBe(20);
    expect(result.current.sA).toBe(10);
  });

  test('unrelated atoms pass through unchanged', () => {
    const sourceAtom = atom(0);
    const targetAtom = atom(0);
    const unrelatedAtom = atom('hello');

    const Provider = (props: PropsWithChildren) => (
      <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>{props.children}</SyncScopeProvider>
    );

    const { result } = renderHook(
      () => {
        const [target, setTarget] = useAtom(targetAtom);
        const [unrelated, setUnrelated] = useAtom(unrelatedAtom);
        return { target, setTarget, unrelated, setUnrelated };
      },
      { wrapper: Provider }
    );

    const { result: globalScope } = renderHook(() => {
      const [source] = useAtom(sourceAtom);
      const [unrelated] = useAtom(unrelatedAtom);
      return { source, unrelated };
    });

    act(() => {
      result.current.setUnrelated('world');
    });
    expect(result.current.unrelated).toBe('world');
    expect(globalScope.current.unrelated).toBe('world');

    act(() => {
      result.current.setTarget(10);
    });
    expect(result.current.target).toBe(10);
    expect(globalScope.current.source).toBe(10);
    expect(result.current.unrelated).toBe('world');
    expect(globalScope.current.unrelated).toBe('world');
  });

  test('read-only derived atom reads from source', () => {
    const sourceAtom = atom(0);
    const targetAtom = atom(0);
    const readOnlyDerived = atom((get) => get(targetAtom) * 2);

    const Provider = (props: PropsWithChildren) => (
      <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>{props.children}</SyncScopeProvider>
    );

    const { result } = renderHook(
      () => {
        const derived = useAtomValue(readOnlyDerived);
        const [target, setTarget] = useAtom(targetAtom);
        return { derived, target, setTarget };
      },
      { wrapper: Provider }
    );

    const { result: globalScope } = renderHook(() => {
      const [source, setSource] = useAtom(sourceAtom);
      return { source, setSource };
    });

    expect(result.current.derived).toBe(0);
    expect(result.current.target).toBe(0);

    act(() => {
      globalScope.current.setSource(5);
    });
    expect(result.current.derived).toBe(10);

    act(() => {
      result.current.setTarget(3);
    });
    expect(globalScope.current.source).toBe(3);
    expect(result.current.derived).toBe(6);
  });

  test('write-only atom routes correctly', () => {
    const sourceAtom = atom(0);
    const targetAtom = atom(0);
    const writeOnlyAtom = atom<null, [number], void>(null, (_get, set, value: number) => {
      set(targetAtom, value);
    });

    const Provider = (props: PropsWithChildren) => (
      <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>{props.children}</SyncScopeProvider>
    );

    const { result } = renderHook(
      () => {
        const setWrite = useSetAtom(writeOnlyAtom);
        const target = useAtomValue(targetAtom);
        return { setWrite, target };
      },
      { wrapper: Provider }
    );

    const { result: globalScope } = renderHook(() => {
      const [source] = useAtom(sourceAtom);
      return { source };
    });

    expect(result.current.target).toBe(0);
    expect(globalScope.current.source).toBe(0);

    act(() => {
      result.current.setWrite(42);
    });
    expect(result.current.target).toBe(42);
    expect(globalScope.current.source).toBe(42);
  });

  test('three-level nesting', () => {
    const atomA = atom(0);
    const atomB = atom(0);
    const atomC = atom(0);

    const Provider1 = (props: PropsWithChildren) => (
      <SyncScopeProvider atoms={[[atomA, atomB]]}>{props.children}</SyncScopeProvider>
    );
    const Provider2 = (props: PropsWithChildren) => (
      <Provider1>
        <SyncScopeProvider atoms={[[atomB, atomC]]}>{props.children}</SyncScopeProvider>
      </Provider1>
    );
    // oxlint-disable-next-line unicorn/consistent-function-scoping
    const Provider3 = (props: PropsWithChildren) => <div>{props.children}</div>;

    const { result: globalScope } = renderHook(() => {
      const [a, setA] = useAtom(atomA);
      return { a, setA };
    });

    const { result: level1 } = renderHook(
      () => {
        const [a] = useAtom(atomA);
        const [b, setB] = useAtom(atomB);
        return { a, b, setB };
      },
      { wrapper: Provider1 }
    );

    const { result: level3 } = renderHook(
      () => {
        const [a] = useAtom(atomA);
        const [b] = useAtom(atomB);
        const [c, setC] = useAtom(atomC);
        return { a, b, c, setC };
      },
      {
        wrapper: ({ children }: PropsWithChildren) => (
          <Provider2>
            <Provider3>{children}</Provider3>
          </Provider2>
        ),
      }
    );

    expect(globalScope.current.a).toBe(0);
    expect(level1.current.a).toBe(0);
    expect(level1.current.b).toBe(0);
    expect(level3.current.a).toBe(0);
    expect(level3.current.b).toBe(0);
    expect(level3.current.c).toBe(0);

    act(() => {
      level3.current.setC(7);
    });
    expect(globalScope.current.a).toBe(7);
    expect(level1.current.b).toBe(7);
    expect(level3.current.c).toBe(7);

    act(() => {
      globalScope.current.setA(99);
    });
    expect(globalScope.current.a).toBe(99);
    expect(level1.current.b).toBe(99);
    expect(level3.current.c).toBe(99);
  });

  test('independent provider trees with shared source', () => {
    const sharedSource = atom(0);
    const targetA = atom(0);
    const targetB = atom(0);

    const ProviderA = (props: PropsWithChildren) => (
      <SyncScopeProvider atoms={[[sharedSource, targetA]]}>{props.children}</SyncScopeProvider>
    );
    const ProviderB = (props: PropsWithChildren) => (
      <SyncScopeProvider atoms={[[sharedSource, targetB]]}>{props.children}</SyncScopeProvider>
    );

    const { result: scopedA } = renderHook(
      () => {
        const [tA, setTA] = useAtom(targetA);
        return { tA, setTA };
      },
      { wrapper: ProviderA }
    );

    const { result: scopedB } = renderHook(
      () => {
        const [tB, setTB] = useAtom(targetB);
        return { tB, setTB };
      },
      { wrapper: ProviderB }
    );

    const { result: globalScope } = renderHook(() => {
      const [shared] = useAtom(sharedSource);
      return { shared };
    });

    act(() => {
      scopedA.current.setTA(10);
    });
    expect(globalScope.current.shared).toBe(10);
    expect(scopedB.current.tB).toBe(10);

    act(() => {
      scopedB.current.setTB(20);
    });
    expect(globalScope.current.shared).toBe(20);
    expect(scopedA.current.tA).toBe(20);
  });

  test('subscription triggers re-render on external change', () => {
    const sourceAtom = atom(0);
    const targetAtom = atom(0);

    const Provider = (props: PropsWithChildren) => (
      <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>{props.children}</SyncScopeProvider>
    );

    const { result: scoped } = renderHook(() => useAtomValue(targetAtom), { wrapper: Provider });

    const { result: globalScope } = renderHook(() => {
      const [source, setSource] = useAtom(sourceAtom);
      return { source, setSource };
    });

    expect(scoped.current).toBe(0);

    act(() => {
      globalScope.current.setSource(42);
    });
    expect(scoped.current).toBe(42);
  });

  test('same source in multiple pairs', () => {
    const sharedSource = atom(0);
    const targetA = atom(0);
    const targetB = atom(0);

    const Provider = (props: PropsWithChildren) => (
      <SyncScopeProvider
        atoms={[
          [sharedSource, targetA],
          [sharedSource, targetB],
        ]}
      >
        {props.children}
      </SyncScopeProvider>
    );

    const { result } = renderHook(
      () => {
        const [tA, setTA] = useAtom(targetA);
        const [tB, setTB] = useAtom(targetB);
        return { tA, setTA, tB, setTB };
      },
      { wrapper: Provider }
    );

    const { result: globalScope } = renderHook(() => {
      const [shared, setShared] = useAtom(sharedSource);
      return { shared, setShared };
    });

    expect(result.current.tA).toBe(0);
    expect(result.current.tB).toBe(0);
    expect(globalScope.current.shared).toBe(0);

    act(() => {
      result.current.setTA(5);
    });
    expect(globalScope.current.shared).toBe(5);
    expect(result.current.tB).toBe(5);

    act(() => {
      result.current.setTB(15);
    });
    expect(globalScope.current.shared).toBe(15);
    expect(result.current.tA).toBe(15);
  });

  test('error propagation through clone', () => {
    const sourceAtom = atom(0);
    const targetAtom = atom(0);
    const errorAtom = atom(() => {
      throw new Error('boom');
    });

    const Provider = (props: PropsWithChildren) => (
      <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>{props.children}</SyncScopeProvider>
    );

    const { result } = renderHook(
      () => {
        const [target, setTarget] = useAtom(targetAtom);
        let error: Error | null = null;
        try {
          useAtomValue(errorAtom);
        } catch (e) {
          error = e instanceof Error ? e : new Error(String(e));
        }
        return { target, setTarget, error };
      },
      { wrapper: Provider }
    );

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('boom');
    expect(result.current.target).toBe(0);

    act(() => {
      result.current.setTarget(10);
    });
    expect(result.current.target).toBe(10);
  });

  test('async atom sync', async () => {
    const sourceAtom = atom(0);
    const targetAtom = atom(0);
    let resolved = false;
    const asyncDerived = atom((get) => {
      const val = get(targetAtom);
      if (val === 0) return 'idle';
      return resolved ? `resolved-${val}` : `pending-${val}`;
    });

    const Provider = (props: PropsWithChildren) => (
      <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>{props.children}</SyncScopeProvider>
    );

    const { result } = renderHook(
      () => {
        const [target, setTarget] = useAtom(targetAtom);
        const derived = useAtomValue(asyncDerived);
        return { target, setTarget, derived };
      },
      { wrapper: Provider }
    );

    const { result: globalScope } = renderHook(() => {
      const [source, setSource] = useAtom(sourceAtom);
      return { source, setSource };
    });

    expect(result.current.target).toBe(0);
    expect(result.current.derived).toBe('idle');

    act(() => {
      result.current.setTarget(5);
    });
    expect(result.current.target).toBe(5);
    expect(globalScope.current.source).toBe(5);
    expect(result.current.derived).toBe('pending-5');

    resolved = true;
    act(() => {
      globalScope.current.setSource(10);
    });
    expect(result.current.target).toBe(10);
    expect(result.current.derived).toBe('resolved-10');
  });

  test('atomWithReset sync', () => {
    const sourceAtom = atomWithReset(0);
    const targetAtom = atomWithReset(0);

    const Provider = (props: PropsWithChildren) => (
      <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>{props.children}</SyncScopeProvider>
    );

    const { result } = renderHook(
      () => {
        const [target, setTarget] = useAtom(targetAtom);
        const resetTarget = useResetAtom(targetAtom);
        return { target, setTarget, resetTarget };
      },
      { wrapper: Provider }
    );

    const { result: globalScope } = renderHook(() => {
      const [source, setSource] = useAtom(sourceAtom);
      const resetSource = useResetAtom(sourceAtom);
      return { source, setSource, resetSource };
    });

    expect(result.current.target).toBe(0);
    expect(globalScope.current.source).toBe(0);

    act(() => {
      result.current.setTarget(42);
    });
    expect(result.current.target).toBe(42);
    expect(globalScope.current.source).toBe(42);

    act(() => {
      globalScope.current.setSource(99);
    });
    expect(result.current.target).toBe(99);
    expect(globalScope.current.source).toBe(99);

    act(() => {
      result.current.resetTarget();
    });
    expect(result.current.target).toBe(0);
    expect(globalScope.current.source).toBe(0);

    act(() => {
      globalScope.current.setSource(77);
    });
    expect(result.current.target).toBe(77);

    act(() => {
      globalScope.current.resetSource();
    });
    expect(result.current.target).toBe(0);
    expect(globalScope.current.source).toBe(0);
  });
});
