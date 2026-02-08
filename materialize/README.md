# [@observable/materialize](https://jsr.io/@observable/materialize)

Projects all of the [`Observer`](https://jsr.io/@observable/core/doc/~/Observer)
[notification](https://jsr.io/@observable/core#notification) as
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { materialize } from "@observable/materialize";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe([1, 2, 3], ofIterable(), materialize()).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// ["next", 1]
// ["next", 2]
// ["next", 3]
// ["return"]
// "return"
```

## Unit testing example

```ts
import { materialize, ObserverNotification } from "@observable/materialize";
import { pipe } from "@observable/pipe";
import { ofIterable } from "@observable/of-iterable";
import { Observer } from "@observable/core";

const observable = pipe([1, 2, 3], ofIterable());

describe("observable", () => {
  let activeSubscriptionController: AbortController;

  beforeEach(() => (activeSubscriptionController = new AbortController()));

  afterEach(() => activeSubscriptionController?.abort());

  it("should emit the notifications", () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];

    // Act
    pipe(observable, materialize()).subscribe(
      new Observer({
        signal: activeSubscriptionController.signal,
        next: (notification) => notifications.push(notification),
      }),
    );

    // Assert
    expect(notifications).toEqual([
      ["next", 1],
      ["next", 2],
      ["next", 3],
      ["return"],
    ]);
  });
});
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/materialize from the @observable library ecosystem.

WHAT IT DOES:
`materialize()` converts all notifications (next, return, throw) into `next` emissions as tagged tuples. Useful for testing, debugging, and logging.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `materialize` is a standalone function used with `pipe()` — NOT a method on Observable

NOTIFICATION FORMAT:
- `["next", value]` — for emitted values
- `["return"]` — for return (successful finish)
- `["throw", error]` — for errors

USAGE PATTERN:
```ts
import { materialize } from "@observable/materialize";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  [1, 2, 3],
  ofIterable(),
  materialize()
).subscribe({
  signal: controller.signal,
  next: (notification) => console.log(notification),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
// Output:
// ["next", 1]
// ["next", 2]
// ["next", 3]
// ["return"]
// "done"
```

TESTING EXAMPLE:
```ts
import { materialize, ObserverNotification } from "@observable/materialize";
import { Observer } from "@observable/core";

const notifications: Array<ObserverNotification<number>> = [];

pipe(observable, materialize()).subscribe(
  new Observer({
    signal: controller.signal,
    next: (notification) => notifications.push(notification),
  })
);

expect(notifications).toEqual([
  ["next", 1],
  ["next", 2],
  ["next", 3],
  ["return"],
]);
```
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
