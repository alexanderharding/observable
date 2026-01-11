import { assertEquals } from "@std/assert";
import { Observer } from "@xan/observable-core";
import { materialize } from "./materialize.ts";
import type { ObserverNotification } from "./observer-notification.ts";
import { pipe } from "./pipe.ts";
import { of } from "./of.ts";

Deno.test("of should return empty if no values are provided", () => {
  // Arrange
  const observable = of([]);
  const notifications: Array<ObserverNotification> = [];

  // Act
  pipe(observable, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["R"]]);
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
  assertEquals(notifications, [["N", 1], ["N", "test"], ["N", true], ["R"]]);
});
