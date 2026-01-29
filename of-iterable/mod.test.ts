import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { empty } from "@observable/empty";
import { Observer } from "@observable/core";
import { ofIterable } from "./mod.ts";
import { pipe } from "@observable/pipe";
import { materialize, type ObserverNotification } from "@observable/materialize";

Deno.test("ofIterable should throw when called with no source", () => {
  // Arrange
  const operator = ofIterable();

  // Act / Assert
  assertThrows(
    () => operator(...([] as unknown as Parameters<typeof operator>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("ofIterable should throw when source is not an Iterable", () => {
  // Arrange
  const operator = ofIterable();

  // Act / Assert
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => operator(1 as any),
    TypeError,
    "Parameter 1 is not of type 'Iterable'",
  );
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => operator(null as any),
    TypeError,
    "Parameter 1 is not of type 'Iterable'",
  );
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => operator(undefined as any),
    TypeError,
    "Parameter 1 is not of type 'Iterable'",
  );
});

Deno.test("ofIterable should return empty if no values are provided", () => {
  // Arrange
  const observable = pipe([], ofIterable());
  const notifications: Array<ObserverNotification> = [];

  // Act
  pipe(observable, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertStrictEquals(observable, empty);
  assertEquals(notifications, [["return"]]);
});

Deno.test("ofIterable should emit all values in order and then return", () => {
  // Arrange
  const notifications: Array<ObserverNotification> = [];

  // Act
  pipe([1, "test", true], ofIterable(), materialize()).subscribe(
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

Deno.test("ofIterable should work with Set", () => {
  // Arrange
  const notifications: Array<ObserverNotification> = [];

  // Act
  pipe(new Set([1, 1, 2, 2, 3, 3]), ofIterable(), materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["return"],
  ]);
});
