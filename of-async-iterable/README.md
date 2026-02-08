# [@observable/of-async-iterable](https://jsr.io/@observable/of-async-iterable)

Projects an
[`AsyncIterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols)
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
import { ofAsyncIterable } from "@observable/of-async-iterable";
import { pipe } from "@observable/pipe";

async function* generateValues(): AsyncGenerator<1 | 2 | 3, void, unknown> {
  yield await Promise.resolve(1 as const);
  yield await Promise.resolve(2 as const);
  yield await Promise.resolve(3 as const);
}

const controller = new AbortController();
pipe(generateValues(), ofAsyncIterable()).subscribe({
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

## AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/of-async-iterable from the @observable library ecosystem.

WHAT IT DOES:
`ofAsyncIterable()` is an operator that converts an AsyncIterable into an Observable that emits values in order, then calls `return()`. If the async iterable throws, it calls `throw()` with the error.

CRITICAL DIFFERENCES FROM RxJS:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `ofAsyncIterable` is an operator function used with `pipe()` — NOT a standalone factory

USAGE PATTERN:
```ts
import { ofAsyncIterable } from "@observable/of-async-iterable";
import { pipe } from "@observable/pipe";

async function* fetchPages() {
  yield await fetch("/api/page/1").then((r) => r.json());
  yield await fetch("/api/page/2").then((r) => r.json());
}

pipe(fetchPages(), ofAsyncIterable()).subscribe({
  signal: new AbortController().signal,
  next: (page) => console.log(page),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

EARLY UNSUBSCRIPTION:
```ts
const controller = new AbortController();

async function* generateValues() {
  yield 1;
  yield 2;
  yield 3;
}

pipe(generateValues(), ofAsyncIterable()).subscribe({
  signal: controller.signal,
  next(value) {
    console.log(value);
    if (value === 2) controller.abort(); // Stops after 2
  },
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```
````

## Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
