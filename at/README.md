# [@observable/at](https://jsr.io/@observable/at)

[`Next`](https://jsr.io/@observable/core/doc/~/Observer.next)s only the value at the specified index
integer in a sequence of values from the [source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable). Negative index integers count back
from the last item in the sequence.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

```ts
import { at } from "@observable/at";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

pipe(forOf([1, 2, 3]), at(1)).subscribe({
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 2
// "return"
```

```ts
import { at } from "@observable/at";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

pipe(forOf([1, 2, 3]), at(-1)).subscribe({
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 3
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
