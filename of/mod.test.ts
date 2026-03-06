import { assertEquals, assertThrows } from "@std/assert";
import { of } from "./mod.ts";
import { Observer } from "@observable/core";
import { pipe } from "@observable/pipe";
import { materialize, type ObserverNotification } from "@observable/materialize";

Deno.test("of should next the provided value and then return", () => {
  // Arrange
  const value = Math.random();
  const observable = of(value);
  const notifications: Array<ObserverNotification<number>> = [];

  // Act
  pipe(observable, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["next", value], ["return"]]);
});

Deno.test("of should throw when called with no arguments", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => of(...([] as unknown as Parameters<typeof of>)),
    TypeError,
    "1 argument required but 0 present",
  );
});
