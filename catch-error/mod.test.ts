import { assertEquals, assertThrows } from "@std/assert";
import { Observable, Observer, Subject } from "@observable/core";
import { pipe } from "@observable/pipe";
import { of } from "@observable/of";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { catchError } from "./mod.ts";
import { throwError } from "@observable/throw-error";
import { flat } from "@observable/flat";

Deno.test("catchError should catch errors and emit values from resolver", () => {
  // Arrange
  const error = new Error("test error");
  const notifications: Array<ObserverNotification<number | string>> = [];
  const source = flat([of([1, 2]), throwError(error)]);
  const materialized = pipe(
    source,
    catchError(() => of(["recovered"])),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", "recovered"],
    ["return"],
  ]);
});

Deno.test("catchError should pass error value to resolver", () => {
  // Arrange
  const error = new Error("specific error");
  let receivedError: unknown;
  const notifications: Array<ObserverNotification<number | string>> = [];
  const source = throwError(error);
  const materialized = pipe(
    source,
    catchError((err) => {
      receivedError = err;
      return of(["handled"]);
    }),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(receivedError, error);
  assertEquals(notifications, [["next", "handled"], ["return"]]);
});

Deno.test("catchError should propagate error from resolved observable", () => {
  // Arrange
  const originalError = new Error("original");
  const resolvedError = new Error("from resolved");
  const notifications: Array<ObserverNotification<number>> = [];
  const source = throwError(originalError);
  const materialized = pipe(
    source,
    catchError(() => throwError(resolvedError)),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", resolvedError]]);
});

Deno.test("catchError should pass through values if no error occurs", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = of([1, 2, 3]);
  const materialized = pipe(
    source,
    catchError(() => of([999])),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["return"],
  ]);
});

Deno.test("catchError should pass through return", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = of<number>([]);
  const materialized = pipe(
    source,
    catchError(() => of([999])),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("catchError should honor unsubscribe", () => {
  // Arrange
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<number>> = [];
  const source = of([1, 2, 3, 4, 5]);
  const materialized = pipe(
    source,
    catchError(() => of([999])),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer({
      signal: controller.signal,
      next: (notification) => {
        notifications.push(notification);
        if (notification[0] === "next" && notification[1] === 2) {
          controller.abort();
        }
      },
    }),
  );

  // Assert
  assertEquals(notifications, [["next", 1], ["next", 2]]);
});

Deno.test("catchError should honor unsubscribe during error handling", () => {
  // Arrange
  const controller = new AbortController();
  const error = new Error("test");
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Observable<number>((observer) => {
    observer.next(1);
    observer.throw(error);
  });
  const recoverySource = new Observable<number>((observer) => {
    for (const value of [10, 20, 30]) {
      observer.next(value);
      if (observer.signal.aborted) return;
    }
    observer.return();
  });
  const materialized = pipe(
    source,
    catchError(() => recoverySource),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer({
      signal: controller.signal,
      next: (notification) => {
        notifications.push(notification);
        if (notification[0] === "next" && notification[1] === 10) {
          controller.abort();
        }
      },
    }),
  );

  // Assert
  assertEquals(notifications, [["next", 1], ["next", 10]]);
});

Deno.test("catchError should throw when called with no arguments", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => catchError(...([] as unknown as Parameters<typeof catchError>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("catchError should throw when resolver is not a function", () => {
  // Arrange / Act / Assert
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => catchError(1 as any),
    TypeError,
    "Parameter 1 is not of type 'Function'",
  );
});

Deno.test("catchError should throw when called with no source", () => {
  // Arrange
  const operator = catchError(() => of([1]));

  // Act / Assert
  assertThrows(
    () => operator(...([] as unknown as Parameters<typeof operator>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("catchError should throw when source is not an Observable", () => {
  // Arrange
  const operator = catchError(() => of([1]));

  // Act / Assert
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => operator(1 as any),
    TypeError,
    "Parameter 1 is not of type 'Observable'",
  );
});

Deno.test("catchError should work with Subject", () => {
  // Arrange
  const error = new Error("subject error");
  const notifications: Array<ObserverNotification<number | string>> = [];
  const source = new Subject<number>();
  const materialized = pipe(
    source,
    catchError(() => of(["caught"])),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next(1);
  source.next(2);
  source.throw(error);

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", "caught"],
    ["return"],
  ]);
});

Deno.test("catchError should allow re-throwing different error", () => {
  // Arrange
  const originalError = new Error("original");
  const newError = new Error("new error");
  const notifications: Array<ObserverNotification<number>> = [];
  const source = throwError(originalError);
  const materialized = pipe(
    source,
    catchError(() => throwError(newError)),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", newError]]);
});

Deno.test("catchError should emit multiple values from recovery observable", () => {
  // Arrange
  const error = new Error("test");
  const notifications: Array<ObserverNotification<number>> = [];
  const source = throwError(error);
  const materialized = pipe(
    source,
    catchError(() => of([10, 20, 30])),
    materialize(),
  );

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
