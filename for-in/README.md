# [@observable/for-in](https://jsr.io/@observable/for-in)

Projects an
[`Object`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)'s
keys to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s each key in order upon
[`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { forIn } from "@observable/for-in";

const controller = new AbortController();
const object = { a: 1, b: 2, c: 3 } as const;

forIn(object).subscribe({
  signal: controller.signal,
  next: (key) => console.log("next", key, object[key]),
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// Console output:
// "next" "a" 1
// "next" "b" 2
// "next" "c" 3
// "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
