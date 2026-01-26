# [@observable/rxjs-interop](https://jsr.io/@observable/rxjs-interop)

Utilities for converting an [RxJS Observable](https://rxjs.dev/api/index/class/Observable) to an
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) and vice versa.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

```ts
import { asObservable } from "@observable/rxjs-interop";
import { of as rxJsOf } from "rxjs";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const observable = pipe(rxJsOf(1, 2, 3), asObservable());
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
```

```ts
import { asRxJsObservable } from "@observable/rxjs-interop";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const observable = pipe(of([1, 2, 3]), asRxJsObservable());
const subscription = observable.subscribe({
  next: (value) => console.log("next", value),
  complete: () => console.log("complete"),
  error: (value) => console.error("error", value),
});

// Console output:
// "next" 1
// "next" 2
// "next" 3
// "complete"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/rxjs-interop from the @observable library ecosystem.

WHAT IT DOES:
Provides utilities to convert between RxJS Observables and @observable Observables in both directions.

KEY DIFFERENCES BETWEEN THE LIBRARIES:
- @observable uses `return`/`throw` — RxJS uses `complete`/`error`
- @observable uses `AbortController` — RxJS uses `Subscription`
- @observable's `of()` takes an Iterable — RxJS's `of()` takes variadic args

USAGE — RxJS to @observable:
```ts
import { asObservable } from "@observable/rxjs-interop";
import { of as rxJsOf } from "rxjs";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  rxJsOf(1, 2, 3),  // RxJS Observable (variadic of)
  asObservable()    // Convert to @observable
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 1, 2, 3
  return: () => console.log("done"),    // Maps from RxJS complete
  throw: (error) => console.error(error), // Maps from RxJS error
});
```

USAGE — @observable to RxJS:
```ts
import { asRxJsObservable } from "@observable/rxjs-interop";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const rxjsObservable = pipe(
  of([1, 2, 3]),      // @observable Observable (Iterable of)
  asRxJsObservable()  // Convert to RxJS
);

// Now use RxJS patterns
const subscription = rxjsObservable.subscribe({
  next: (value) => console.log(value),  // 1, 2, 3
  complete: () => console.log("complete"), // Maps from return
  error: (error) => console.error(error),   // Maps from throw
});

subscription.unsubscribe();  // RxJS unsubscription
```

MAPPING:
- `return()` ↔ `complete()`
- `throw()` ↔ `error()`
- `controller.abort()` ↔ `subscription.unsubscribe()`
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
