# [@observable/finalize](https://jsr.io/@observable/finalize)

The [producer](https://jsr.io/@observable/core#producer) is notifying the
[consumer](https://jsr.io/@observable/core#consumer) that it's done
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ing values for any reason, and will
send no more values. Finalization, if it occurs, will always happen as a side-effect _after_
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return),
[`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw), or
[`unsubscribe`](https://jsr.io/@observable/core/doc/~/Observer.signal) (whichever comes last).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

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

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/finalize from the @observable library ecosystem.

WHAT IT DOES:
`finalize(callback)` calls the callback when the subscription ends for ANY reason — `return()`, `throw()`, or unsubscription via `abort()`. Always runs as a side-effect AFTER the terminal event.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `finalize` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { finalize } from "@observable/finalize";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  of([1, 2, 3]),
  finalize(() => console.log("finalized"))
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("return"),
  throw: (error) => console.error("throw", error),
});
// Output:
// 1
// 2
// 3
// "return"
// "finalized"
```

CLEANUP ON UNSUBSCRIPTION:
```ts
pipe(
  interval(1000),
  finalize(() => console.log("Cleaned up!"))
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  ...
});

controller.abort();  // Triggers: "Cleaned up!"
```

COMMON USE — Resource cleanup:
```ts
pipe(
  webSocketConnection,
  finalize(() => {
    console.log("Closing connection...");
    socket.close();
  })
).subscribe({ ... });
```
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
