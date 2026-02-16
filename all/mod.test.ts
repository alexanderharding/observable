import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { Observer } from "@observable/core";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { flat } from "@observable/flat";
import { defer } from "@observable/defer";
import { empty } from "@observable/empty";
import { never } from "@observable/never";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";
import { all } from "./mod.ts";
import { ReplaySubject } from "@observable/replay-subject";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

Deno.test(
  "all should combine multiple input's Observables that next and return synchronously",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<ReadonlyArray<number>>> = [];
    const source1 = pipe([1, 2, 3], ofIterable());
    const source2 = pipe([4, 5, 6], ofIterable());
    const source3 = pipe([7, 8, 9], ofIterable());
    const observable = all([source1, source2, source3]);

    // Act
    pipe(observable, materialize()).subscribe(
      new Observer((notification) => {
        notifications.push(notification);
        const [type, value] = notification;
        if (type === "next") assertStrictEquals(Object.isFrozen(value), true);
      }),
    );

    // Assert
    assertEquals(notifications, [
      ["next", [3, 6, 7]],
      ["next", [3, 6, 8]],
      ["next", [3, 6, 9]],
      ["return"],
    ]);
  },
);

Deno.test(
  "all should handle multiple input's Observables that next and return synchronously except one that is empty",
  () => {
    // Arrange
    const deferCalls: Array<number> = [];
    const notifications: Array<ObserverNotification<ReadonlyArray<unknown>>> = [];
    const source1 = defer(() => {
      deferCalls.push(1);
      return flat([pipe([1, 2, 3], ofIterable()), never]);
    });
    const source2 = defer(() => {
      deferCalls.push(2);
      return empty;
    });
    const source3 = defer(() => {
      deferCalls.push(3);
      return pipe([7, 8, 9], ofIterable());
    });
    const observable = all([source1, source2, source3]);

    // Act
    pipe(observable, materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [["return"]]);
    assertEquals(deferCalls, [1, 2]);
  },
);

Deno.test("all should handle reentrancy", () => {
  // Arrange
  const notifications: Array<ObserverNotification<ReadonlyArray<number>>> = [];
  const source1 = new ReplaySubject<1 | 2 | 3 | 10>(3);
  const source2 = pipe([4, 5, 6], ofIterable());
  const source3 = pipe([7, 8, 9], ofIterable());
  const observable = all([source1, source2, source3]);
  flat([pipe([1, 2, 3], ofIterable()), never]).subscribe(source1);

  // Act
  pipe(observable, materialize()).subscribe(
    new Observer((notification) => {
      notifications.push(notification);
      const [type, values] = notification;
      if (type === "next" && values[2] === 7 && values[0] !== 10) {
        source1.next(10);
      }
    }),
  );

  // Assert
  assertEquals(notifications, [
    ["next", [3, 6, 7]],
    ["next", [10, 6, 7]],
    ["next", [10, 6, 8]],
    ["next", [10, 6, 9]],
  ]);
});

Deno.test("all should return empty when given an empty array", () => {
  // Arrange / Act
  const observable = all([]);

  // Assert
  assertStrictEquals(observable, empty);
});

Deno.test("all should accept Set of observables", () => {
  // Arrange
  const notifications: Array<ObserverNotification<ReadonlyArray<number>>> = [];
  const source1 = pipe([1, 2, 3, 4, 5, 6], ofIterable());
  const source2 = source1;
  const source3 = pipe([7, 8, 9], ofIterable());
  const observable = all(new Set([source1, source2, source3]));

  // Act
  pipe(observable, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", [6, 7]],
    ["next", [6, 8]],
    ["next", [6, 9]],
    ["return"],
  ]);
});

Deno.test("all should accept iterable (generator) of observables", () => {
  // Arrange
  const notifications: Array<ObserverNotification<ReadonlyArray<number>>> = [];
  function* observables() {
    yield pipe([1, 2], ofIterable());
    yield pipe([3, 4], ofIterable());
  }
  const observable = all(observables());

  // Act
  pipe(observable, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", [2, 3]],
    ["next", [2, 4]],
    ["return"],
  ]);
});

Deno.test("all should throw MinimumArgumentsRequiredError when called with no arguments", () => {
  // Act / Arrange / Assert
  assertThrows(
    () => (all as (iterable?: Iterable<unknown>) => unknown)(),
    MinimumArgumentsRequiredError,
  );
});

Deno.test("all should throw ParameterTypeError when argument is not iterable", () => {
  // Act / Arrange / Assert
  assertThrows(
    () => (all as (iterable: unknown) => unknown)(null),
    ParameterTypeError,
  );
  assertThrows(
    () => (all as (iterable: unknown) => unknown)(42),
    ParameterTypeError,
  );
});
