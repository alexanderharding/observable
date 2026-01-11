import { assertEquals } from "@std/assert";
import { Observable, Observer } from "@xan/observable-core";
import { pipe } from "./pipe.ts";
import { dematerialize } from "./dematerialize.ts";
import { materialize } from "./materialize.ts";
import type { ObserverNotification } from "./observer-notification.ts";

Deno.test(
  "dematerialize should convert a source Observable of ObserverNotification objects into a source Observable of the original values",
  () => {
    // Arrange
    const source = new Observable<ObserverNotification<number>>((observer) => {
      for (const value of [1, 2, 3]) {
        observer.next(["next", value]);
        if (observer.signal.aborted) return;
      }
      observer.return();
    });
    const notifications: Array<ObserverNotification<number>> = [];
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

Deno.test("dematerialize should honor unsubscribe", () => {
  // Arrange
  const controller = new AbortController();
  const source = new Observable<ObserverNotification<number>>((observer) => {
    for (const value of [1, 2, 3]) {
      observer.next(["next", value]);
      if (observer.signal.aborted) return;
    }
    observer.next(["return"]);
    observer.return();
  });

  const notifications: Array<ObserverNotification<number>> = [];
  const materialized = pipe(source, dematerialize(), materialize());

  // Act
  materialized.subscribe(
    new Observer({
      signal: controller.signal,
      next: (notification) => {
        notifications.push(notification);
        if (notifications.length === 2) controller.abort();
      },
    }),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
  ]);
});
