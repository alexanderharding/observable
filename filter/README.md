# @observable/filter

Filters [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values from the
[source](https://jsr.io/@observable/core#source) that satisfy a specified predicate.

## Example

```ts
import { filter } from "@observable/filter";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe(of([1, 2, 3, 4, 5]), filter((value) => value % 2 === 0)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// console output:
// "next" 2
// "next" 4
// "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
