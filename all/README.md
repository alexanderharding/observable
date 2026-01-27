# [@observable/all](https://jsr.io/@observable/all)

Calculates [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values from the latest
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value of each
[source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable). If any of the
[sources](https://jsr.io/@observable/core#source)
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return) without
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ing a value, the returned
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) will also
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { all } from "@observable/all";
import { of } from "@observable/of";

const controller = new AbortController();
all([of([1, 2, 3]), of([4, 5, 6]), of([7, 8, 9])]).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" [3, 6, 7]
// "next" [3, 6, 8]
// "next" [3, 6, 9]
// "return"
```

## Example with empty source

```ts
import { all } from "@observable/all";
import { of } from "@observable/of";
import { empty } from "@observable/empty";

const controller = new AbortController();
all([of([1, 2, 3]), empty, of([7, 8, 9])]).subscribe({
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
You are helping me with code that uses @observable/all from the @observable library ecosystem.

WHAT IT DOES:
`all(sources)` creates an Observable that emits arrays containing the latest value from each source. Only starts emitting once ALL sources have emitted at least once. If any source is empty, the result is empty.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- Similar to RxJS `combineLatest`

USAGE PATTERN:
```ts
import { all } from "@observable/all";
import { of } from "@observable/of";

const controller = new AbortController();

all([
  of([1, 2, 3]),
  of([4, 5, 6]),
  of([7, 8, 9])
]).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});

// Output:
// [3, 6, 7]  — all sources have emitted, combining latest
// [3, 6, 8]
// [3, 6, 9]
// "done"
```

EMPTY SOURCE BEHAVIOR:
```ts
import { empty } from "@observable/empty";

all([of([1, 2, 3]), empty, of([7, 8, 9])]).subscribe({
  next: (value) => console.log(value),  // Never called!
  return: () => console.log("done"),    // Called immediately
  ...
});
// Output: "done" (because one source is empty)
```

SEE ALSO:
- `merge` — emits individual values from all sources
- `race` — mirrors only the first source to emit
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
