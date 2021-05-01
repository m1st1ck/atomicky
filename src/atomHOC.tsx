import * as React from "react";
import { ObservableAtom, IterateAtomsIteratable, Unsubscribe } from "./atom";

type AtomsMap = {
  [name: string]: ObservableAtom<any>;
};

type InferWithAtomParams<T> = T extends (
  WrappedComponent: any,
  noop?: infer G
) => any
  ? G
  : unknown;

export type GetWithAtomProps<T> = {
  atoms: IterateAtomsIteratable<InferWithAtomParams<T>>;
};

type WithAtom = <T extends AtomsMap>(
  atoms: T
) => <P extends unknown>(
  WrappedComponent: React.ComponentType<P>,
  // TODO: need better way to infer props
  noop?: T
) => any;

export const withAtom: WithAtom = (atoms) => <P extends unknown>(
  WrappedComponent: React.ComponentType<P>
) =>
  class extends React.Component<P> {
    atomSubscriptions: Unsubscribe[] = [];

    constructor(props: any) {
      super(props);

      const state: AtomsMap = {};

      Object.keys(atoms).forEach((atomName) => {
        const atom = atoms[atomName];
        this.atomSubscriptions.push(
          atom.subscribe(() => {
            this.setState({
              [atomName]: atom.getState(),
            });
          })
        );
        state[atomName] = atom.getState();
      });

      this.state = state;
    }

    componentWillUnmount() {
      this.atomSubscriptions.forEach((unsub) => unsub());
    }

    render() {
      return <WrappedComponent atoms={this.state} {...this.props} />;
    }
  };
