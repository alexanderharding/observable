# @observable/take

Takes the first `count` values [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed by
the [source](https://jsr.io/@observable/core#source).

## Example

```ts
import { take } from "@observable/take";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe(of([1, 2, 3, 4, 5]), take(2)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// console output:
// "next" 1
// "next" 2
// "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
