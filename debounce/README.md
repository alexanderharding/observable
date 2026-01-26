# [@observable/debounce](https://jsr.io/@observable/debounce)

Debounces the emission of values from the [source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) by the specified number of
milliseconds.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { debounce } from "@observable/debounce";
import { Subject } from "@observable/core";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const source = new Subject<number>();

pipe(source, debounce(100)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

source.next(1);
source.next(2);
source.next(3); // Only this value will be emitted after 100ms

// Console output (after 100ms):
// "next" 3
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/debounce from the @observable library ecosystem.

WHAT IT DOES:
`debounce(ms)` delays emissions from the source, only emitting a value after `ms` milliseconds have passed without another value being emitted. Useful for search inputs, resize events, etc.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `debounce` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { debounce } from "@observable/debounce";
import { Subject } from "@observable/core";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const input = new Subject<string>();

pipe(
  input,
  debounce(300)  // Wait 300ms of silence before emitting
).subscribe({
  signal: controller.signal,
  next: (value) => console.log("search:", value),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});

// Rapid typing:
input.next("h");    // (ignored)
input.next("he");   // (ignored)
input.next("hel");  // (ignored)
input.next("hell"); // (ignored)
input.next("hello"); 
// After 300ms of no input: logs "search: hello"
```

SEE ALSO:
- `throttle(ms)` — emits first value, then ignores for duration
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
