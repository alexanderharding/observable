# [@observable/for-await-of](https://jsr.io/@observable/for-await-of)

[Pushes](https://jsr.io/@observable/core#push) each
[`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)ed value
of the given `values` in order.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { forAwaitOf } from "@observable/for-await-of";

async function* generateValues(): AsyncGenerator<1 | 2 | 3, void, unknown> {
  yield await Promise.resolve(1 as const);
  yield await Promise.resolve(2 as const);
  yield await Promise.resolve(3 as const);
}

const controller = new AbortController();

forAwaitOf(generateValues()).subscribe({
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
You are helping with code that uses @observable/for-await-of from the Observable library ecosystem (JSR @observable/*).

WHAT IT DOES:
- `forAwaitOf(asyncIterable)` converts an AsyncIterable into an Observable.
- The Observable emits each value in order via `next(value)`, then calls `return()` when the async iteration finishes.
- If the async iterable throws, the Observable calls `throw(error)` on the observer.

API SHAPE:
- `forAwaitOf(values: AsyncIterable<Value>): Observable<Value>` — call it with an async iterable; subscribe to the returned Observable. It is a factory, not an operator used with pipe().

CRITICAL DIFFERENCES FROM RxJS:
- Observer uses `return` and `throw` — NOT `complete` or `error`.
- Unsubscription is via `AbortController` (pass `signal` in subscribe options) and `controller.abort()` — NOT `subscription.unsubscribe()`.

BASIC USAGE:
```ts
import { forAwaitOf } from "@observable/for-await-of";

async function* fetchPages() {
  yield await fetch("/api/page/1").then((r) => r.json());
  yield await fetch("/api/page/2").then((r) => r.json());
}

const controller = new AbortController();

forAwaitOf(fetchPages()).subscribe({
  signal: controller.signal,
  next: (page) => console.log(page),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

EARLY UNSUBSCRIPTION (e.g. stop after N values):
```ts
const controller = new AbortController();

async function* generateValues() {
  yield 1;
  yield 2;
  yield 3;
}

forAwaitOf(generateValues()).subscribe({
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
