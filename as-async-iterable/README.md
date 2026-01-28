# [@observable/as-async-iterable](https://jsr.io/@observable/as-async-iterable)

Projects an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) through a
[`AsyncIterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

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

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/as-async-iterable from the @observable library ecosystem.

WHAT IT DOES:
`asAsyncIterable()` converts an Observable to an AsyncIterable, allowing you to use `for await...of` loops.

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
try {
  for await (const value of pipe(someObservable, asAsyncIterable())) {
    console.log(value);
  }
} catch (error) {
  console.error("Observable threw:", error);
}
```

BREAKING OUT OF LOOP:
Breaking out of the loop will unsubscribe from the Observable:
```ts
for await (const value of pipe(interval(100), asAsyncIterable())) {
  console.log(value);
  if (value === 5) break;  // Unsubscribes from interval
}
```
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
