# [@observable/async-await](https://jsr.io/@observable/async-await)

[`Await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)s the
given `expression`, [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s its resolved
value, and then [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

Resolved promise

```ts
import { asyncAwait } from "@observable/async-await";

const controller = new AbortController();

asyncAwait(Promise.resolve(42)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// Console output:
// "next" 42
// "return"
```

Thenable object

```ts
import { asyncAwait } from "@observable/async-await";

const controller = new AbortController();

asyncAwait({ then: (onfulfilled: (value: 7) => void) => onfulfilled(7) }).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// Console output:
// "next" 7
// "return"
```

Primitive value

```ts
import { asyncAwait } from "@observable/async-await";

const controller = new AbortController();

asyncAwait(8).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// Console output:
// "next" 8
// "return"
```

Rejected promise

```ts
import { asyncAwait } from "@observable/async-await";

const controller = new AbortController();

asyncAwait(Promise.reject(new Error("test"))).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// Console output:
// "throw" Error: test
```

## AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/async-await from the @observable library ecosystem.

WHAT IT DOES:
`asyncAwait(expression)` applies `await` to the given expression, then `next`s the resolved value and
`return`s. The argument may be a `Promise`, a thenable, or any other value (same rules as `await` in
an async function — non-thenables are `next`ed as-is). Rejection surfaces as `throw()`.

CRITICAL DIFFERENCES FROM RxJS:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `asyncAwait` is a standalone factory — pass it a Promise to get an Observable

USAGE PATTERN:
```ts
import { asyncAwait } from "@observable/async-await";

const controller = new AbortController();

asyncAwait(fetch("/api/data")).subscribe({
  signal: controller.signal,
  next: (response) => console.log(response),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

ERROR HANDLING:
```ts
const controller = new AbortController();

asyncAwait(Promise.reject(new Error("failed"))).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("done"),
  throw: (error) => console.error("Caught:", error), // Caught: Error: failed
});
```
````

## Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
