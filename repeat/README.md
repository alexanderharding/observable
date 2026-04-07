# [@observable/repeat](https://jsr.io/@observable/repeat)

Re-[`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe)s on
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return) as long as the given `notifier`
then [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s a value.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { repeat } from "@observable/repeat";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";
import { empty } from "@observable/empty";
import { defer } from "@observable/defer";
import { forOf } from "@observable/for-of";

const observable = forOf([1, 2, 3]);
const controller = new AbortController();
const repeated = defer(() => {
  let count = 0;
  return pipe(
    observable,
    repeat(defer(() => {
      console.log("notifier subscribed");
      return ++count === 2 ? empty : of(undefined);
    })),
  );
});

repeated.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 1
// "next" 2
// "next" 3
// "notifier subscribed"
// "next" 1
// "next" 2
// "next" 3
// "notifier subscribed"
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/repeat from the @observable library ecosystem.

WHAT IT DOES:
`repeat(notifier)` re-subscribes to the source Observable each time it returns, as long as the notifier Observable emits a value. Stops repeating if the notifier returns without emitting or throws.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `repeat` is a standalone function used with `pipe()` — NOT a method on Observable
- Uses a notifier Observable to control repetition

USAGE PATTERN:
```ts
import { repeat } from "@observable/repeat";
import { forOf } from "@observable/for-of";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";
import { defer } from "@observable/defer";
import { empty } from "@observable/empty";

const source = forOf([1, 2, 3]);
const controller = new AbortController();

let count = 0;
pipe(
  source,
  repeat(defer(() => {
    return ++count < 3 ? of(undefined) : empty;
  }))
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
// Output: 1, 2, 3, 1, 2, 3, "done"
```

NOTIFIER BEHAVIOR:
- Notifier emits `next()` → source re-subscribes
- Notifier calls `return()` without emitting → stop repeating, return
- Notifier calls `throw()` → stop repeating, propagate error
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
