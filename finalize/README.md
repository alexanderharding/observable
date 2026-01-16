# @observable/finalize

The [producer](https://jsr.io/@observable/core#producer) is notifying the
[consumer](https://jsr.io/@observable/core#consumer) that it's done
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ing values for any reason, and will
send no more values. Finalization, if it occurs, will always happen as a side-effect _after_
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return),
[`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw), or
[`unsubscribe`](https://jsr.io/@observable/core/doc/~/Observer.signal) (whichever comes last).

## Example

```ts
import { finalize } from "@observable/finalize";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe(of([1, 2, 3]), finalize(() => console.log("finalized"))).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 1
// "next" 2
// "next" 3
// "return"
// "finalized"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
