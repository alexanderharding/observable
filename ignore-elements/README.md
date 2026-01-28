# [@observable/ignore-elements](https://jsr.io/@observable/ignore-elements)

Ignores all [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values from the
[source](https://jsr.io/@observable/core#source).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { ignoreElements } from "@observable/ignore-elements";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe([1, 2, 3, 4, 5], ofIterable(), ignoreElements()).subscribe({
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
You are helping me with code that uses @observable/ignore-elements from the @observable library ecosystem.

WHAT IT DOES:
`ignoreElements()` ignores all emitted values from the source, only forwarding `return()` or `throw()`. Useful when you only care about when the source returns or throws.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `ignoreElements` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { ignoreElements } from "@observable/ignore-elements";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  pipe([1, 2, 3, 4, 5], ofIterable()),
  ignoreElements()
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // Never called
  return: () => console.log("done"),    // Called when source returns
  throw: (error) => console.error(error),
});
// Output: "done"
```

COMMON USE — Wait for return:
```ts
pipe(
  saveAllData,
  ignoreElements()
).subscribe({
  return: () => console.log("All saves finished!"),
  throw: (error) => console.error("Save failed:", error),
  ...
});
```

COMMON USE — Side-effect only subscriptions:
```ts
pipe(
  loggingObservable,
  ignoreElements()
).subscribe({ ... });  // Just run the side effects
```
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
