import { atom, useAtom, useAtomValue } from 'jotai';

import { SyncScopeProvider } from './index';

const sourceAtom = atom(10);
const targetAtom = atom(0);
const globalAtom = atom(100);
const derivedX10 = atom(
  (get) => get(targetAtom) * 10,
  (get, set, value: number | ((oldValue: number) => number)) => {
    if (typeof value === 'function') {
      value = value(get(targetAtom) * 10);
    }
    set(targetAtom, Math.floor(value / 10));
  }
);

const Counter = () => {
  const [count, setCount] = useAtom(targetAtom);
  const [global, setGlobal] = useAtom(globalAtom);
  const [derivedTarget, setDerivedTarget] = useAtom(derivedX10);

  return (
    <div>
      <div>
        <h1>Target</h1>
        <p>Target Atom Value: {count}</p>
        <button onClick={() => setCount((s) => s + 1)}>+1</button>
        <button onClick={() => setCount((s) => s - 1)}>-1</button>
      </div>
      <div>
        <h1>X10</h1>
        <p>Derived Atom Value: {derivedTarget}</p>
        <button onClick={() => setDerivedTarget((s) => s + 100)}>+100</button>
        <button onClick={() => setDerivedTarget((s) => s - 100)}>-100</button>
      </div>
      <div>
        <p>Global Atom Value: {global}</p>
        <button onClick={() => setGlobal((s) => s + 1)}>+1</button>
        <button onClick={() => setGlobal((s) => s - 1)}>-1</button>
      </div>
    </div>
  );
};

const derivedSyncedAtom = atom(0);
const derivedDerivedAtom = atom((get) => Math.sqrt(get(derivedSyncedAtom)));

const NestedCounter = () => {
  const [global, setGlobal] = useAtom(globalAtom);
  const [derivedTarget, setDerivedTarget] = useAtom(derivedSyncedAtom);
  const derivedDerived = useAtomValue(derivedDerivedAtom);

  return (
    <div>
      <div>
        <h1>X10</h1>
        <p>Derived Atom Value: {derivedTarget}</p>
        <button onClick={() => setDerivedTarget((s) => s + 1000)}>+1000</button>
        <button onClick={() => setDerivedTarget((s) => s - 1000)}>-1000</button>
      </div>
      <div>
        <h1>SQRT</h1>
        <p>Derived Derived Atom Value: {derivedDerived}</p>
      </div>
      <div>
        <p>Global Atom Value: {global}</p>
        <button onClick={() => setGlobal((s) => s + 1)}>+1</button>
        <button onClick={() => setGlobal((s) => s - 1)}>-1</button>
      </div>
    </div>
  );
};

export default {
  Basic: () => {
    const source = useAtomValue(sourceAtom);
    const global = useAtomValue(globalAtom);

    return (
      <div>
        <p>Source Atom Value: {source}</p>
        <p>Global Atom Value: {global}</p>
        <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>
          <Counter />
        </SyncScopeProvider>
      </div>
    );
  },
  Nested: () => {
    const source = useAtomValue(sourceAtom);
    const global = useAtomValue(globalAtom);
    return (
      <div>
        <p>Source Atom Value: {source}</p>
        <p>Global Atom Value: {global}</p>
        <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>
          <Counter />
          <SyncScopeProvider atoms={[[derivedX10, derivedSyncedAtom]]}>
            <NestedCounter />
          </SyncScopeProvider>
        </SyncScopeProvider>
      </div>
    );
  },
};
