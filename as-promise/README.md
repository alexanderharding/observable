# [@observable/as-promise](https://jsr.io/@observable/as-promise)

Projects an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) through a
[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
Since
[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)s
have no concept of [`return`](https://jsr.io/@observable/core/doc/~/Observer.return), this operator
will reject with a
[`TypeError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)
if the [source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s without
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ing a value.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

```ts
import { asPromise } from "@observable/as-promise";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

console.log(await pipe(of([1, 2, 3]), asPromise()));

// Console output:
// 3
```

```ts
import { asPromise } from "@observable/as-promise";
import { throwError } from "@observable/throw-error";
import { pipe } from "@observable/pipe";

try {
  console.log(await pipe(throwError(new Error("test")), asPromise()));
} catch (error) {
  console.log(error);
  // Console output:
  // Error: test
}
```

```ts
import { asPromise } from "@observable/as-promise";
import { empty } from "@observable/empty";
import { pipe } from "@observable/pipe";

try {
  console.log(await pipe(empty, asPromise()));
} catch (error) {
  console.log(error);
  // Console output:
  // TypeError: Cannot convert empty Observable to Promise
}
```

```ts
import { asPromise } from "@observable/as-promise";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

try {
  console.log(await pipe(of([]), asPromise()));
} catch (error) {
  console.log(error);
  // Console output:
  // TypeError: Cannot convert empty Observable to Promise
}
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/as-promise from the @observable library ecosystem.

WHAT IT DOES:
`asPromise()` converts an Observable to a Promise that resolves with the LAST emitted value. Rejects if the source throws, or if the source returns without emitting any value.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `asPromise` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { asPromise } from "@observable/as-promise";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const result = await pipe(of([1, 2, 3]), asPromise());
console.log(result);  // 3 (last value)
```

ERROR HANDLING:
```ts
import { throwError } from "@observable/throw-error";

try {
  await pipe(throwError(new Error("test")), asPromise());
} catch (error) {
  console.error(error);  // Error: test
}
```

EMPTY OBSERVABLE REJECTION:
```ts
import { empty } from "@observable/empty";

try {
  await pipe(empty, asPromise());
} catch (error) {
  console.error(error);  // TypeError: Cannot convert empty Observable to Promise
}
```

IMPORTANT:
- Resolves with the LAST value, not the first
- Rejects with TypeError if Observable returns without emitting
- Rejects with the thrown value if Observable throws
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
