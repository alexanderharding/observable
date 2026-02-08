import { assertEquals } from "@std/assert";
import { Observable, Observer } from "@observable/core";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";
import { throwError } from "@observable/throw-error";
import { reduce } from "./mod.ts";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { empty } from "@observable/empty";

Deno.test("reduce should emit only the final accumulated value", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    [1, 2, 3],
    ofIterable(),
    reduce((previous, current) => previous + current, 0),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 6],
    ["return"],
  ]);
});

Deno.test("reduce should pass the index to the accumulator", () => {
  // Arrange
  const notifications: Array<ObserverNotification<string>> = [];
  const indices: Array<number> = [];
  const observable = pipe(
    ["a", "b", "c"],
    ofIterable(),
    reduce((previous, current, index) => {
      indices.push(index);
      return previous + current;
    }, ""),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", "abc"],
    ["return"],
  ]);
  assertEquals(indices, [0, 1, 2]);
});

Deno.test("reduce should pump throws through itself", () => {
  // Arrange
  const error = new Error("test");
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    throwError(error),
    reduce((previous, current) => previous + current, 0),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", error]]);
});

Deno.test("reduce should return without emitting if source is empty", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    empty,
    reduce((previous, current) => previous + current, 0),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("reduce should handle unsubscribe", () => {
  // Arrange
  const controller = new AbortController();
  const values: Array<number> = [];
  const source = new Observable<number>((observer) => {
    for (const value of [1, 2, 3, 4, 5]) {
      if (observer.signal.aborted) return;
      observer.next(value);
    }
    observer.return();
  });
  const reduced = pipe(
    source,
    reduce((previous, current) => previous + current, 0),
  );

  // Act - abort before subscription can complete processing
  reduced.subscribe(
    new Observer({
      signal: controller.signal,
      next: (value) => {
        values.push(value);
      },
    }),
  );
  controller.abort();

  // Assert - reduce should have emitted the final value before we aborted
  // Since the source is synchronous, reduce will complete before we abort
  assertEquals(values, [15]);
});

Deno.test("reduce should throw if the accumulator function throws", () => {
  // Arrange
  const error = new Error("test");
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    [1],
    ofIterable(),
    reduce(() => {
      throw error;
    }, 0),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", error]]);
});

Deno.test("reduce should work with different input and output types", () => {
  // Arrange
  const notifications: Array<ObserverNotification<Array<number>>> = [];
  const observable = pipe(
    [1, 2, 3],
    ofIterable(),
    reduce((previous, current) => [...previous, current], [] as Array<number>),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", [1, 2, 3]],
    ["return"],
  ]);
});

Deno.test("reduce should emit single value for source with one item", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    [42],
    ofIterable(),
    reduce((previous, current) => previous + current, 0),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 42],
    ["return"],
  ]);
});

Deno.test("reduce should reset state per subscription", () => {
  // Arrange
  const notifications1: Array<ObserverNotification<number>> = [];
  const notifications2: Array<ObserverNotification<number>> = [];
  const source = pipe([1, 2, 3], ofIterable());
  const reduced = pipe(
    source,
    reduce((previous, current) => previous + current, 0),
    materialize(),
  );

  // Act
  reduced.subscribe(
    new Observer((notification) => notifications1.push(notification)),
  );
  reduced.subscribe(
    new Observer((notification) => notifications2.push(notification)),
  );

  // Assert
  assertEquals(notifications1, [
    ["next", 6],
    ["return"],
  ]);
  assertEquals(notifications2, [
    ["next", 6],
    ["return"],
  ]);
});
