# jotai-sync-scope

Sync Jotai atoms across scope boundaries

## Installation

```bash
npm install jotai-sync-scope
bun add jotai-sync-scope
yarn add jotai-sync-scope
pnpm add jotai-sync-scope
```

## Quick Start

```tsx
import { atom, useAtom } from 'jotai';
import { SyncScopeProvider } from 'jotai-sync-scope';

const sourceAtom = atom(0);
const targetAtom = atom(0);

const App = () => {
  const [source, setSource] = useAtom(sourceAtom);

  return (
    <div>
      <p>Source: {source}</p>
      <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>
        <Counter />
      </SyncScopeProvider>
    </div>
  );
};

const Counter = () => {
  const [count, setCount] = useAtom(targetAtom);

  return (
    <div>
      <p>Target: {count}</p>
      <button onClick={() => setCount((s) => s + 1)}>+1</button>
    </div>
  );
};
```

## API Reference

### SyncScopeProvider

A React component that creates a sync scope for atoms.

```tsx
interface SyncScopeProviderProps {
  atoms: AtomsToSync[];
  children: React.ReactNode;
}
```

#### atoms

An array of atom pairs to sync. Each pair consists of:

- **Source atom**: The atom that acts as the source of truth
- **Target atom**: The atom that will be synced with the source atom

**Type:** `[sourceAtom, targetAtom][]`

**Example:**
```tsx
<SyncScopeProvider atoms={[[sourceAtom, targetAtom], [anotherSource, anotherTarget]]}>
  {children}
</SyncScopeProvider>
```

## Examples

### Basic Sync

Sync two atoms bidirectionally:

```tsx
import { atom, useAtom } from 'jotai';
import { SyncScopeProvider } from 'jotai-sync-scope';

const sourceAtom = atom(0);
const targetAtom = atom(0);

const App = () => {
  const [source, setSource] = useAtom(sourceAtom);
  const [target, setTarget] = useAtom(targetAtom);

  return (
    <div>
      <p>Source: {source}</p>
      <p>Target: {target}</p>
      <button onClick={() => setSource((s) => s + 1)}>Increment Source</button>
      <button onClick={() => setTarget((s) => s + 1)}>Increment Target</button>
    </div>
  );
};

const SyncScope = () => (
  <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>
    <App />
  </SyncScopeProvider>
);
```

### SplitAtom Integration

The killer use case for `jotai-sync-scope` - map `splitAtom` items to stable module-level atoms:

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
        <SyncScopeProvider key={index} atoms={[[splitItemAtom, itemAtom]]}>
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
      <input
        type="text"
        value={item}
        onChange={(e) => setItem(e.target.value)}
      />
    </div>
  );
};
```

### Nesting

`SyncScopeProvider` can be nested for complex scenarios:

```tsx
import { atom, useAtom } from 'jotai';
import { SyncScopeProvider } from 'jotai-sync-scope';

const parentSource = atom('parent');
const parentTarget = atom('');
const childSource = atom('child');
const childTarget = atom('');

const App = () => (
  <SyncScopeProvider atoms={[[parentSource, parentTarget]]}>
    <ParentComponent>
      <SyncScopeProvider atoms={[[childSource, childTarget]]}>
        <ChildComponent />
      </SyncScopeProvider>
    </ParentComponent>
  </SyncScopeProvider>
);

const ParentComponent = ({ children }) => {
  const [parentValue] = useAtom(parentTarget);
  
  return (
    <div>
      <h2>Parent: {parentValue}</h2>
      {children}
    </div>
  );
};

const ChildComponent = () => {
  const [childValue] = useAtom(childTarget);
  
  return <p>Child: {childValue}</p>;
};
```

### Derived Atoms

Derived atoms from synced atoms work correctly:

```tsx
import { atom, useAtom } from 'jotai';
import { SyncScopeProvider } from 'jotai-sync-scope';

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

const App = () => {
  const [source, setSource] = useAtom(sourceAtom);
  const [target, setTarget] = useAtom(targetAtom);
  const [derived, setDerived] = useAtom(derivedAtom);

  return (
    <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>
      <div>
        <p>Source: {source}</p>
        <p>Target: {target}</p>
        <p>Derived (×10): {derived}</p>
        <button onClick={() => setSource((s) => s + 1)}>
          Increment Source
        </button>
        <button onClick={() => setDerived((d) => d + 100)}>
          Increment Derived
        </button>
      </div>
    </SyncScopeProvider>
  );
};
```

## How It Works

`jotai-sync-scope` syncs atoms across scope boundaries using a source/target pattern:

### Source Atom
- The atom declared/used higher in the React tree
- Acts as the source of truth for the sync operation
- Writes to source atoms update both source and target atoms

### Target Atom  
- The atom that gets synced with the source atom
- Writing to target atoms actually writes to the source atom
- Target atoms provide a scoped interface to the source atom

### Bidirectional Sync
- **Source → Target**: Writing to a source atom updates both the source and all associated target atoms
- **Target → Source**: Writing to a target atom writes to the corresponding source atom
- Both directions maintain synchronization across scope boundaries

## Error Handling

Errors in atoms propagate naturally to React error boundaries. This follows Jotai's convention — `jotai-sync-scope` does not catch or suppress errors.

## License

MIT