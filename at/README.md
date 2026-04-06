# [@observable/at](https://jsr.io/@observable/at)

Filters [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values from the
[source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to only the
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value at the given `index`. Negative
`indices` count back from the last [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed
value in the sequence.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

Positive index integer

```ts
import { at } from "@observable/at";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { tap } from "@observable/tap";

const controller = new AbortController();

pipe(forOf([1, 2, 3]), tap((value) => console.log("tap next", value)), at(1)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "tap next" 1
// "tap next" 2
// "next" 2
// "return"
```

Positive index fractional

```ts
import { at } from "@observable/at";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { tap } from "@observable/tap";

const controller = new AbortController();

pipe(forOf([1, 2, 3]), tap((value) => console.log("tap next", value)), at(1.7)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "tap next" 1
// "tap next" 2
// "next" 2
// "return"
```

0 index

```ts
import { at } from "@observable/at";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { tap } from "@observable/tap";

const controller = new AbortController();

pipe(forOf([1, 2, 3]), tap((value) => console.log("tap next", value)), at(0)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "tap next" 1
// "next" 1
// "return"
```

Negative index integer

```ts
import { at } from "@observable/at";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { tap } from "@observable/tap";

const controller = new AbortController();

pipe(forOf([1, 2, 3]), tap((value) => console.log("tap next", value)), at(-1)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "tap next" 1
// "tap next" 2
// "tap next" 3
// "next" 3
// "return"
```

Negative index fractional

```ts
import { at } from "@observable/at";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { tap } from "@observable/tap";

const controller = new AbortController();

pipe(forOf([1, 2, 3]), tap((value) => console.log("tap next", value)), at(-1.7)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "tap next" 1
// "tap next" 2
// "tap next" 3
// "next" 3
// "return"
```

Infinity index

```ts
import { at } from "@observable/at";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { tap } from "@observable/tap";

const controller = new AbortController();

pipe(forOf([1, 2, 3]), tap((value) => console.log("tap next", value)), at(Infinity)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "tap next" 1
// "tap next" 2
// "tap next" 3
// "return"
```

-Infinity index

```ts
import { at } from "@observable/at";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { tap } from "@observable/tap";

const controller = new AbortController();

pipe(forOf([1, 2, 3]), tap((value) => console.log("tap next", value)), at(-Infinity)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "tap next" 1
// "tap next" 2
// "tap next" 3
// "return"
```

NaN index

```ts
import { at } from "@observable/at";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { tap } from "@observable/tap";

const controller = new AbortController();

pipe(forOf([1, 2, 3]), tap((value) => console.log("tap next", value)), at(NaN)).subscribe({
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
You are helping me with code that uses @observable/at from the @observable library ecosystem.

WHAT IT DOES:
`at(index)` emits only the value at the given index (0-based) from the source Observable. Negative index counts from the end (e.g. -1 = last, -2 = second-to-last). If the source has fewer items than needed, it emits nothing and then returns.

CRITICAL: This library is NOT RxJS. Key differences:
- `at` is a standalone function used with `pipe()` — NOT a method on Observable
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`

USAGE PATTERN:
```ts
import { at } from "@observable/at";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  forOf([1, 2, 3]),
  at(1)
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 2
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

NEGATIVE INDEX:
```ts
pipe(forOf([10, 20, 30]), at(-1)).subscribe({ ... });  // 30 (last)
pipe(forOf([10, 20, 30]), at(-2)).subscribe({ ... });  // 20 (second-to-last)
```

WRONG USAGE:
```ts
// ✗ WRONG: at is NOT a method on Observable
forOf([1, 2, 3]).at(1)  // This does NOT work!
```

SEE ALSO:
- `take(count)` — first N values
- `drop(count)` — skip first N values
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
