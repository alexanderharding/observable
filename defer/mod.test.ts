import { assertEquals, assertStrictEquals } from "@std/assert";
import { Observer } from "@observable/core";
import { materialize } from "@observable/materialize";
import type { ObserverNotification } from "@observable/materialize";
import { pipe } from "@observable/pipe";
import { of } from "@observable/of";
import { defer } from "./mod.ts";

Deno.test(
  "defer should create an Observable that calls a factory to make an Observable for each new Observer",
  () => {
    // Arrange
    let factoryCallCount = 0;
    const notifications: Array<[1 | 2, ObserverNotification<number>]> = [];
    const source = defer(() => {
      factoryCallCount++;
      return of([1, 2, 3]);
    });

    // Act
    pipe(source, materialize()).subscribe(
      new Observer((notification) => notifications.push([1, notification])),
    );
    pipe(source, materialize()).subscribe(
      new Observer((notification) => notifications.push([2, notification])),
    );

    // Assert
    assertStrictEquals(factoryCallCount, 2);
    assertEquals(notifications, [
      [1, ["next", 1]],
      [1, ["next", 2]],
      [1, ["next", 3]],
      [1, ["return"]],
      [2, ["next", 1]],
      [2, ["next", 2]],
      [2, ["next", 3]],
      [2, ["return"]],
    ]);
  },
);

Deno.test("defer should throw an error if the factory throws an error", () => {
  // Arrange
  const error = new Error(Math.random().toString());
  const notifications: Array<ObserverNotification> = [];
  const source = defer(() => {
    throw error;
  });
  const materialized = pipe(source, materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", error]]);
});
