import { assertEquals } from "@std/assert";
import { Observable, Observer } from "@observable/core";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";
import { throwError } from "@observable/throw-error";
import { scan } from "./mod.ts";
import { materialize, type ObserverNotification } from "@observable/materialize";

Deno.test("scan should accumulate values with a seed", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    [1, 2, 3],
    ofIterable(),
    scan((previous, current) => previous + current, 0),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 3],
    ["next", 6],
    ["return"],
  ]);
});

Deno.test("scan should pass the index to the accumulator", () => {
  // Arrange
  const notifications: Array<ObserverNotification<string>> = [];
  const indices: Array<number> = [];
  const observable = pipe(
    ["a", "b", "c"],
    ofIterable(),
    scan((previous, current, index) => {
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
    ["next", "a"],
    ["next", "ab"],
    ["next", "abc"],
    ["return"],
  ]);
  assertEquals(indices, [0, 1, 2]);
});

Deno.test("scan should pump throws through itself", () => {
  // Arrange
  const error = new Error("test");
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    throwError(error),
    scan((previous, current) => previous + current, 0),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", error]]);
});

Deno.test("scan should pump returns through itself", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    [],
    ofIterable(),
    scan((previous, current) => previous + current, 0),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("scan should handle unsubscribe", () => {
  // Arrange
  let sourceAborted = false;
  const controller = new AbortController();
  const source = new Observable<number>((observer) =>
    observer.signal.addEventListener("abort", () => (sourceAborted = true), {
      once: true,
    })
  );
  const scanned = pipe(
    source,
    scan((previous, current) => previous + current, 0),
  );

  // Act
  scanned.subscribe(new Observer({ signal: controller.signal }));
  controller.abort();

  // Assert
  assertEquals(sourceAborted, true);
});

Deno.test("scan should throw if the accumulator function throws", () => {
  // Arrange
  const error = new Error("test");
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    [1],
    ofIterable(),
    scan(() => {
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

Deno.test("scan should work with different input and output types", () => {
  // Arrange
  const notifications: Array<ObserverNotification<Array<number>>> = [];
  const observable = pipe(
    [1, 2, 3],
    ofIterable(),
    scan((previous, current) => [...previous, current], [] as Array<number>),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", [1]],
    ["next", [1, 2]],
    ["next", [1, 2, 3]],
    ["return"],
  ]);
});

Deno.test("scan should reset state per subscription when using defer", () => {
  // Arrange
  const notifications1: Array<ObserverNotification<number>> = [];
  const notifications2: Array<ObserverNotification<number>> = [];
  const source = pipe([1, 2, 3], ofIterable());
  const scanned = pipe(
    source,
    scan((previous, current) => previous + current, 0),
    materialize(),
  );

  // Act
  scanned.subscribe(
    new Observer((notification) => notifications1.push(notification)),
  );
  scanned.subscribe(
    new Observer((notification) => notifications2.push(notification)),
  );

  // Assert
  assertEquals(notifications1, [
    ["next", 1],
    ["next", 3],
    ["next", 6],
    ["return"],
  ]);
  assertEquals(notifications2, [
    ["next", 1],
    ["next", 3],
    ["next", 6],
    ["return"],
  ]);
});
