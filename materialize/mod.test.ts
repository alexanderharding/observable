import { assertEquals } from "@std/assert";
import { Observer } from "@observable/core";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";
import { throwError } from "@observable/throw-error";
import { materialize, type ObserverNotification } from "./mod.ts";

Deno.test(
  "materialize should emit the notifications from a source observable that returns",
  () => {
    // Arrange
    const source = pipe([1, 2, 3], ofIterable());
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

Deno.test("materialize should honor abort", () => {
  // Arrange
  const controller = new AbortController();
  const source = pipe([1, 2], ofIterable());
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
