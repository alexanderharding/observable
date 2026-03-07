import { assertEquals, assertThrows } from "@std/assert";
import { Observer } from "@observable/core";
import { forIn } from "./mod.ts";
import { pipe } from "@observable/pipe";
import { materialize, type ObserverNotification } from "@observable/materialize";

Deno.test("forIn should throw when called with no source", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => forIn(...([] as unknown as Parameters<typeof forIn>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("forIn should throw when source is not an Object", () => {
  // Arrange / Act / Assert
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => forIn(1 as any),
    TypeError,
    "Parameter 1 is not of type 'Object'",
  );
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => forIn(null as any),
    TypeError,
    "Parameter 1 is not of type 'Object'",
  );
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => forIn(undefined as any),
    TypeError,
    "Parameter 1 is not of type 'Object'",
  );
});

Deno.test("forIn should emit keys in order", () => {
  // Arrange
  const notifications: Array<ObserverNotification> = [];
  const source = forIn({ a: 1, b: 2, c: 3 });

  // Act
  pipe(source, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["next", "a"], ["next", "b"], ["next", "c"], ["return"]]);
});
