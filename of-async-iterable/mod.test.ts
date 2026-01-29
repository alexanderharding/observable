import { assertEquals, assertThrows } from "@std/assert";
import { Observer } from "@observable/core";
import { ofAsyncIterable } from "./mod.ts";
import { pipe } from "@observable/pipe";
import { materialize, type ObserverNotification } from "@observable/materialize";

Deno.test("ofAsyncIterable should throw when called with no source", () => {
  // Arrange
  const operator = ofAsyncIterable();

  // Act / Assert
  assertThrows(
    () => operator(...([] as unknown as Parameters<typeof operator>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("ofAsyncIterable should throw when source is not an AsyncIterable", () => {
  // Arrange
  const operator = ofAsyncIterable();

  // Act / Assert
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => operator(1 as any),
    TypeError,
    "Parameter 1 is not of type 'AsyncIterable'",
  );
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => operator(null as any),
    TypeError,
    "Parameter 1 is not of type 'AsyncIterable'",
  );
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => operator(undefined as any),
    TypeError,
    "Parameter 1 is not of type 'AsyncIterable'",
  );
});

Deno.test("ofAsyncIterable should emit all values in order and then return", async () => {
  // Arrange
  async function* generateValues() {
    yield 1;
    yield 2;
    yield 3;
  }
  const notifications: Array<ObserverNotification> = [];
  const { promise: done, resolve } = Promise.withResolvers<void>();

  // Act
  pipe(generateValues(), ofAsyncIterable(), materialize()).subscribe(
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

Deno.test("ofAsyncIterable should handle async generator with delays", async () => {
  // Arrange
  async function* generateDelayedValues() {
    yield await Promise.resolve("a");
    yield await Promise.resolve("b");
  }
  const notifications: Array<ObserverNotification> = [];
  const { promise: done, resolve } = Promise.withResolvers<void>();

  // Act
  pipe(generateDelayedValues(), ofAsyncIterable(), materialize()).subscribe(
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

Deno.test("ofAsyncIterable should handle empty async iterable", async () => {
  // Arrange
  async function* empty() {
    // yields nothing
  }
  const notifications: Array<ObserverNotification> = [];
  const { promise: done, resolve } = Promise.withResolvers<void>();

  // Act
  pipe(empty(), ofAsyncIterable(), materialize()).subscribe(
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

Deno.test("ofAsyncIterable should emit thrown value on error", async () => {
  // Arrange
  const error = new Error("test error");
  async function* throwingGenerator() {
    yield 1;
    throw error;
  }
  const notifications: Array<ObserverNotification> = [];
  const { promise: done, resolve } = Promise.withResolvers<void>();

  // Act
  pipe(throwingGenerator(), ofAsyncIterable(), materialize()).subscribe(
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
