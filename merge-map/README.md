# @observable/merge-map

Projects each [source](https://jsr.io/@observable/core#source) value to an
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which is merged in the output
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable).

## Example

```ts
import { mergeMap } from "@observable/merge-map";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const observableLookup = {
  1: of([1, 2, 3]),
  2: of([4, 5, 6]),
  3: of([7, 8, 9]),
} as const;
pipe(
  of([1, 2, 3]),
  mergeMap((value) => observableLookup[value]),
).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 1
// "next" 2
// "next" 3
// "next" 4
// "next" 5
// "next" 6
// "next" 7
// "next" 8
// "next" 9
// "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
