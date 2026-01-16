# @observable/tap

Used to perform side-effects on the [source](https://jsr.io/@observable/core#source).

## Example

```ts
import { tap } from "@observable/tap";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const subscriptionController = new AbortController();
const tapController = new AbortController();

pipe(
  of([1, 2, 3]),
  tap({
    signal: tapController.signal,
    next(value) {
      if (value === 2) controller.abort();
      console.log("tap next", value);
    },
    return: () => console.log("tap return"),
    throw: (value) => console.log("tap throw", value),
  }),
).subscribe({
  signal: subscriptionController.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// console output:
// "tap next" 1
// "next" 1
// "tap next" 2
// "next" 2
// "next" 3
// "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
