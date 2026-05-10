# [@observable/for-of](https://jsr.io/@observable/for-of)

[Pushes](https://jsr.io/@observable/core#push) each
[iterated](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
[`value`](https://jsr.io/@observable/for-of/doc/~/forOf#type_param_value) in order.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

Populate array

```ts
import { forOf } from "@observable/for-of";

const controller = new AbortController();

forOf([1, 2, 3]).subscribe({
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

Empty array

```ts
import { forOf } from "@observable/for-of";

const controller = new AbortController();

forOf([]).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// Console output (synchronously):
// "return"
```

Iterable

```ts
import { forOf } from "@observable/for-of";

const controller = new AbortController();

forOf(new Set([1, 2, 1, 2, 3, 3])).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// Console output (synchronously):
// "next" 1
// "next" 2
// "next" 3
// "return"
```

## AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/for-of from the @observable library ecosystem.

WHAT IT DOES:
`forOf(iterable)` creates an Observable that synchronously emits each value of an Iterable (Array, Set, Map, generator, etc.) in order, then calls `return()`. An empty iterable emits no values and immediately calls `return()`.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- Takes a SINGLE Iterable argument — NOT variadic arguments; use `of` for a single value

CORRECT USAGE:
```ts
import { forOf } from "@observable/for-of";

const controller = new AbortController();

forOf([1, 2, 3]).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 1, 2, 3
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

WORKS WITH ANY ITERABLE:
```ts
forOf(new Set([1, 2, 1, 3]));            // 1, 2, 3
forOf(new Map([["a", 1], ["b", 2]]));    // ["a", 1], ["b", 2]
forOf("abc");                             // "a", "b", "c"
function* gen() { yield 1; yield 2; }
forOf(gen());                             // 1, 2
```

WRONG USAGE:
```ts
// ✗ WRONG: Variadic arguments don't work like RxJS's `of`
forOf(1, 2, 3)  // This does NOT work!

// ✗ For a single non-iterable value, use @observable/of
forOf(42)       // 42 is not iterable
```

SEE ALSO:
- `of(value)` — emits a single value
- `for-in` — emits each key of an object
````

## Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
