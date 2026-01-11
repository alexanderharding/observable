import { assertEquals } from "@std/assert";
import { Observable, Observer } from "@xan/observable-core";
import { of } from "./of.ts";
import { pipe } from "./pipe.ts";
import { throwError } from "./throw-error.ts";
import { map } from "./map.ts";
import { materialize } from "./materialize.ts";
import type { ObserverNotification } from "./observer-notification.ts";

Deno.test("map should project the values", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const indices: Array<number> = [];
  const observable = pipe(
    of([1, 2, 3]),
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
  assertEquals(notifications, [["N", 2], ["N", 4], ["N", 6], ["R"]]);
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
  assertEquals(notifications, [["T", error]]);
});

Deno.test("map should pump returns through itself", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    of([]),
    map((value) => value * 2),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["R"]]);
});

Deno.test("map should handle unsubscribe", () => {
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
    of([1]),
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
  assertEquals(notifications, [["T", error]]);
});
