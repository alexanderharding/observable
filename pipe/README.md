# [@observable/pipe](https://jsr.io/@observable/pipe)

A utility to pipe a value through a series of unary functions. Though this is not specific to
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable)s, it's a core component in
composing [observation chains](https://jsr.io/@observable/core#observation-chain).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { pipe } from "@observable/pipe";
import { ofIterable } from "@observable/of-iterable";
import { map } from "@observable/map";
import { filter } from "@observable/filter";

const controller = new AbortController();

pipe(
  [1, 2, 3, 4, 5],
  ofIterable(),
  filter((value) => value % 2 === 0),
  map((value) => value * 2),
).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 4
// "next" 8
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/pipe from the @observable library ecosystem.

WHAT IT DOES:
`pipe()` is a utility that pipes a value through a series of unary functions. It's the core composition mechanism for building observation chains with operators.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- Operators are standalone functions — NOT methods on Observable

USAGE PATTERN:
```ts
import { pipe } from "@observable/pipe";
import { ofIterable } from "@observable/of-iterable";
import { map } from "@observable/map";
import { filter } from "@observable/filter";

const controller = new AbortController();

pipe(
  [1, 2, 3, 4, 5],
  ofIterable(),
  filter((value) => value % 2 === 0),
  map((value) => value * 2),
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

KEY POINTS:
- First argument is the initial value (typically an Observable)
- Subsequent arguments are operator functions
- Returns the result of piping through all functions
- Essential for composing operators in this library
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
