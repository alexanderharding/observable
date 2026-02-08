# [@observable/race](https://jsr.io/@observable/race)

Mirrors the first [source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next) or
[`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw) a value.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { race } from "@observable/race";
import { Subject } from "@observable/core";

const controller = new AbortController();
const source1 = new Subject<number>();
const source2 = new Subject<number>();
const source3 = new Subject<number>();

race([source1, source2, source3]).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

source2.next(1); // "next" 1
source1.next(2);
source3.next(3);
source1.return();
source2.next(4); // "next" 4
source3.next(5);
source2.return(); // "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/race from the @observable library ecosystem.

WHAT IT DOES:
`race(sources)` creates an Observable that mirrors the first source Observable to emit or throw a value. All other sources are unsubscribed once a winner is determined.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `race` takes an array of Observables

USAGE PATTERN:
```ts
import { race } from "@observable/race";
import { Subject } from "@observable/core";

const controller = new AbortController();
const source1 = new Subject<number>();
const source2 = new Subject<number>();
const source3 = new Subject<number>();

race([source1, source2, source3]).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});

source2.next(1);  // logs: 1 — source2 wins!
source1.next(2);  // (ignored — source1 lost)
source3.next(3);  // (ignored — source3 lost)
source2.next(4);  // logs: 4 — continuing with winner
source2.return(); // logs: "done"
```

USE CASES:
- Timeout patterns (race between data and timeout)
- First-response-wins from multiple sources
- Fallback strategies

SEE ALSO:
- `merge` — emits from all sources concurrently
- `all` — combines latest values from all sources
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
