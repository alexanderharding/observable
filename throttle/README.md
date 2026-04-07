# [@observable/throttle](https://jsr.io/@observable/throttle)

Throttles each value by the given number of `milliseconds`.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

Positive integer milliseconds

```ts
import { throttle } from "@observable/throttle";
import { Subject } from "@observable/core";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const subject = new Subject<number>();

pipe(subject, throttle(100)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

subject.next(1); // Emitted immediately
subject.next(2); // Ignored (within throttle window)
subject.next(3); // Ignored (within throttle window)

// After 100ms, the next value will be emitted
subject.next(4); // Emitted after throttle window

// Console output:
// "next" 1
// (after 100ms)
// "next" 4
```

0 milliseconds

```ts
import { throttle } from "@observable/throttle";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(forOf([1, 2, 3]), throttle(0)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (synchronously):
// "next" 1
// "next" 2
// "next" 3
// "return"
```

Negative integer milliseconds

```ts
import { throttle } from "@observable/throttle";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(forOf([1, 2, 3]), throttle(-1)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (synchronously):
// "return"
```

NaN milliseconds

```ts
import { throttle } from "@observable/throttle";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(forOf([1, 2, 3]), throttle(NaN)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (synchronously):
// "return"
```

Infinity milliseconds

```ts
import { throttle } from "@observable/throttle";
import { Subject } from "@observable/core";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const subject = new Subject<number>();

pipe(subject, throttle(Infinity)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

subject.next(1);
subject.next(2);
subject.return();

// Console output (synchronously):
// "next" 1
// "return"
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
