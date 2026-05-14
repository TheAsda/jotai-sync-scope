import { type WritableAtom } from 'jotai';

export type AtomsToSync<T = any> = [WritableAtom<T, any[], any>, WritableAtom<T, any[], any>];

