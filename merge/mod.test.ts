import { merge } from "./mod.ts";
import { forOf } from "@observable/for-of";
import { type Observable, Observer } from "@observable/core";
import { pipe } from "@observable/pipe";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { assertEquals, assertStrictEquals } from "@std/assert";
import { empty } from "@observable/empty";

Deno.test("merge should merge the values", () => {
  // Arrange
  const observable = merge([
    forOf([1, 2, 3]),
    forOf([4, 5, 6]),
    forOf([7, 8, 9]),
  ]);
  const notifications: Array<
    ObserverNotification<
      typeof observable extends Observable<infer Value> ? Value : never
    >
  > = [];

  // Act
  pipe(observable, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["next", 4],
    ["next", 5],
    ["next", 6],
    ["next", 7],
    ["next", 8],
    ["next", 9],
    ["return"],
  ]);
});

Deno.test("merge should return empty when given an empty array", () => {
  // Arrange
  const notifications: Array<ObserverNotification> = [];
  const observable = merge([]);

  // Act
  pipe(observable, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertStrictEquals(observable, empty);
  assertEquals(notifications, [["return"]]);
});
