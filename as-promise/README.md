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

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
