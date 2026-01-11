import { assertEquals } from "@std/assert";
import { Observable, Observer } from "@xan/observable-core";
import { materialize } from "./materialize.ts";
import type { ObserverNotification } from "./observer-notification.ts";
import { throwError } from "./throw-error.ts";
import { pipe } from "./pipe.ts";
import { tap } from "./tap.ts";
import { empty } from "./empty.ts";
import { of } from "./of.ts";

Deno.test("tap should pump next notifications to the provided observer", () => {
  // Arrange
  const notifications: Array<[1 | 2, ObserverNotification<number>]> = [];

  // Act
  pipe(
    new Observable<1 | 2>((observer) => {
      observer.next(1);
      observer.next(2);
    }),
    materialize(),
    tap(new Observer((notification) => notifications.push([1, notification]))),
  ).subscribe(
    new Observer((notification) => notifications.push([2, notification])),
  );

  // Assert
  assertEquals(notifications, [
    [1, ["N", 1]],
    [2, ["N", 1]],
    [1, ["N", 2]],
    [2, ["N", 2]],
  ]);
});

Deno.test(
  "tap should pump return notifications to the provided observer",
  () => {
    // Arrange
    const notifications: Array<[1 | 2, ObserverNotification<number>]> = [];

    // Act
    pipe(
      empty,
      materialize(),
      tap(new Observer((notification) => notifications.push([1, notification]))),
    ).subscribe(
      new Observer((notification) => notifications.push([2, notification])),
    );

    // Assert
    assertEquals(notifications, [
      [1, ["R"]],
      [2, ["R"]],
    ]);
  },
);

Deno.test(
  "tap should pump throw notifications to the provided observer",
  () => {
    // Arrange
    const error = new Error("test");
    const notifications: Array<[1 | 2, ObserverNotification<number>]> = [];

    // Act
    pipe(
      throwError(error),
      materialize(),
      tap(new Observer((notification) => notifications.push([1, notification]))),
    ).subscribe(
      new Observer((notification) => notifications.push([2, notification])),
    );

    // Assert
    assertEquals(notifications, [
      [1, ["T", error]],
      [2, ["T", error]],
    ]);
  },
);

Deno.test(
  "tap should unsubscribe without affecting the source subscription",
  () => {
    // Arrange
    const controller = new AbortController();
    const notifications: Array<[1 | 2, ObserverNotification<number>]> = [];

    // Act
    pipe(
      of([1, 2, 3]),
      materialize(),
      tap(
        new Observer({
          signal: controller.signal,
          next: (notification) => notifications.push([1, notification]),
        }),
      ),
    ).subscribe(
      new Observer((notification) => {
        if (notification[1] === 2) controller.abort();
        notifications.push([2, notification]);
      }),
    );

    // Assert
    assertEquals(notifications, [
      [1, ["N", 1]],
      [2, ["N", 1]],
      [1, ["N", 2]],
      [2, ["N", 2]],
      [2, ["N", 3]],
      [2, ["R"]],
    ]);
  },
);

Deno.test("tap should handle source unsubscribe", () => {
  // Arrange
  const controller = new AbortController();
  const notifications: Array<[1 | 2, ObserverNotification<number>]> = [];

  // Act
  pipe(
    of([1, 2, 3]),
    materialize(),
    tap(new Observer((notification) => notifications.push([1, notification]))),
  ).subscribe(
    new Observer({
      signal: controller.signal,
      next: (notification) => {
        if (notification[1] === 2) controller.abort();
        notifications.push([2, notification]);
      },
    }),
  );

  // Assert
  assertEquals(notifications, [
    [1, ["N", 1]],
    [2, ["N", 1]],
    [1, ["N", 2]],
    [2, ["N", 2]],
  ]);
});
