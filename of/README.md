# [@observable/of](https://jsr.io/@observable/of)

[`Next`](https://jsr.io/@observable/core/doc/~/Observer.next)s a sequence of values in order on
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

of([1, 2, 3]).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// Console output:
// "next" 1
// "next" 2
// "next" 3
// "return"
```

## Example with early unsubscription

```ts
import { of } from "@observable/of";

let count = 0;
const controller = new AbortController();

of([1, 2, 3]).subscribe({
  signal: controller.signal,
  next(value) {
    console.log("next", value);
    if (value === 2) controller.abort();
  },
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// Console output:
// "next" 1
// "next" 2
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/of from the @observable library ecosystem.

WHAT IT DOES:
`of()` creates an Observable that emits values from an Iterable in order, then calls `return()`.

CRITICAL DIFFERENCES FROM RxJS:
- Takes a SINGLE Iterable argument — NOT variadic arguments
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`

CORRECT USAGE:
```ts
import { of } from "@observable/of";

const controller = new AbortController();

// ✓ CORRECT: Pass an array (Iterable)
of([1, 2, 3]).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 1, 2, 3
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});

// ✓ Also works with any Iterable
of(new Set([1, 2, 3])).subscribe({ ... });
of("abc").subscribe({ ... });  // 'a', 'b', 'c'
```

WRONG USAGE:
```ts
// ✗ WRONG: Variadic arguments don't work like RxJS
of(1, 2, 3)  // This does NOT work!
```

EARLY UNSUBSCRIPTION:
```ts
const controller = new AbortController();
of([1, 2, 3]).subscribe({
  signal: controller.signal,
  next(value) {
    console.log(value);
    if (value === 2) controller.abort();  // Stops after 2
  },
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
