# jotai-sync-scope

Sync Jotai atoms across scope boundaries.

Jotai's `splitAtom` produces temporary atoms that change when the list changes. `jotai-sync-scope` syncs them to stable module-level atoms.

## Installation

```bash
npm install jotai-sync-scope
```

## Quick Start

```tsx
import { atom, useAtom } from 'jotai';
import { SyncScopeProvider } from 'jotai-sync-scope';

const sourceAtom = atom(0);
const targetAtom = atom(0);

const App = () => (
  <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>
    <Panel />
  </SyncScopeProvider>
);

const Panel = () => {
  const [source, setSource] = useAtom(sourceAtom);
  const [target, setTarget] = useAtom(targetAtom);

  return (
    <>
      <p>
        Source: {source} / Target: {target}
      </p>
      <button onClick={() => setSource((v) => v + 1)}>Source +1</button>
      <button onClick={() => setTarget((v) => v + 1)}>Target +1</button>
    </>
  );
};
```

## API

`SyncScopeProvider` accepts `atoms` — array of `[source, target]` pairs — and `children`.

```typescript
type AtomsToSync<T = any> = [WritableAtom<T, any[], any>, WritableAtom<T, any[], any>];
```

## SplitAtom Integration

```tsx
import { atom, useAtom, useAtomValue } from 'jotai';
import { splitAtom } from 'jotai/utils';
import { SyncScopeProvider } from 'jotai-sync-scope';

const itemsAtom = atom(['a', 'b', 'c']);
const itemAtomsAtom = splitAtom(itemsAtom);
const itemAtom = atom('');

const App = () => {
  const itemAtoms = useAtomValue(itemAtomsAtom);

  return (
    <div>
      {itemAtoms.map((splitItemAtom, index) => (
        <SyncScopeProvider key={splitItemAtom.toString()} atoms={[[splitItemAtom, itemAtom]]}>
          <ItemComponent />
        </SyncScopeProvider>
      ))}
    </div>
  );
};

const ItemComponent = () => {
  const [item, setItem] = useAtom(itemAtom);

  return (
    <div>
      <p>Item: {item}</p>
      <input type="text" value={item} onChange={(e) => setItem(e.target.value)} />
    </div>
  );
};
```

## License

MIT
