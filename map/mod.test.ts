import { assertEquals } from "@std/assert";
import { Observable, Observer } from "@observable/core";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";
import { throwError } from "@observable/throw-error";
import { map } from "./mod.ts";
import { materialize, type ObserverNotification } from "@observable/materialize";

Deno.test("map should project the values", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const indices: Array<number> = [];
  const observable = pipe(
    [1, 2, 3],
    ofIterable(),
    map((value, index) => {
      indices.push(index);
      return value * 2;
    }),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 2],
    ["next", 4],
    ["next", 6],
    ["return"],
  ]);
  assertEquals(indices, [0, 1, 2]);
});

Deno.test("map should pump throws through itself", () => {
  // Arrange
  const error = new Error("test");
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    throwError(error),
    map((value) => value * 2),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", error]]);
});

Deno.test("map should pump returns through itself", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    [],
    ofIterable(),
    map((value) => value * 2),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("map should handle abort", () => {
  // Arrange
  let sourceAborted = false;
  const controller = new AbortController();
  const source = new Observable<number>((observer) =>
    observer.signal.addEventListener("abort", () => (sourceAborted = true), {
      once: true,
    })
  );
  const doubled = pipe(
    source,
    map((value) => value * 2),
  );

  // Act
  doubled.subscribe(new Observer({ signal: controller.signal }));
  controller.abort();

  // Assert
  assertEquals(sourceAborted, true);
});

Deno.test("map should throw if the project function throws", () => {
  // Arrange
  const error = new Error("test");
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    [1],
    ofIterable(),
    map(() => {
      throw error;
    }),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", error]]);
});
