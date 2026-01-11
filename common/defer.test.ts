import { assertEquals } from "@std/assert";
import { Observable, Observer } from "@xan/observable-core";
import { dematerialize } from "./dematerialize.ts";
import { materialize } from "./materialize.ts";
import type { ObserverNotification } from "./observer-notification.ts";
import { pipe } from "./pipe.ts";
import { defer } from "./defer.ts";

Deno.test(
  "defer should create an Observable that calls a factory to make an Observable for each new Observer",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const source = defer<ObserverNotification<number>>(
      () =>
        new Observable<ObserverNotification<number>>((observer) => {
          for (const value of [1, 2, 3]) {
            observer.next(["next", value]);
            if (observer.signal.aborted) return;
          }
          observer.return();
        }),
    );
    const materialized = pipe(source, dematerialize(), materialize());

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
  },
);

Deno.test("defer should throw an error if the factory throws an error", () => {
  // Arrange
  const error = new Error(Math.random().toString());
  const notifications: Array<ObserverNotification> = [];
  const source = defer(() => {
    throw error;
  });
  const materialized = pipe(source, materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", error]]);
});
