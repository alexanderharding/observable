# [@observable/as-async-iterable](https://jsr.io/@observable/as-async-iterable)

Projects the [source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to an
[`AsyncIterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols)
that yields each [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

```ts
import { asAsyncIterable } from "@observable/as-async-iterable";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

for await (const value of pipe([1, 2, 3], ofIterable(), asAsyncIterable())) {
  console.log(value);
}

// Console output:
// 1
// 2
// 3
```

```ts
import { asAsyncIterable } from "@observable/as-async-iterable";
import { throwError } from "@observable/throw-error";
import { pipe } from "@observable/pipe";

try {
  for await (const value of pipe(throwError(new Error("test")), asAsyncIterable())) {
    console.log(value);
  }
} catch (error) {
  console.log(error);
  // Console output:
  // Error: test
}
```

```ts
import { asAsyncIterable } from "@observable/as-async-iterable";
import { interval } from "@observable/interval";
import { pipe } from "@observable/pipe";

for await (const value of pipe(interval(100), asAsyncIterable())) {
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
import { asAsyncIterable } from "@observable/as-async-iterable";
import { empty } from "@observable/empty";
import { pipe } from "@observable/pipe";

for await (const value of pipe(empty, asAsyncIterable())) {
  console.log(value);
}
console.log("Done!");

// Console output:
// Done!
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/as-async-iterable from the @observable library ecosystem.

WHAT IT DOES:
`asAsyncIterable()` converts an Observable to an AsyncIterable, allowing you to use `for await...of` loops. The observation starts lazily when iteration begins.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `asAsyncIterable` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { asAsyncIterable } from "@observable/as-async-iterable";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

for await (const value of pipe([1, 2, 3], ofIterable(), asAsyncIterable())) {
  console.log(value);
}
// Output:
// 1
// 2
// 3
```

ERROR HANDLING:
```ts
import { throwError } from "@observable/throw-error";

try {
  for await (const value of pipe(throwError(new Error("test")), asAsyncIterable())) {
    console.log(value);
  }
} catch (error) {
  console.error(error);  // Error: test
}
```

BREAKING OUT OF LOOP:
Breaking out of the loop will abort the Observer:
```ts
import { interval } from "@observable/interval";

for await (const value of pipe(interval(100), asAsyncIterable())) {
  console.log(value);
  if (value === 5) break;  // Aborts the interval
}
```

IMPORTANT:
- Observation starts LAZILY when iteration begins
- Yields ALL values, not just the last one (unlike asPromise)
- Breaking out of the loop aborts the source
- Thrown errors from the Observable are rethrown in the loop
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
