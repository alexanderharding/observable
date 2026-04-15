# [@observable/replay-subject](https://jsr.io/@observable/replay-subject)

A variant of [`Subject`](https://jsr.io/@observable/core/doc/~/Subject) that
[pushes](https://jsr.io/@observable/core#push) the last of the given `count` of values to
[`consumers`](https://jsr.io/@observable/core#consumer) upon
[`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

Positive integer count

```ts
import { ReplaySubject } from "@observable/replay-subject";

const subject = new ReplaySubject<number>(3);
const controller = new AbortController();

subject.next(1); // Stored in buffer
subject.next(2); // Stored in buffer
subject.next(3); // Stored in buffer
subject.next(4); // Stored in buffer and 1 gets trimmed off

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 2
// "next" 3
// "next" 4

// Values pushed after the subscribe will emit immediately
// unless the subject is already finalized.
subject.next(5); // Stored in buffer and 2 gets trimmed off

// Console output:
// "next" 5

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 3
// "next" 4
// "next" 5

subject.return();

// Console output:
// "return"
// "return"

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "return"
```

Positive fractional count

```ts
import { ReplaySubject } from "@observable/replay-subject";

const subject = new ReplaySubject<number>(3.7);
const controller = new AbortController();

subject.next(1); // Stored in buffer
subject.next(2); // Stored in buffer
subject.next(3); // Stored in buffer
subject.next(4); // Stored in buffer and 1 gets trimmed off

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 2
// "next" 3
// "next" 4

// Values pushed after the subscribe will emit immediately
// unless the subject is already finalized.
subject.next(5); // Stored in buffer and 2 gets trimmed off

// Console output:
// "next" 5

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 3
// "next" 4
// "next" 5

subject.return();

// Console output:
// "return"
// "return"

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "return"
```

0 count

```ts
import { ReplaySubject } from "@observable/replay-subject";

const subject = new ReplaySubject<number>(0);
const controller = new AbortController();

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

subject.next(5);

// Console output:
// "next" 5

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

subject.return();

// Console output:
// "return"
// "return"

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "return"
```

Negative integer count

```ts
import { ReplaySubject } from "@observable/replay-subject";

const subject = new ReplaySubject<number>(-3);
const controller = new AbortController();

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "return"

subject.next(5);

// (no output — subject is finalized)

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "return"
```

Negative fractional count

```ts
import { ReplaySubject } from "@observable/replay-subject";

const subject = new ReplaySubject<number>(-3.7);
const controller = new AbortController();

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "return"

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "return"
```

Infinite count

```ts
import { ReplaySubject } from "@observable/replay-subject";

const subject = new ReplaySubject<number>(Infinity);
const controller = new AbortController();

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 1
// "next" 2
// "next" 3
// "next" 4

subject.next(5);

// Console output:
// "next" 5

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 1
// "next" 2
// "next" 3
// "next" 4
// "next" 5

subject.return();

// Console output:
// "return"
// "return"

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "return"
```

NaN count

```ts
import { ReplaySubject } from "@observable/replay-subject";

const subject = new ReplaySubject<number>(NaN);
const controller = new AbortController();

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "return"

subject.next(5);

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/replay-subject from the @observable library ecosystem.

WHAT IT DOES:
`ReplaySubject` is a Subject that buffers the last N emitted values and replays them to new consumers upon `subscribe`. The buffer size is `Math.trunc(count)` (toward zero); values in `(-1, 0)` truncate to `0` (no replay buffer, not finalized). If the truncated count is negative or `NaN`, the subject finalizes at construction; `Infinity` is unchanged and does not finalize.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- Subject uses `next()`, `return()`, `throw()` — NOT `next()`, `complete()`, `error()`

USAGE PATTERN:
```ts
import { ReplaySubject } from "@observable/replay-subject";

const subject = new ReplaySubject<number>(3);  // Buffer size of 3
const controller = new AbortController();

subject.next(1);  // Buffered
subject.next(2);  // Buffered
subject.next(3);  // Buffered
subject.next(4);  // Buffered (1 is trimmed)

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 2, 3, 4
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});

subject.next(5);  // logs: 5 (also buffered, 2 is trimmed)
```

NEW CONSUMER GETS BUFFER:
```ts
// Later consumer
subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("New:", value),  // 3, 4, 5
  ...
});
```

AFTER RETURN:
New consumers to a ReplaySubject that has already returned receive only `return()`:
```ts
subject.return();
subject.subscribe({
  next: (value) => console.log(value),  // Never called
  return: () => console.log("done"),     // Called immediately
  ...
});
```

SEE ALSO:
- `Subject` — no replay, only future values
- `BehaviorSubject` — requires initial value, replays current value
- `AsyncSubject` — emits last value only on return
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
