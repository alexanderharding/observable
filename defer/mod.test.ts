import { assertEquals, assertStrictEquals } from "@std/assert";
import { Observer } from "@observable/core";
import { materialize } from "@observable/materialize";
import type { ObserverNotification } from "@observable/materialize";
import { pipe } from "@observable/pipe";
import { ofIterable } from "@observable/of-iterable";
import { defer } from "./mod.ts";

Deno.test(
  "defer should create an Observable that calls a factory to make an Observable for each new Observer",
  () => {
    // Arrange
    let factoryCallCount = 0;
    const notifications: Array<[1 | 2, ObserverNotification<number>]> = [];
    const source = defer(() => {
      factoryCallCount++;
      return pipe([1, 2, 3], ofIterable());
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

Deno.test("defer should propagate asObservable error when getter returns non-observable", () => {
  // Arrange
  const notifications: Array<ObserverNotification<unknown>> = [];
  const source = defer(
    // deno-lint-ignore no-explicit-any
    () => "not an observable" as any,
  );
  const materialized = pipe(source, materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications.length, 1);
  assertEquals(notifications[0][0], "throw");
  assertEquals(
    (notifications[0][1] as TypeError).message,
    "Parameter 1 is not of type 'Observable'",
  );
});

Deno.test("defer should propagate asObservable error when getter returns null", () => {
  // Arrange
  const notifications: Array<ObserverNotification<unknown>> = [];
  const source = defer(
    // deno-lint-ignore no-explicit-any
    () => null as any,
  );
  const materialized = pipe(source, materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications.length, 1);
  assertEquals(notifications[0][0], "throw");
  assertEquals(
    (notifications[0][1] as TypeError).message,
    "Parameter 1 is not of type 'Observable'",
  );
});
