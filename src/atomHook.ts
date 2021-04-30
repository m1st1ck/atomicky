import { useState, useEffect } from "react";
import { ObservableAtom } from "./atom";

export const useAtom = <T>(atom: ObservableAtom<T>) => {
  const [state, setState] = useState(atom.getState());

  useEffect(() => {
    const unsub = atom.subscribe(() => {
      setState(atom.getState());
    });

    setState(atom.getState());

    return unsub;
  }, [atom]);

  return state;
};
