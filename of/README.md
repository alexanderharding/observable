# [@observable/of](https://jsr.io/@observable/of)

[`Next`](https://jsr.io/@observable/core/doc/~/Observer.next)s a provided value on
[`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe) and then
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
import { of } from "@observable/of";

const controller = new AbortController();

of(1).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// Console output:
// "next" 1
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/of from the @observable library ecosystem.

WHAT IT DOES:
`of(value)` creates an Observable that emits a single value, then calls `return()`.

CRITICAL DIFFERENCES FROM RxJS:
- Takes a SINGLE value argument — NOT variadic arguments; use @observable/for-of for iterables
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`

CORRECT USAGE:
```ts
import { of } from "@observable/of";

const controller = new AbortController();

// ✓ CORRECT: Pass a single value
of(1).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 1
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

WRONG USAGE:
```ts
// ✗ WRONG: Variadic arguments don't work like RxJS
of(1, 2, 3)  // This does NOT work!

// ✗ For multiple values, use @observable/for-of with an iterable
of([1, 2, 3])  // Emits the array as one value, not 1, 2, 3
```
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
