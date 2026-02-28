# [@observable/last-value-from](https://jsr.io/@observable/last-value-from)

Projects the provided [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to a
[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
that either resolves with the last [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed
value on [`return`](https://jsr.io/@observable/core/doc/~/Observer.return), rejects with a
[`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw)n value, or rejects with a
[`TypeError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)
if the the provided [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
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
import { lastValueFrom } from "@observable/last-value-from";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

console.log(await lastValueFrom(pipe([1, 2, 3], ofIterable())));

// Console output:
// 3
```

```ts
import { lastValueFrom } from "@observable/last-value-from";
import { throwError } from "@observable/throw-error";

try {
  await lastValueFrom(throwError(new Error("test")));
} catch (error) {
  console.log(error);
}

// Console output:
// Error: test
```

```ts
import { lastValueFrom } from "@observable/last-value-from";
import { empty } from "@observable/empty";

try {
  await lastValueFrom(empty);
} catch (error) {
  console.log(error);
}

// Console output:
// TypeError: Cannot convert empty Observable to Promise
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/last-value-from from the @observable library ecosystem.

WHAT IT DOES:
`lastValueFrom(observable)` converts an Observable to a Promise that resolves with the LAST emitted value. Rejects if the source throws, or if the source returns without emitting any value.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `lastValueFrom` is a standalone function

USAGE PATTERN:
```ts
import { lastValueFrom } from "@observable/last-value-from";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const result = await lastValueFrom(pipe([1, 2, 3], ofIterable()));
console.log(result);  // 3 (last value)
```

ERROR HANDLING:
```ts
import { lastValueFrom } from "@observable/last-value-from";
import { throwError } from "@observable/throw-error";

try {
  await lastValueFrom(throwError(new Error("test")));
} catch (error) {
  console.error(error);  // Error: test
}
```

EMPTY OBSERVABLE REJECTION:
```ts
import { lastValueFrom } from "@observable/last-value-from";
import { empty } from "@observable/empty";

try {
  await lastValueFrom(empty);
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
