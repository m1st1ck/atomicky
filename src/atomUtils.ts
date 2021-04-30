import { ObservableAtom, Subscribe } from "./atom";

export type WaitForAtom = <T>(
  atom: ObservableAtom<T>,
  selector: (atomState: T) => boolean
) => Promise<void>;

type GetAtomType<ATOM> = ATOM extends ObservableAtom<infer ATOMVALUE>
  ? ATOMVALUE
  : never;
type AtomTuplesToValue<ATOMSTUPLE> = {
  [INDEX in keyof ATOMSTUPLE]: GetAtomType<ATOMSTUPLE[INDEX]>;
};

export const waitForAtom: WaitForAtom = (atom, selector) => {
  if (selector(atom.getState())) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const unsub = atom.subscribe(() => {
      if (selector(atom.getState())) {
        resolve();
        unsub();
      }
    });
  });
};

export const waitForAtoms = <T extends ObservableAtom<any>[]>(
  atoms: readonly [...T],
  selector: (atomState: AtomTuplesToValue<T>) => boolean
): Promise<void> => {
  const getState = () => atoms.map((atom) => atom.getState());
  const subscribe: Subscribe = (cb) => {
    const unsubs = atoms.map((atom) => atom.subscribe(cb));
    return () => unsubs.forEach((unsub) => unsub());
  };

  if (selector(getState() as AtomTuplesToValue<T>)) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const unsub = subscribe(() => {
      if (selector(getState() as AtomTuplesToValue<T>)) {
        resolve();
        unsub();
      }
    });
  });
};
