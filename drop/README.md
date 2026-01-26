# [@observable/drop](https://jsr.io/@observable/drop)

Drops the first `count` values [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed by
the [source](https://jsr.io/@observable/core#source).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { drop } from "@observable/drop";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe(of([1, 2, 3, 4, 5]), drop(2)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 3
// "next" 4
// "next" 5
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/drop from the @observable library ecosystem.

WHAT IT DOES:
`drop(count)` skips the first `count` values from the source Observable, then emits the rest.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `drop` is a standalone function used with `pipe()` — NOT a method on Observable
- Called `drop` here, similar to RxJS's `skip`

USAGE PATTERN:
```ts
import { drop } from "@observable/drop";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  of([1, 2, 3, 4, 5]),
  drop(2)
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 3, 4, 5
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

COMBINING WITH TAKE:
```ts
// Get items 3-5 from a sequence
pipe(
  of([1, 2, 3, 4, 5, 6, 7]),
  drop(2),   // Skip first 2
  take(3),   // Take next 3
).subscribe({ ... });  // 3, 4, 5
```

SEE ALSO:
- `take(count)` — takes only first N values
- `filter(predicate)` — filters by condition
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
