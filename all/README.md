# @observable/all

Creates and returns an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) whose
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values are calculated from the
latest [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values of each of its
[sources](https://jsr.io/@observable/core#source). If any of the
[sources](https://jsr.io/@observable/core#source) are empty, the returned
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) will also be empty.

## Example

```ts
import { all } from "@observable/all";
import { of } from "@observable/of";

const controller = new AbortController();
all([of([1, 2, 3]), of([4, 5, 6]), of([7, 8, 9])]).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" [3, 6, 7]
// "next" [3, 6, 8]
// "next" [3, 6, 9]
// "return"
```

## Example with empty source

```ts
import { all } from "@observable/all";
import { of } from "@observable/of";
import { empty } from "@observable/empty";

const controller = new AbortController();
all([of([1, 2, 3]), empty, of([7, 8, 9])]).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
