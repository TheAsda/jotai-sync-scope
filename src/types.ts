import { createStore, type Atom, type WritableAtom } from 'jotai';

export type AnyWritableAtom<T = any> = WritableAtom<T, any[], any>;
export type AnyAtom<T = any> = Atom<T>;
export type AtomsToSync<T = any> = [AnyWritableAtom<T>, AnyWritableAtom<T>];
export type JotaiStore = ReturnType<typeof createStore>;
