import { assertEquals, assertThrows } from "@std/assert";
import { Observable, Observer, Subject } from "@observable/core";
import { pipe } from "@observable/pipe";
import { of } from "@observable/of";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { distinct } from "./mod.ts";
import { flat } from "@observable/flat";
import { throwError } from "@observable/throw-error";

Deno.test(
  "distinct should filter out all duplicate values across the stream",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const source = of([1, 2, 2, 3, 1, 3, 4, 2]);
    const materialized = pipe(source, distinct(), materialize());

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ["next", 1],
      ["next", 2],
      ["next", 3],
      ["next", 4],
      ["return"],
    ]);
  },
);

Deno.test("distinct should emit all values when none are duplicates", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = of([1, 2, 3, 4, 5]);
  const materialized = pipe(source, distinct(), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["next", 4],
    ["next", 5],
    ["return"],
  ]);
});

Deno.test(
  "distinct should emit only first value when all values are the same",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const source = of([5, 5, 5, 5, 5]);
    const materialized = pipe(source, distinct(), materialize());

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [["next", 5], ["return"]]);
  },
);

Deno.test("distinct should handle empty source", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = of<number>([]);
  const materialized = pipe(source, distinct(), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("distinct should pump throws right through itself", () => {
  // Arrange
  const error = new Error("test error");
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Observable<number>((observer) => {
    observer.next(1);
    observer.next(2);
    observer.next(1);
    observer.throw(error);
  });
  const materialized = pipe(source, distinct(), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["throw", error],
  ]);
});

Deno.test("distinct should honor unsubscribe", () => {
  // Arrange
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<number>> = [];
  const source = flat([of([1, 2, 3, 1, 2, 3]), throwError(new Error("Should not make it here"))]);
  const materialized = pipe(source, distinct(), materialize());

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

Deno.test("distinct should throw when called with no source", () => {
  // Arrange
  const operator = distinct();

  // Act / Assert
  assertThrows(
    () => operator(...([] as unknown as Parameters<typeof operator>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("distinct should throw when source is not an Observable", () => {
  // Arrange
  const operator = distinct();

  // Act / Assert
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => operator(1 as any),
    TypeError,
    "Parameter 1 is not of type 'Observable'",
  );
});

Deno.test("distinct should work with Subject", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Subject<number>();
  const materialized = pipe(source, distinct(), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next(1);
  source.next(2);
  source.next(1);
  source.next(3);
  source.next(2);
  source.next(3);
  source.return();

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["return"],
  ]);
});

Deno.test("distinct should work with string values", () => {
  // Arrange
  const notifications: Array<ObserverNotification<string>> = [];
  const source = of(["a", "b", "a", "c", "b", "d"]);
  const materialized = pipe(source, distinct(), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", "a"],
    ["next", "b"],
    ["next", "c"],
    ["next", "d"],
    ["return"],
  ]);
});

Deno.test("distinct should use reference equality for objects", () => {
  // Arrange
  const obj1 = { id: 1 };
  const obj2 = { id: 2 };
  const obj3 = { id: 1 };
  const notifications: Array<ObserverNotification<{ id: number }>> = [];
  const source = of([obj1, obj2, obj1, obj3, obj2]);
  const materialized = pipe(source, distinct(), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", obj1],
    ["next", obj2],
    ["next", obj3],
    ["return"],
  ]);
});

Deno.test("distinct should reset state for each subscription", () => {
  // Arrange
  const notifications1: Array<ObserverNotification<number>> = [];
  const notifications2: Array<ObserverNotification<number>> = [];
  const source = of([1, 2, 1, 2, 3]);
  const distinctSource = pipe(source, distinct());

  // Act
  pipe(distinctSource, materialize()).subscribe(
    new Observer((notification) => notifications1.push(notification)),
  );
  pipe(distinctSource, materialize()).subscribe(
    new Observer((notification) => notifications2.push(notification)),
  );

  // Assert
  assertEquals(notifications1, [
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["return"],
  ]);
  assertEquals(notifications2, [
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["return"],
  ]);
});
