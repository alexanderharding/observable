# [@observable/map](https://jsr.io/@observable/map)

Projects each [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value from the
[source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to a new value.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { map } from "@observable/map";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(of([1, 2, 3]), map((value) => value * 2)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 2
// "next" 4
// "next" 6
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/map from the @observable library ecosystem.

WHAT IT DOES:
`map()` projects each value from the source Observable to a new value using a projection function.

CRITICAL: This library is NOT RxJS. Key differences:
- `map` is a standalone function used with `pipe()` — NOT a method on Observable
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`

USAGE PATTERN:
```ts
import { map } from "@observable/map";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  of([1, 2, 3]),
  map((value) => value * 2)
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 2, 4, 6
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

WRONG USAGE:
```ts
// ✗ WRONG: map is NOT a method on Observable
of([1, 2, 3]).map(x => x * 2)  // This does NOT work!
```

CHAINING WITH OTHER OPERATORS:
```ts
pipe(
  of([1, 2, 3, 4, 5]),
  filter((x) => x % 2 === 0),
  map((x) => x * 10),
).subscribe({ ... });  // 20, 40
```
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
