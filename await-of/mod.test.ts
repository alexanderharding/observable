import { assertEquals, assertThrows } from "@std/assert";
import { Observer } from "@observable/core";
import { pipe } from "@observable/pipe";
import { awaitOf } from "./mod.ts";
import { materialize, type ObserverNotification } from "@observable/materialize";

Deno.test("awaitOf should throw when called with no promise", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => awaitOf(...([] as unknown as Parameters<typeof awaitOf>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("awaitOf should throw when promise is not a PromiseLike", () => {
  // Arrange
  assertThrows(
    () => awaitOf(1 as unknown as PromiseLike<unknown>),
    TypeError,
    "Parameter 1 is not of type 'PromiseLike'",
  );
});

Deno.test("awaitOf should emit resolved value and return", async () => {
  // Arrange
  const promise = Promise.resolve(42);
  const notifications: Array<ObserverNotification> = [];
  const { promise: done, resolve } = Promise.withResolvers<void>();

  // Act
  pipe(awaitOf(promise), materialize()).subscribe(
    new Observer({
      next: (notification) => notifications.push(notification),
      return: resolve,
    }),
  );

  await done;

  // Assert
  assertEquals(notifications, [["next", 42], ["return"]]);
});

Deno.test("awaitOf should emit thrown value on rejection without calling return", async () => {
  // Arrange
  const error = new Error("test error");
  const promise = Promise.reject(error);
  const notifications: Array<ObserverNotification<void>> = [];
  const { promise: done, resolve } = Promise.withResolvers<void>();

  // Act
  pipe(awaitOf(promise), materialize()).subscribe(
    new Observer({
      next: (notification) => notifications.push(notification),
      return: resolve,
    }),
  );

  await done;

  // Assert
  assertEquals(notifications.length, 1);
  assertEquals(notifications[0]![0], "throw");
  assertEquals((notifications[0]![1] as Error).message, "test error");
});

Deno.test("awaitOf should work with PromiseLike objects", async () => {
  // Arrange
  const promiseLike: PromiseLike<string> = {
    then<TResult1, TResult2>(
      onfulfilled?: ((value: string) => TResult1 | PromiseLike<TResult1>) | null,
    ): PromiseLike<TResult1 | TResult2> {
      onfulfilled?.("hello");
      return this as unknown as PromiseLike<TResult1 | TResult2>;
    },
  };
  const notifications: Array<ObserverNotification> = [];
  const { promise: done, resolve } = Promise.withResolvers<void>();

  // Act
  pipe(awaitOf(promiseLike), materialize()).subscribe(
    new Observer({
      next: (notification) => notifications.push(notification),
      return: resolve,
    }),
  );

  await done;

  // Assert
  assertEquals(notifications, [["next", "hello"], ["return"]]);
});
