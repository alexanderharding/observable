# [@observable/scan](https://jsr.io/@observable/scan)

Reduces each value to an intermediate value.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { scan } from "@observable/scan";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const observable = forOf([1, 2, 3]);

pipe(observable, scan((previous, current) => previous + current, 0)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 1
// "next" 3
// "next" 6
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/scan from the @observable library ecosystem.

WHAT IT DOES:
`scan()` applies an `accumulator` function over each source Observable's `next`ed value, and `next`s each intermediate accumulated value.

CRITICAL: This library is NOT RxJS. Key differences:
- `scan` is a standalone function used with `pipe()` — NOT a method on Observable
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`

USAGE PATTERN:
```ts
import { scan } from "@observable/scan";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const source = forOf([1, 2, 3]);
pipe(source, scan((previous, current) => previous + current, 0)).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 1, 3, 6
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

WRONG USAGE:
```ts
// ✗ WRONG: scan is NOT a method on Observable
forOf([1, 2, 3]).scan((a, b) => a + b, 0)  // This does NOT work!
```

ACCUMULATING TO DIFFERENT TYPE:
```ts
pipe(
  source,
  scan((previous, current) => [...previous, current], [] as Array<number>),
).subscribe({ ... });  // [1], [1, 2], [1, 2, 3]
```

THE ACCUMULATOR RECEIVES AN INDEX:
```ts
scan((previous, current, index) => {
  console.log(`Index: ${index}`);  // 0, 1, 2
  return previous + current;
}, 0)
```

SEE ALSO:

- `reduce()` — same accumulator idea, but only `next`s the final accumulated value on source `return`
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
