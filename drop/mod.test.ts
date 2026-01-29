import { assertEquals, assertStrictEquals } from "@std/assert";
import { Observer } from "@observable/core";
import { empty } from "@observable/empty";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { drop } from "./mod.ts";

Deno.test(
  "drop should return an empty observable if the count is less than 0",
  () => {
    // Arrange
    const source = pipe([1, 2, 3], ofIterable());

    // Act
    const result = pipe(source, drop(-1));

    // Assert
    assertStrictEquals(result, empty);
  },
);

Deno.test("drop should return the source observable if the count is 0", () => {
  // Arrange
  const source = pipe([1, 2, 3], ofIterable());

  // Act
  const result = pipe(source, drop(0));

  // Assert
  assertStrictEquals(result, source);
});

Deno.test("drop should return empty if the count is NaN", () => {
  // Arrange
  const source = pipe([1, 2, 3], ofIterable());

  // Act
  const result = pipe(source, drop(NaN));

  // Assert
  assertStrictEquals(result, empty);
});

Deno.test("drop should return the empty if the count is Infinity", () => {
  // Arrange
  const source = pipe([1, 2, 3], ofIterable());

  // Act
  const result = pipe(source, drop(Infinity));

  // Assert
  assertStrictEquals(result, empty);
});

Deno.test(
  "drop should drop the items if the count is a positive number",
  () => {
    // Arrange
    const source = pipe([1, 2, 3, 4, 5], ofIterable());
    const notifications: Array<ObserverNotification<number>> = [];
    const materialized = pipe(source, drop(2), materialize());

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ["next", 3],
      ["next", 4],
      ["next", 5],
      ["return"],
    ]);
  },
);
