# @observable/map

Projects each value from the [source](https://jsr.io/@observable/core#source) to a new value.

## Example

```ts
import { map } from "@observable/map";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(of([1, 2, 3]), map((value) => value * 2)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 2
// "next" 4
// "next" 6
// "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
