# [@observable/share](https://jsr.io/@observable/share)

Shares a single [consumer](https://jsr.io/@observable/core#consumer) of the
[source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable), forwarding
[`notifications`](https://jsr.io/@observable/core#notification) to all
[consumers](https://jsr.io/@observable/core#consumer) of the output
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) through a
[`Subject`](https://jsr.io/@observable/core/doc/~/Subject) created by a factory function. Resets on
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return),
[`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw), or when on all
[consumers](https://jsr.io/@observable/core#consumer)
[abort](https://jsr.io/@observable/core/doc/~/Observer.signal).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { share } from "@observable/share";
import { timeout } from "@observable/timeout";
import { pipe } from "@observable/pipe";

const shared = pipe(timeout(1_000), share());
const controller = new AbortController();
shared.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});
shared.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (after 1 second):
// "next" 0
// "next" 0
// "return"
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/share from the @observable library ecosystem.

WHAT IT DOES:
`share()` multicasts a source Observable through a Subject, sharing a single source Observer among multiple consumers. Resets when all consumers abort or when the source returns/throws.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `share` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { share } from "@observable/share";
import { timeout } from "@observable/timeout";
import { pipe } from "@observable/pipe";

const shared = pipe(timeout(1_000), share());
const controller = new AbortController();

// Both consumers share the same source Observer
shared.subscribe({
  signal: controller.signal,
  next: (value) => console.log("A:", value),
  return: () => console.log("A done"),
  throw: (error) => console.error("A error:", error),
});

shared.subscribe({
  signal: controller.signal,
  next: (value) => console.log("B:", value),
  return: () => console.log("B done"),
  throw: (error) => console.error("B error:", error),
});

// After 1 second:
// "A:" 0
// "B:" 0
// "A done"
// "B done"
```

HOT VS COLD:
- Without `share()`: Each consumer creates a new source Observer (cold)
- With `share()`: All consumers share one source Observer (hot)

RESET BEHAVIOR:
The shared source Observer resets when:
- All consumers abort
- The source returns (`return()`)
- The source throws (`throw()`)

SEE ALSO:
- `Subject` — for manual multicasting
- `BehaviorSubject` — for multicasting with current value
- `ReplaySubject` — for multicasting with value replay
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
