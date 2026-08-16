import { merge } from "./mod.ts";
import { forOf } from "@observable/for-of";
import { Observer } from "@observable/core";
import { pipe } from "@observable/pipe";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { empty } from "@observable/empty";

Deno.test("merge should merge the values", () => {
  // Arrange
  const notifications: Array<ObserverNotification> = [];
  const observable = merge([
    forOf([1, 2, 3]),
    forOf([4, 5, 6]),
    forOf([7, 8, 9]),
  ]);

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

Deno.test(
  "merge should not throw when invoked with more than one argument",
  () => {
    // Arrange / Act / Assert
    merge(...([[], 2] as unknown as Parameters<typeof merge>));
  },
);

Deno.test("merge should throw when invoked with no arguments", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => merge(...([] as unknown as Parameters<typeof merge>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test(
  "merge should throw when invoked with a non-iterable as the first argument",
  () => {
    // Arrange / Act / Assert
    assertThrows(
      () => merge(...([123] as unknown as Parameters<typeof merge>)),
      TypeError,
      "Parameter 1 is not of type 'Iterable'",
    );
  },
);
