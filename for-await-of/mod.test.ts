import { assertEquals, assertThrows } from "@std/assert";
import { Observer } from "@observable/core";
import { forAwaitOf } from "./mod.ts";
import { pipe } from "@observable/pipe";
import { materialize, type ObserverNotification } from "@observable/materialize";

Deno.test("forAwaitOf should throw when called with no source", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => forAwaitOf(...([] as unknown as Parameters<typeof forAwaitOf>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("forAwaitOf should throw when source is not an AsyncIterable", () => {
  // Arrange / Act / Assert
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => forAwaitOf(1 as any),
    TypeError,
    "Parameter 1 is not of type 'AsyncIterable'",
  );
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => forAwaitOf(null as any),
    TypeError,
    "Parameter 1 is not of type 'AsyncIterable'",
  );
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => forAwaitOf(undefined as any),
    TypeError,
    "Parameter 1 is not of type 'AsyncIterable'",
  );
});

Deno.test("forAwaitOf should emit all values in order and then return", async () => {
  // Arrange
  async function* generateValues() {
    yield 1;
    yield 2;
    yield 3;
  }
  const notifications: Array<ObserverNotification> = [];
  const { promise: done, resolve } = Promise.withResolvers<void>();

  // Act
  pipe(forAwaitOf(generateValues()), materialize()).subscribe(
    new Observer({
      next: (notification) => notifications.push(notification),
      return: resolve,
    }),
  );

  await done;

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["return"],
  ]);
});

Deno.test("forAwaitOf should handle async generator with delays", async () => {
  // Arrange
  async function* generateDelayedValues() {
    yield await Promise.resolve("a");
    yield await Promise.resolve("b");
  }
  const notifications: Array<ObserverNotification> = [];
  const { promise: done, resolve } = Promise.withResolvers<void>();

  // Act
  pipe(forAwaitOf(generateDelayedValues()), materialize()).subscribe(
    new Observer({
      next: (notification) => notifications.push(notification),
      return: resolve,
    }),
  );

  await done;

  // Assert
  assertEquals(notifications, [
    ["next", "a"],
    ["next", "b"],
    ["return"],
  ]);
});

Deno.test("forAwaitOf should handle empty async iterable", async () => {
  // Arrange
  async function* empty() {
    // yields nothing
  }
  const notifications: Array<ObserverNotification> = [];
  const { promise: done, resolve } = Promise.withResolvers<void>();

  // Act
  pipe(forAwaitOf(empty()), materialize()).subscribe(
    new Observer({
      next: (notification) => notifications.push(notification),
      return: resolve,
    }),
  );

  await done;

  // Assert
  assertEquals(notifications, [
    ["return"],
  ]);
});

Deno.test("forAwaitOf should emit thrown value on error", async () => {
  // Arrange
  const error = new Error("test error");
  async function* throwingGenerator() {
    yield 1;
    throw error;
  }
  const notifications: Array<ObserverNotification> = [];
  const { promise: done, resolve } = Promise.withResolvers<void>();

  // Act
  pipe(forAwaitOf(throwingGenerator()), materialize()).subscribe(
    new Observer({
      next: (notification) => notifications.push(notification),
      return: resolve,
    }),
  );

  await done;

  // Assert
  assertEquals(notifications.length, 2);
  assertEquals(notifications[0], ["next", 1]);
  assertEquals(notifications[1]![0], "throw");
  assertEquals((notifications[1]![1] as Error).message, "test error");
});
