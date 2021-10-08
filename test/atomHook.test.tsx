import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { httpAtom, useAtom } from "../src";

type UserAtom = {
  name: string | undefined;
  age: number | undefined;
};

const getUserState = () => ({
  name: undefined,
  age: undefined,
});

let userHttpAtom = httpAtom<UserAtom>(getUserState());

describe("Atoms Hook", () => {
  beforeEach(() => {
    userHttpAtom = httpAtom<UserAtom>(getUserState());
  });

  test("init atom", () => {
    const App = () => {
      const [, { loading }] = useAtom(userHttpAtom);
      return (
        <div>
          {loading && <div data-testid="state">loading</div>}
          {!loading && <div data-testid="state">not loading</div>}
          <button
            data-testid="button"
            onClick={() => {
              userHttpAtom.setHttpState({ loaded: true });
            }}
          />
        </div>
      );
    };
    const { getByTestId } = render(<App />);

    expect(getByTestId("state")).toHaveTextContent("not loading");

    fireEvent.click(getByTestId("button"));

    expect(getByTestId("state")).toHaveTextContent("loading");
  });
});
