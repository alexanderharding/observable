# [@observable/reduce](https://jsr.io/@observable/reduce)

Reduces the [source](https://jsrio/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable)'s
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values to a single value when the
[source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { reduce } from "@observable/reduce";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const source = pipe([1, 2, 3], ofIterable());
pipe(source, reduce((previous, current) => previous + current, 0)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 6
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/reduce from the @observable library ecosystem.

WHAT IT DOES:
`reduce()` applies an `accumulator` function over each source Observable's `next`ed value, and `next`s only the final accumulated value (if any) when the source `return`s.

CRITICAL: This library is NOT RxJS. Key differences:
- `reduce` is a standalone function used with `pipe()` — NOT a method on Observable
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`

USAGE PATTERN:
```ts
import { reduce } from "@observable/reduce";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const source = pipe([1, 2, 3], ofIterable());
pipe(source, reduce((previous, current) => previous + current, 0)).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 6 (only the final sum)
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

WRONG USAGE:
```ts
// ✗ WRONG: reduce is NOT a method on Observable
pipe([1, 2, 3], ofIterable()).reduce((a, b) => a + b, 0)  // This does NOT work!
```

ACCUMULATING TO DIFFERENT TYPE:
```ts
pipe(
  source,
  reduce((previous, current) => [...previous, current], [] as Array<number>),
).subscribe({ ... });  // [1, 2, 3]
```

THE ACCUMULATOR RECEIVES AN INDEX:
```ts
reduce((previous, current, index) => {
  console.log(`Index: ${index}`);  // 0, 1, 2
  return previous + current;
}, 0)
```

EMPTY SOURCE:
If the source returns without emitting any values, `reduce` will also return without emitting.
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
