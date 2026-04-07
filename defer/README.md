# [@observable/defer](https://jsr.io/@observable/defer)

Registers the given `factory` function to be invoked on
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
import { defer } from "@observable/defer";
import { forOf } from "@observable/for-of";

const controller = new AbortController();
let values = [1, 2, 3];
const observable = defer(() => forOf(values));

observable.subscribe({
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

values = [4, 5, 6];
observable.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// Console output:
// "next" 4
// "next" 5
// "next" 6
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/defer from the @observable library ecosystem.

WHAT IT DOES:
`defer(factory)` creates an Observable that calls a factory function on each subscription to create a new Observable. Useful for lazy evaluation and per-subscription state.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`

USAGE PATTERN:
```ts
import { defer } from "@observable/defer";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
let values = [1, 2, 3];

const deferred = defer(() => forOf(values));

deferred.subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 1, 2, 3
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});

values = [4, 5, 6];

deferred.subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 4, 5, 6
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

LAZY EVALUATION:
The factory is called at subscription time, not creation time:
```ts
import { defer } from "@observable/defer";
import { of } from "@observable/of";

const deferred = defer(() => {
  console.log("Factory called!");  // Only when subscribed
  return of(Date.now());
});
// Factory not called yet...
deferred.subscribe({ ... });  // "Factory called!"
```

USE CASES:
- Fresh timestamp/random values per subscription
- Per-subscription state initialization
- Lazy resource allocation
- Conditional Observable creation
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
