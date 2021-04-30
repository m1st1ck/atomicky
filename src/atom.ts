export type Listener = () => void;
export type Subscribe = (listener: Listener) => Unsubscribe;
export type Unsubscribe = () => void;
export type Notify = () => void;
export type GetState<T> = () => T;
export type SetStateFuncArg<T> = (currentState: T) => T;
export type SetState<T> = (nState: Partial<T> | SetStateFuncArg<T>) => void;
export type Reset = () => void;
export type AtomCore<T> = {
  subscribe: Subscribe;
  notify: Notify;
  getState: GetState<T>;
  setState: SetState<T>;
  reset: Reset;
};
export type Atom<T> = {
  subscribe: Subscribe;
  getState: GetState<T>;
  setState: SetState<T>;
  reset: Reset;
};

const isObject = (a: any) => !!a && a.constructor === Object;

const atomCore = <T>(defaultState: T): AtomCore<T> => {
  let currentState = defaultState;

  const listeners: Listener[] = [];

  const subscribe: Subscribe = (listener) => {
    if (typeof listener !== "function") {
      throw new Error("Expected the listener to be a function.");
    }

    listeners.push(listener);

    return () => {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  };

  const notify: Notify = () => listeners.forEach((listener) => listener());

  const setState: SetState<T> = (nState) => {
    if (typeof nState === "function") {
      currentState = (nState as SetStateFuncArg<T>)(currentState);
    } else if (isObject(nState)) {
      currentState = { ...currentState, ...nState };
    } else {
      currentState = nState as T;
    }

    notify();
  };

  const getState: GetState<T> = () => currentState;

  const reset: Reset = () => setState(defaultState);

  return {
    subscribe,
    notify,
    setState,
    getState,
    reset,
  };
};

export const atom = <T>(defaultState: T): Atom<T> => {
  const _atomCore = atomCore(defaultState);

  return {
    subscribe: _atomCore.subscribe,
    getState: _atomCore.getState,
    setState: _atomCore.setState,
    reset: _atomCore.reset,
  };
};

export type HttpState = {
  init: boolean;
  loading: boolean;
  loaded: boolean;
  error: boolean;
  errorMessage?: string;
};

export type SetHttpStateFuncArg = (
  currentHttpState: HttpState
) => Partial<HttpState>;
export type SetHttpState<T> = (
  nHttpState: Partial<HttpState> | SetHttpStateFuncArg,
  nState?: T | SetStateFuncArg<T>
) => void;
export type GetHttpState<T> = () => [T, HttpState];

export const defaultHttpState: HttpState = {
  init: true,
  loading: false,
  loaded: false,
  error: false,
  errorMessage: undefined,
};

export const httpAtom = <T>(defaultState: T) => {
  const _atomCore = atomCore(defaultState);
  let currentHttpState = defaultHttpState;

  const setHttpState: SetHttpState<T> = (nHttpState, nState) => {
    if (typeof nHttpState === "function") {
      currentHttpState = {
        ...defaultHttpState,
        init: false,
        ...(nHttpState as SetHttpStateFuncArg)(currentHttpState),
      };
    } else {
      currentHttpState = {
        ...defaultHttpState,
        init: false,
        ...nHttpState,
      };
    }

    if (nState) {
      _atomCore.setState(nState);
    } else {
      _atomCore.notify();
    }
  };

  const getHttpState = () => currentHttpState;
  const getState: GetHttpState<T> = () => [
    _atomCore.getState(),
    currentHttpState,
  ];

  const reset = () => {
    _atomCore.reset();
    setHttpState(defaultHttpState);
  };

  return {
    subscribe: _atomCore.subscribe,
    setState: _atomCore.setState,
    getCoreState: _atomCore.getState,
    getHttpState,
    getState,
    setHttpState,
    reset,
  };
};
