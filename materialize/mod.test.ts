import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { Observer } from "@observable/core";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { throwError } from "@observable/throw-error";
import { isObserverNotification, materialize, type ObserverNotification } from "./mod.ts";

Deno.test(
  "materialize should emit the notifications from a source observable that returns",
  () => {
    // Arrange
    const source = forOf([1, 2, 3]);
    const nextCalls: Array<
      Parameters<Observer<ObserverNotification<number>>["next"]>
    > = [];
    const returnCalls: Array<Parameters<Observer["return"]>> = [];
    const throwCalls: Array<Parameters<Observer["throw"]>> = [];

    // Act
    pipe(source, materialize()).subscribe(
      new Observer({
        next: (...args) => nextCalls.push(args),
        return: (...args) => returnCalls.push(args),
        throw: (...args) => throwCalls.push(args),
      }),
    );

    // Assert
    assertEquals(nextCalls, [
      [["next", 1]],
      [["next", 2]],
      [["next", 3]],
      [["return"]],
    ]);
    assertEquals(returnCalls, [[]]);
    assertEquals(throwCalls, []);
  },
);

Deno.test(
  "materialize should emit the notifications from a source observable that throws",
  () => {
    // Arrange
    const error = new Error("test");
    const source = throwError(error);
    const notifications: Array<ObserverNotification<never>> = [];
    const returnCalls: Array<Parameters<Observer["return"]>> = [];
    const throwCalls: Array<Parameters<Observer["throw"]>> = [];

    // Act
    pipe(source, materialize()).subscribe(
      new Observer({
        next: (notification) => notifications.push(notification),
        return: (...args) => returnCalls.push(args),
        throw: (...args) => throwCalls.push(args),
      }),
    );

    // Assert
    assertEquals(notifications, [["throw", error]]);
    assertEquals(returnCalls, [[]]);
    assertEquals(throwCalls, []);
  },
);

Deno.test("materialize should honor unsubscription", () => {
  // Arrange
  const controller = new AbortController();
  const source = forOf([1, 2]);
  const nextCalls: Array<ObserverNotification<number>> = [];
  const returnCalls: Array<Parameters<Observer["return"]>> = [];
  const throwCalls: Array<Parameters<Observer["throw"]>> = [];

  // Act
  pipe(source, materialize()).subscribe({
    signal: controller.signal,
    next: (notification) => {
      nextCalls.push(notification);
      if (nextCalls.length === 2) controller.abort();
    },
    return: (...args) => returnCalls.push(args),
    throw: (...args) => throwCalls.push(args),
  });

  // Assert
  assertEquals(nextCalls, [
    ["next", 1],
    ["next", 2],
  ]);
  assertEquals(returnCalls, []);
  assertEquals(throwCalls, []);
});

Deno.test("isObserverNotification should throw if no arguments are provided", () => {
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => isObserverNotification(),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("isObserverNotification should return true for a next notification", () => {
  // Arrange
  const notification: ObserverNotification = ["next", 0];

  // Act
  const result = isObserverNotification(notification);

  // Assert
  assertStrictEquals(result, true);
});

Deno.test("isObserverNotification should return true for a return notification", () => {
  // Arrange
  const notification: ObserverNotification = ["return"];

  // Act
  const result = isObserverNotification(notification);

  // Assert
  assertStrictEquals(result, true);
});

Deno.test("isObserverNotification should return true for a throw notification", () => {
  // Arrange
  const error = new Error("test");
  const notification: ObserverNotification = ["throw", error];

  // Act
  const result = isObserverNotification(notification);

  // Assert
  assertStrictEquals(result, true);
});

Deno.test(
  "isObserverNotification should return false when next lacks a value",
  () => {
    // Arrange
    const notification = ["next"];

    // Act
    const result = isObserverNotification(notification);

    // Assert
    assertStrictEquals(result, false);
  },
);
Deno.test(
  "isObserverNotification should return false when throw lacks a value",
  () => {
    // Arrange
    const notification = ["throw"];

    // Act
    const result = isObserverNotification(notification);

    // Assert
    assertStrictEquals(result, false);
  },
);

Deno.test("isObserverNotification should return false for an unknown notification kind", () => {
  // Arrange
  const notification = ["invalid"];

  // Act
  const result = isObserverNotification(notification);

  // Assert
  assertStrictEquals(result, false);
});

Deno.test("isObserverNotification should return false when the value is not an array", () => {
  // Arrange
  const value = null;

  // Act
  const result = isObserverNotification(value);

  // Assert
  assertStrictEquals(result, false);
});
