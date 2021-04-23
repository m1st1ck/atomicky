# Atomicky

State management with small atomic chunks

### atom

```javascript
import { atom } from "atomicky";

// create new atom
const countAtom = atom(0);
// change state
countAtom.setState(2);
// change state with callback function
countAtom.setState((previousCount) => previousCount + 1);
// get state
const count = countAtom.getState(); // count === 3
// listen for changes to state
const unsubscribe = countAtom.subscribe(() => {
  // do something with new state
  const count = countAtom.getState();
});
// stop listening for changes
unsubscribe();
// reset to default state
countAtom.reset();
```

### httpAtom

contains an additional http state

```javascript
{
  init: true,
  loading: false,
  loaded: false,
  error: false,
  errorMessage: undefined,
}
```

it provides addition functionallities to manage both states

```javascript
import { httpAtom } from "atomicky";

// create new http atom
const countAtom = httpAtom(0);
// getState returns a tuple both states
const [count, httpState] = countAtom.getState();
// get atom state only
const count = countAtom.getCoreState();
// get http state only
const httpState = countAtom.getHttpState();
// update http state - will override previus state
countAtom.setHttpState({ loading: true }); // { loading: true, init: false, error: false, ... }
// update both state
countAtom.setHttpState({ loaded: true }, 4); // count === 4
```
### useAtom
```javascript
import { httpAtom, atom, useAtom } from "atomicky";

const nameAtom = httpAtom("Stad");
const countAtom = atom(0);
// listen for state changes and rerender component
const [name, { loading }] = useAtom(nameAtom);
const count = useAtom(countAtom);
```

### Exaples
```javascript
import { httpAtom } from "atomicky";

const userAtom = httpAtom<User>(undefined);

userAtom.setHttpState({ loading: true });
fetch("/user")
  .then((res) => {
    userAtom.setHttpState({ loaded: true }, res);
  })
  .catch((err) => {
    userAtom.setHttpState({ error: true, errorMessage: err });
  });
```

```javascript
import { atom } from "atomicky";

const userAtom = atom({ name: "Stad", age: 2 });
// updating objects directly will merge with previous state
userAtom.setState({ age: 3 }); // { name: "Stad", age: 3 }
// using update function needs to provide the whole object
userAtom.setState((prevState) => ({
  ...prevState,
  age: 4
}));
```