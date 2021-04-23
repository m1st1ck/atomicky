import { useState, useEffect } from "react";
import { GetState, Subscribe } from "./atom";

export const useAtom = <T>(atom: {
  getState: GetState<T>;
  subscribe: Subscribe;
}) => {
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
