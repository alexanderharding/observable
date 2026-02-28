# [@observable/each-value-from](https://jsr.io/@observable/each-value-from)

Projects the provided [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to an
[`AsyncGenerator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator)
that [`yield`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield)s
each [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value in order.

## Examples

```ts
import { eachValueFrom } from "@observable/each-value-from";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

for await (const value of eachValueFrom(pipe([1, 2, 3], ofIterable()))) {
  console.log(value);
}
console.log("Done!");

// Console output:
// 1
// 2
// 3
// "Done!"
```

```ts
import { eachValueFrom } from "@observable/each-value-from";
import { throwError } from "@observable/throw-error";

try {
  for await (const value of eachValueFrom(throwError(new Error("test")))) {
    console.log(value);
  }
} catch (error) {
  console.log(error);
  // Console output:
  // Error: test
}
```

```ts
import { eachValueFrom } from "@observable/each-value-from";
import { interval } from "@observable/interval";

for await (const value of eachValueFrom(interval(100))) {
  console.log(value);
  if (value === 5) break;
}

// Console output:
// 0
// 1
// 2
// 3
// 4
// 5
```

```ts
import { eachValueFrom } from "@observable/each-value-from";
import { empty } from "@observable/empty";
import { pipe } from "@observable/pipe";

for await (const value of eachValueFrom(empty)) {
  console.log(value);
}
console.log("Done!");

// Console output:
// Done!
```

## Build

Automated by [JSR](https://jsr.io/).

## Publishing

Automated by `.github/workflows/publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/each-value-from from the @observable library ecosystem.

WHAT IT DOES:
`eachValueFrom(source)` converts an Observable to an AsyncIterable, so you can use `for await...of`. The subscription starts when iteration begins (lazy).

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `eachValueFrom` is a function that takes an Observable and returns an AsyncGenerator — NOT a pipe operator

USAGE:
```ts
import { eachValueFrom } from "@observable/each-value-from";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

for await (const value of eachValueFrom(pipe([1, 2, 3], ofIterable()))) {
  console.log(value);
}
```

ERROR HANDLING: Observable errors (observer.throw) are rethrown in the loop; use try/catch.

BREAKING OUT: Breaking out of the loop or calling iterator.return() aborts the subscription.

IMPORTANT:
- Subscription starts when iteration begins
- Yields every value in order (unlike lastValueFrom which only gives the last)
- Breaking or closing the loop unsubscribes from the source
````

## Glossary and semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
