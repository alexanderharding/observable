import { assertEquals } from "@std/assert";
import { Observer } from "@observable/core";
import { of } from "./mod.ts";
import { pipe } from "@observable/pipe";
import { materialize, type ObserverNotification } from "@observable/materialize";

Deno.test("of should return empty if no values are provided", () => {
  // Arrange
  const observable = of([]);
  const notifications: Array<ObserverNotification> = [];

  // Act
  pipe(observable, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("of should emit all values in order and then return", () => {
  // Arrange
  const notifications: Array<ObserverNotification> = [];
  const observable = of([1, "test", true]);

  // Act
  pipe(observable, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", "test"],
    ["next", true],
    ["return"],
  ]);
});
