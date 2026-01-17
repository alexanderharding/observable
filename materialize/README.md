# @observable/materialize

Represents all of the notifications from the [source](https://jsr.io/@observable/core#source) as
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values marked with their original
types within notification entries. This is especially useful for testing, debugging, and logging.

## Build

Automated by [Deno](https://deno.land/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { materialize } from "@observable/materialize";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe(of([1, 2, 3]), materialize()).subscribe({
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
import { of } from "@observable/of";
import { Observer } from "@observable/core";

const observable = of([1, 2, 3]);

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

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
