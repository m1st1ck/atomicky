import {
  waitForAtom,
  waitForAtoms,
  atom,
  httpAtom,
  defaultHttpState,
} from "../src/index";

type UserAtom = {
  name?: string;
};

const userAtom = atom<UserAtom>({
  name: undefined,
});

const userHttpAtom = httpAtom<UserAtom>({
  name: undefined,
});

const countAtom = atom<number>(0);

describe("Utils", () => {
  beforeEach(() => {
    userAtom.reset();
    countAtom.reset();
    userHttpAtom.reset();
  });

  test("waitForAtom", async (done) => {
    setTimeout(() => {
      userAtom.setState({ name: "Stad" });
    }, 0);

    await waitForAtom(userAtom, (data) => data.name === "Stad");

    expect(userAtom.getState().name).toBe("Stad");
    done();
  });

  test("waitForAtom stop", async (done) => {
    const timeout = setTimeout(() => {
      expect(userAtom.getState().name).toBe(undefined);
      done();
    }, 0);

    await waitForAtom(userAtom, ({ name }) => name === "Stad");

    clearTimeout(timeout);
  });

  test("waitForAtom http", async (done) => {
    setTimeout(() => {
      userHttpAtom.setHttpState({ loaded: true }, { name: "Stad" });
    }, 0);

    await waitForAtom(userHttpAtom, ([, { loaded }]) => loaded);

    expect(userHttpAtom.getCoreState().name).toBe("Stad");
    expect(userHttpAtom.getHttpState()).toMatchObject({
      init: false,
      loading: false,
      loaded: true,
      error: false,
      errorMessage: undefined,
    });

    done();
  });

  test("waitForAtom http stop", async (done) => {
    const timeout = setTimeout(() => {
      expect(userHttpAtom.getState()[0].name).toBe(undefined);
      expect(userHttpAtom.getState()[1]).toMatchObject(defaultHttpState);
      done();
    }, 0);

    await waitForAtom(
      userHttpAtom,
      ([{ name }, { loaded }]) => name === "Stad" && loaded
    );

    clearTimeout(timeout);
  });

  test("waitForAtoms", async (done) => {
    userAtom.setState({ name: "Stad" });
    countAtom.setState(3);

    await waitForAtoms(
      [userAtom, countAtom],
      ([{ name }, count]) => name === "Stad" && count === 3
    );

    expect(userAtom.getState().name).toBe("Stad");
    expect(countAtom.getState()).toBe(3);
    done();
  });

  test("waitForAtoms http", async (done) => {
    setTimeout(() => {
      userHttpAtom.setHttpState({ loaded: true }, { name: "Stad" });
      countAtom.setState(2);
    }, 0);

    await waitForAtoms(
      [countAtom, userHttpAtom],
      ([countData, [, httpStatus]]) => httpStatus.loaded || countData === 3
    );

    expect(userHttpAtom.getState()[0].name).toBe("Stad");
    expect(countAtom.getState()).toBe(2);
    done();
  });

  test("waitForAtoms http stop", async (done) => {
    userHttpAtom.setHttpState({ loaded: true }, { name: "Stad" });

    const timeout = setTimeout(() => {
      expect(userHttpAtom.getState()[0].name).toBe("Stad");
      expect(userHttpAtom.getState()[1].loaded).toBe(true);
      expect(countAtom.getState()).toBe(0);
      done();
    }, 100);

    await waitForAtoms(
      [countAtom, userHttpAtom],
      ([countData, [userData, httpStatus]]) =>
        httpStatus.loaded && userData.name === "Stad" && countData === 3
    );

    clearTimeout(timeout);
  });
});
