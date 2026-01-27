# [@observable/take](https://jsr.io/@observable/take)

Takes the first {@linkcode count} [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed
values from the [source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

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

// Console output:
// "next" 1
// "next" 2
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/take from the @observable library ecosystem.

WHAT IT DOES:
`take(count)` takes only the first `count` values from the source Observable, then calls `return()`.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `take` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { take } from "@observable/take";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  of([1, 2, 3, 4, 5]),
  take(2)
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 1, 2
  return: () => console.log("done"),    // Called after 2 values
  throw: (error) => console.error(error),
});
```

USE WITH INFINITE STREAMS:
```ts
import { interval } from "@observable/interval";

pipe(
  interval(1000),  // Emits 0, 1, 2, ... every second
  take(3)          // Takes only first 3, then returns
).subscribe({ ... });  // 0, 1, 2, then "done"
```

SEE ALSO:
- `drop(count)` — skips first N values
- `takeUntil(notifier)` — takes until notifier emits
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
