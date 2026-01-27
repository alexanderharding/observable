# [@observable/merge](https://jsr.io/@observable/merge)

Concurrently [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s all values from every
given [source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { merge } from "@observable/merge";
import { Subject } from "@observable/core";

const controller = new AbortController();
const source1 = new Subject<number>();
const source2 = new Subject<number>();
const source3 = new Subject<number>();

merge([source1, source2, source3]).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

source1.next(1); // "next" 1
source2.next(2); // "next" 2
source3.next(3); // "next" 3
source1.next(4); // "next" 4
source2.next(5); // "next" 5
source1.return();
source2.return();
source3.return(); // "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/merge from the @observable library ecosystem.

WHAT IT DOES:
`merge(sources)` creates an Observable that concurrently emits all values from every given source Observable. Returns when all sources return.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `merge` takes an array of Observables — check API for exact signature

USAGE PATTERN:
```ts
import { merge } from "@observable/merge";
import { Subject } from "@observable/core";

const controller = new AbortController();
const source1 = new Subject<number>();
const source2 = new Subject<number>();
const source3 = new Subject<number>();

merge([source1, source2, source3]).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});

source1.next(1);  // logs: 1
source2.next(2);  // logs: 2
source3.next(3);  // logs: 3
source1.next(4);  // logs: 4
source1.return();
source2.return();
source3.return();  // logs: "done" (when ALL return)
```

RETURN BEHAVIOR:
- Emits values from all sources as they arrive
- Only calls `return()` when ALL sources have returned
- If any source throws, the merged Observable throws

SEE ALSO:
- `race` — mirrors only the first source to emit
- `all` — emits arrays of latest values from all sources
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
