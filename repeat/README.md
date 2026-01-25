# [@observable/repeat](https://jsr.io/@observable/repeat)

Re-[`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe)s to the
[source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) each time it
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s, as long as the
[notifier](https://jsr.io/@observable/core#notifier)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) then
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s a value. Stops repeating if the
[notifier](https://jsr.io/@observable/core#notifier)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s without
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ing a value or it
[`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw)s a value.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { repeat } from "@observable/repeat";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";
import { empty } from "@observable/empty";
import { defer } from "@observable/defer";

const source = of([1, 2, 3]);
const controller = new AbortController();
const repeated = defer(() => {
  let count = 0;
  return pipe(
    source,
    repeat(defer(() => {
      console.log("notifier subscribed");
      return ++count === 2 ? empty : of([undefined]);
    })),
  );
});

repeated.subscribe({
  signal: observer.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 1
// "next" 2
// "next" 3
// "notifier subscribed"
// "next" 1
// "next" 2
// "next" 3
// "notifier subscribed"
// "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
