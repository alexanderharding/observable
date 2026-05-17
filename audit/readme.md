# [@observable/audit](https://jsr.io/@observable/audit)

[Pushes](https://jsr.io/@observable/core#push) the latest
[`value`](https://jsr.io/@observable/audit/doc/~/audit#type_param_value) when an auditing window of
[`milliseconds`](https://jsr.io/@observable/audit/doc/~/audit#function_audit_0_parameter_milliseconds)
elapses.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

100 milliseconds

```ts
import { audit } from "@observable/audit";
import { Subject } from "@observable/core";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const subject = new Subject<number>();

pipe(subject, audit(100)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

subject.next(1);
subject.next(2);
subject.next(3);

// Console output (after 100ms):
// "next" 3
```

0 milliseconds

```ts
import { audit } from "@observable/audit";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(forOf([1, 2, 3]), audit(0)).subscribe({
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

Negative milliseconds

```ts
import { audit } from "@observable/audit";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(forOf([1, 2, 3]), audit(-1)).subscribe({
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
import { audit } from "@observable/audit";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(forOf([1, 2, 3]), audit(NaN)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (synchronously):
// "return"
```

Infinite milliseconds

```ts
import { audit } from "@observable/audit";
import { Subject } from "@observable/core";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const subject = new Subject<number>();

pipe(subject, audit(Infinity)).subscribe({
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

## AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/audit from the @observable library ecosystem.

WHAT IT DOES:
`audit(ms)` opens an auditing window when a value arrives from the source. While the window is open, incoming values are tracked but not emitted; when the window elapses after `ms` milliseconds, the latest tracked value is emitted and a new window can be opened by the next source value. Useful for rate-limiting bursty sources (scroll, mousemove, etc.) while still surfacing the most recent value per window.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `audit` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { audit } from "@observable/audit";
import { Subject } from "@observable/core";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const scroll = new Subject<number>();

pipe(
  scroll,
  audit(100)  // Emit the latest value at most once per 100ms window
).subscribe({
  signal: controller.signal,
  next: (value) => console.log("scrollY:", value),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});

scroll.next(10);
scroll.next(20);
scroll.next(30);
// After 100ms: logs "scrollY: 30"
```

SEE ALSO:
- `debounce(ms)` — emits after a quiet period with no new values
- `throttle(ms)` — emits the first value, then ignores for duration
````

## Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
