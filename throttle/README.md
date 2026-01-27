# [@observable/throttle](https://jsr.io/@observable/throttle)

Throttles the [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values from the
[source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) by the specified number of
{@linkcode milliseconds}.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { throttle } from "@observable/throttle";
import { Subject } from "@observable/core";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const source = new Subject<number>();

pipe(source, throttle(100)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

source.next(1); // Emitted immediately
source.next(2); // Ignored (within throttle window)
source.next(3); // Ignored (within throttle window)

// After 100ms, the next value will be emitted
source.next(4); // Emitted after throttle window

// Console output:
// "next" 1
// (after 100ms)
// "next" 4
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/throttle from the @observable library ecosystem.

WHAT IT DOES:
`throttle(ms)` emits the first value immediately, then ignores subsequent values for `ms` milliseconds. Useful for rate-limiting scroll events, button clicks, etc.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `throttle` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { throttle } from "@observable/throttle";
import { Subject } from "@observable/core";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const scroll = new Subject<number>();

pipe(
  scroll,
  throttle(100)  // At most one emission per 100ms
).subscribe({
  signal: controller.signal,
  next: (value) => console.log("scroll position:", value),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});

scroll.next(10);  // logs: 10 (immediately)
scroll.next(20);  // (ignored — within 100ms window)
scroll.next(30);  // (ignored — within 100ms window)
// After 100ms...
scroll.next(40);  // logs: 40
```

SEE ALSO:
- `debounce(ms)` — waits for silence before emitting
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
