import { assertEquals, assertStrictEquals } from "@std/assert";
import { Observer } from "@observable/core";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { flat } from "@observable/flat";
import { defer } from "@observable/defer";
import { empty } from "@observable/empty";
import { never } from "@observable/never";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";
import { all } from "./mod.ts";
import { ReplaySubject } from "@observable/replay-subject";

Deno.test(
  "all should multiple sources that next and return synchronously",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<ReadonlyArray<unknown>>> = [];
    const source1 = of([1, 2, 3]);
    const source2 = of([4, 5, 6]);
    const source3 = of([7, 8, 9]);
    const observable = all([source1, source2, source3]);

    // Act
    pipe(observable, materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
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
  "all should handle multiple sources that next and return synchronously except one that is empty",
  () => {
    // Arrange
    const deferCalls: Array<number> = [];
    const notifications: Array<ObserverNotification<ReadonlyArray<unknown>>> = [];
    const source1 = defer(() => {
      deferCalls.push(1);
      return flat([of([1, 2, 3]), never]);
    });
    const source2 = defer(() => {
      deferCalls.push(2);
      return empty;
    });
    const source3 = defer(() => {
      deferCalls.push(3);
      return of([7, 8, 9]);
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
  const notifications: Array<ObserverNotification<ReadonlyArray<unknown>>> = [];
  const source1 = new ReplaySubject<number>(3);
  const source2 = of([4, 5, 6]);
  const source3 = of([7, 8, 9]);
  const observable = all([source1, source2, source3]);
  flat([of([1, 2, 3]), never]).subscribe(source1);

  // Act
  pipe(observable, materialize()).subscribe(
    new Observer((notification) => {
      notifications.push(notification);
      if (
        notification[0] === "next" &&
        notification[1][2] === 7 &&
        notification[1][0] !== 10
      ) {
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
