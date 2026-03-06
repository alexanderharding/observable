import { assertEquals, assertThrows } from "@std/assert";
import { Observer } from "@observable/core";
import { pipe } from "@observable/pipe";
import { awaitValue } from "./mod.ts";
import { materialize, type ObserverNotification } from "@observable/materialize";

Deno.test("awaitValue should throw when called with no promise", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => awaitValue(...([] as unknown as Parameters<typeof awaitValue>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("awaitValue should throw when promise is not a PromiseLike", () => {
  // Arrange
  assertThrows(
    () => awaitValue(1 as unknown as PromiseLike<unknown>),
    TypeError,
    "Parameter 1 is not of type 'PromiseLike'",
  );
});

Deno.test("awaitValue should emit resolved value and return", async () => {
  // Arrange
  const promise = Promise.resolve(42);
  const notifications: Array<ObserverNotification> = [];
  const { promise: done, resolve } = Promise.withResolvers<void>();

  // Act
  pipe(awaitValue(promise), materialize()).subscribe(
    new Observer({
      next: (notification) => notifications.push(notification),
      return: resolve,
    }),
  );

  await done;

  // Assert
  assertEquals(notifications, [["next", 42], ["return"]]);
});

Deno.test("awaitValue should emit thrown value on rejection without calling return", async () => {
  // Arrange
  const error = new Error("test error");
  const promise = Promise.reject(error);
  const notifications: Array<ObserverNotification<void>> = [];
  const { promise: done, resolve } = Promise.withResolvers<void>();

  // Act
  pipe(awaitValue(promise), materialize()).subscribe(
    new Observer({
      next: (notification) => notifications.push(notification),
      return: resolve,
    }),
  );

  await done;

  // Assert - only throw notification (no next values, no return from source)
  assertEquals(notifications.length, 1);
  assertEquals(notifications[0]![0], "throw");
  assertEquals((notifications[0]![1] as Error).message, "test error");
});

Deno.test("awaitValue should work with PromiseLike objects", async () => {
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
  pipe(awaitValue(promiseLike), materialize()).subscribe(
    new Observer({
      next: (notification) => notifications.push(notification),
      return: resolve,
    }),
  );

  await done;

  // Assert
  assertEquals(notifications, [["next", "hello"], ["return"]]);
});
