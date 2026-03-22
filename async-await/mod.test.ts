import { assertEquals, assertThrows } from "@std/assert";
import { Observer } from "@observable/core";
import { pipe } from "@observable/pipe";
import { asyncAwait } from "./mod.ts";
import { materialize, type ObserverNotification } from "@observable/materialize";

Deno.test("asyncAwait should throw when called with no promise", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => asyncAwait(...([] as unknown as Parameters<typeof asyncAwait>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("asyncAwait should emit resolved value and return", async () => {
  // Arrange
  const promise = Promise.resolve(42);
  const notifications: Array<ObserverNotification> = [];
  const { promise: done, resolve } = Promise.withResolvers<void>();

  // Act
  pipe(asyncAwait(promise), materialize()).subscribe(
    new Observer({
      next: (notification) => notifications.push(notification),
      return: resolve,
    }),
  );

  await done;

  // Assert
  assertEquals(notifications, [["next", 42], ["return"]]);
});

Deno.test("asyncAwait should support recursive PromiseLike objects", async () => {
  // Arrange
  const promise = Promise.resolve(Promise.resolve(42 as const));
  const notifications: Array<ObserverNotification<42>> = [];
  const { promise: done, resolve } = Promise.withResolvers<void>();

  // Act
  pipe(asyncAwait(promise), materialize()).subscribe(
    new Observer({
      next: (notification) => notifications.push(notification),
      return: resolve,
    }),
  );

  await done;

  // Assert
  assertEquals(notifications, [["next", 42], ["return"]]);
});

Deno.test("asyncAwait should support non-PromiseLike objects", async () => {
  // Arrange
  const notifications: Array<ObserverNotification<42>> = [];
  const { promise: done, resolve } = Promise.withResolvers<void>();

  // Act
  pipe(asyncAwait(42), materialize()).subscribe(
    new Observer({
      next: (notification) => notifications.push(notification),
      return: resolve,
    }),
  );

  await done;

  // Assert
  assertEquals(notifications, [["next", 42], ["return"]]);
});

Deno.test("asyncAwait should emit thrown value on rejection without calling return", async () => {
  // Arrange
  const error = new Error("test error");
  const promise = Promise.reject(error);
  const notifications: Array<ObserverNotification<void>> = [];
  const { promise: done, resolve } = Promise.withResolvers<void>();

  // Act
  pipe(asyncAwait(promise), materialize()).subscribe(
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

Deno.test("asyncAwait should work with PromiseLike objects", async () => {
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
  pipe(asyncAwait(promiseLike), materialize()).subscribe(
    new Observer({
      next: (notification) => notifications.push(notification),
      return: resolve,
    }),
  );

  await done;

  // Assert
  assertEquals(notifications, [["next", "hello"], ["return"]]);
});
