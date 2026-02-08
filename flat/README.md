# [@observable/flat](https://jsr.io/@observable/flat)

Sequentially [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s all values from the
first given [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) until it
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s and then moves on to the next and
so on.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { flat } from "@observable/flat";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const source1 = pipe([1, 2, 3], ofIterable());
const source2 = pipe([4, 5, 6], ofIterable());
const source3 = pipe([7, 8, 9], ofIterable());

const controller = new AbortController();

flat([source1, source2, source3]).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 1
// "next" 2
// "next" 3
// "next" 4
// "next" 5
// "next" 6
// "next" 7
// "next" 8
// "next" 9
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/flat from the @observable library ecosystem.

WHAT IT DOES:
`flat(sources)` creates an Observable that sequentially emits all values from the first source, then moves to the next source, and so on. Similar to RxJS `concat`.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- Called `flat` here, similar to RxJS's `concat`

USAGE PATTERN:
```ts
import { flat } from "@observable/flat";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const source1 = pipe([1, 2, 3], ofIterable());
const source2 = pipe([4, 5, 6], ofIterable());
const source3 = pipe([7, 8, 9], ofIterable());

const controller = new AbortController();

flat([source1, source2, source3]).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 1, 2, 3, 4, 5, 6, 7, 8, 9
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

SEQUENTIAL BEHAVIOR:
- Subscribes to the first source
- Waits for it to return
- Then subscribes to the next source
- Repeats until all sources return

USE CASES:
- Ordered sequences that must run in order
- Startup initialization sequences
- Chaining async operations

SEE ALSO:
- `merge` — emits from all sources concurrently (interleaved)
- `flatMap` — like flat but projects each value to an Observable first
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
