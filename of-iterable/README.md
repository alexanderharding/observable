# [@observable/of-iterable](https://jsr.io/@observable/of-iterable)

Projects an
[`Iterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s each value in order, then
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
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

pipe([1, 2, 3], ofIterable()).subscribe({
  signal: new AbortController().signal,
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
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe([1, 2, 3], ofIterable()).subscribe({
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

## Example with Set

```ts
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

pipe(new Set([1, 1, 2, 2, 3, 3]), ofIterable()).subscribe({
  signal: new AbortController().signal,
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

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/of-iterable from the @observable library ecosystem.

WHAT IT DOES:
`ofIterable()` is an operator that converts an Iterable into an Observable that emits values in order, then calls `return()`.

CRITICAL DIFFERENCES FROM RxJS:
- This is an OPERATOR used with pipe() — NOT a standalone factory like RxJS's `of()`
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`

CORRECT USAGE:
```ts
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

// ✓ CORRECT: Use with pipe()
pipe([1, 2, 3], ofIterable()).subscribe({
  signal: new AbortController().signal,
  next: (value) => console.log(value),  // 1, 2, 3
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});

// ✓ Also works with any Iterable
pipe(new Set([1, 2, 3]), ofIterable()).subscribe({ ... });
```

WRONG USAGE:
```ts
// ✗ WRONG: Not a standalone factory
ofIterable([1, 2, 3]).subscribe(...)  // This does NOT work!

// ✗ WRONG: Variadic arguments don't work like RxJS
of(1, 2, 3)  // This does NOT exist!
```

EARLY UNSUBSCRIPTION:
```ts
const controller = new AbortController();
pipe([1, 2, 3], ofIterable()).subscribe({
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
