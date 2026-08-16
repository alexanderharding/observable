import { assertEquals, assertThrows } from "@std/assert";
import { type Observable, Observer, Subject } from "@observable/core";
import { never } from "@observable/never";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { until } from "./mod.ts";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { flat } from "@observable/flat";
import { of } from "@observable/of";
import { throwError } from "@observable/throw-error";

Deno.test("until should throw if no arguments are provided", () => {
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => until(),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("until should throw if notifier is not an Observable", () => {
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => until("not an observable"),
    TypeError,
    "Parameter 1 is not of type 'Observable'",
  );
});

Deno.test("until should throw if source is not provided", () => {
  const untilNever = until(never);
  assertThrows(
    () => (untilNever as (source?: unknown) => Observable<number>)(),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test(
  "until should throw if source is not an Observable (e.g. undefined)",
  () => {
    const untilNever = until(never);
    assertThrows(
      () => untilNever(undefined as unknown as Observable<number>),
      TypeError,
      "Parameter 1 is not of type 'Observable'",
    );
  },
);

Deno.test(
  "until should throw if source is not an Observable (invalid object)",
  () => {
    const untilNever = until(never);
    assertThrows(
      () => untilNever({ subscribe: 1 } as unknown as Observable<number>),
      TypeError,
      "Parameter 1 is not of type 'Observable'",
    );
  },
);

Deno.test("until should return when notifier nexts", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = forOf([1, 2, 3, 4, 5]);
  const notifier = new Subject<void>();
  const materialized = pipe(source, until(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => {
      notifications.push(notification);
      if (notification[1] === 2) notifier.next();
    }),
  );

  // Assert
  assertEquals(notifications, [["next", 1], ["next", 2], ["return"]]);
});

Deno.test("until should let values through until notifier nexts", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Subject<number>();
  const notifier = new Subject<void>();
  const materialized = pipe(source, until(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next(1);
  source.next(2);
  notifier.next(); // trigger completion
  source.next(3);
  source.return();

  // Assert
  assertEquals(notifications, [["next", 1], ["next", 2], ["return"]]);
});

Deno.test("until should allow all values if notifier never fires", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = forOf([10, 20, 30]);
  const notifier = never;
  const materialized = pipe(source, until(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 10],
    ["next", 20],
    ["next", 30],
    ["return"],
  ]);
});

Deno.test("until should propagate throws from source", () => {
  // Arrange
  const error = new Error("source error");
  const notifications: Array<ObserverNotification<number>> = [];
  const source = flat([of(1), throwError(error)]);
  const notifier = new Subject<void>();
  const materialized = pipe(source, until(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["throw", error],
  ]);
});

Deno.test("until should propagate throws from notifier", () => {
  // Arrange
  const error = new Error("notifier error");
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Subject<number>();
  const notifier = new Subject<void>();
  const materialized = pipe(source, until(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  notifier.throw(error);

  // Assert
  assertEquals(notifications, [["throw", error]]);
});

Deno.test("until should honor unsubscribe", () => {
  // Arrange
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Subject<number>();
  const notifier = new Subject<void>();
  const materialized = pipe(source, until(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer({
      signal: controller.signal,
      next: (notification) => {
        notifications.push(notification);
        controller.abort();
      },
    }),
  );
  source.next(123);
  notifier.next();
  source.return();

  // Assert
  assertEquals(notifications, [["next", 123]]);
});
