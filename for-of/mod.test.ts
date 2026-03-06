import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { Observer } from "@observable/core";
import { forOf } from "./mod.ts";
import { pipe } from "@observable/pipe";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { empty } from "@observable/empty";

Deno.test("forOf should throw when called with no source", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => forOf(...([] as unknown as Parameters<typeof forOf>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("forOf should throw when source is not an Iterable", () => {
  // Arrange / Act / Assert
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => forOf(1 as any),
    TypeError,
    "Parameter 1 is not of type 'Iterable'",
  );
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => forOf(null as any),
    TypeError,
    "Parameter 1 is not of type 'Iterable'",
  );
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => forOf(undefined as any),
    TypeError,
    "Parameter 1 is not of type 'Iterable'",
  );
});

Deno.test("forOf should emit values in order", () => {
  // Arrange
  const notifications: Array<ObserverNotification> = [];
  const source = forOf([1, 2, 3]);

  // Act
  pipe(source, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["next", 1], ["next", 2], ["next", 3], ["return"]]);
});

Deno.test("forOf should return empty for empty array", () => {
  // Arrange / Act / Assert
  assertStrictEquals(forOf([]), empty);
});
