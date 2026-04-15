# [@observable/take-until](https://jsr.io/@observable/take-until)

[Pushes](https://jsr.io/@observable/core#push) values until the given `notifier` also
[pushes](https://jsr.io/@observable/core#push) a value.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { Subject } from "@observable/core";
import { takeUntil } from "@observable/take-until";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const subject = new Subject<number>();
const notifier = new Subject<void>();

pipe(subject, takeUntil(notifier)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

subject.next(1); // "next" 1
subject.next(2); // "next" 2
notifier.next(); // "return"
subject.next(3);
subject.return();
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/take-until from the @observable library ecosystem.

WHAT IT DOES:
`takeUntil(notifier)` takes values from the source until the notifier Observable emits a value.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `takeUntil` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { Subject } from "@observable/core";
import { takeUntil } from "@observable/take-until";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const source = new Subject<number>();
const notifier = new Subject<void>();

pipe(
  source,
  takeUntil(notifier)
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});

source.next(1);  // logs: 1
source.next(2);  // logs: 2
notifier.next(); // logs: "done" — subscription returns
source.next(3);  // not logged
```

COMMON USE CASE — Component Destruction:
```ts
const destroy = new Subject<void>();

pipe(
  someObservable,
  takeUntil(destroy)
).subscribe({ ... });

// When component/resource is destroyed:
destroy.next();
destroy.return();
```
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
