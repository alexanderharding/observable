import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { type Observable, Observer } from "@observable/core";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { pipe } from "@observable/pipe";
import { keepAlive } from "./mod.ts";
import { forOf } from "@observable/for-of";
import { tap } from "@observable/tap";
import { throwError } from "@observable/throw-error";

Deno.test("keepAlive should throw if source is not provided", () => {
  const keepAliveFn = keepAlive();
  assertThrows(
    () => (keepAliveFn as (source?: unknown) => Observable<number>)(),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test(
  "keepAlive should throw if source is not an Observable (e.g. undefined)",
  () => {
    const keepAliveFn = keepAlive();
    assertThrows(
      () => keepAliveFn(undefined as unknown as Observable<number>),
      TypeError,
      "Parameter 1 is not of type 'Observable'",
    );
  },
);

Deno.test(
  "keepAlive should throw if source is not an Observable (invalid object)",
  () => {
    const keepAliveFn = keepAlive();
    assertThrows(
      () => keepAliveFn({ subscribe: 1 } as unknown as Observable<number>),
      TypeError,
      "Parameter 1 is not of type 'Observable'",
    );
  },
);

Deno.test("keepAlive should ignore unsubscribe indefinitely", () => {
  // Arrange
  const controller = new AbortController();
  const tapNotifications: Array<ObserverNotification<number>> = [];
  const observerNotifications: Array<ObserverNotification<number>> = [];
  const source = forOf([1, 2, 3]);

  // Act
  pipe(
    source,
    materialize(),
    tap((notification) => tapNotifications.push(notification)),
    keepAlive(),
  ).subscribe(
    new Observer({
      signal: controller.signal,
      next: (notification) => {
        observerNotifications.push(notification);
        if (notification[1] === 2) controller.abort();
      },
    }),
  );

  // Assert
  assertStrictEquals(controller.signal.aborted, true);
  assertEquals(observerNotifications, [
    ["next", 1],
    ["next", 2],
  ]);
  assertEquals(tapNotifications, [["next", 1], ["next", 2], ["next", 3], ["return"]]);
});

Deno.test("keepAlive should forward throw notifications", () => {
  // Arrange
  const error = new Error("test");
  const observerNotifications: Array<ObserverNotification<number>> = [];
  const source = throwError(error);

  // Act
  pipe(source, keepAlive(), materialize()).subscribe(
    new Observer((notification) => observerNotifications.push(notification)),
  );

  // Assert
  assertEquals(observerNotifications, [["throw", error]]);
});
