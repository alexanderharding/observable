import { merge } from "./mod.ts";
import { of } from "@observable/of";
import { Observer } from "@observable/core";
import { pipe } from "@observable/pipe";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { assertEquals } from "@std/assert";

Deno.test("merge should merge the values", () => {
  // Arrange
  const notifications: Array<ObserverNotification> = [];
  const observable = merge([of([1, 2, 3]), of([4, 5, 6]), of([7, 8, 9])]);

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
