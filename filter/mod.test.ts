import { assertEquals } from "@std/assert";
import { Observable, Observer } from "@observable/core";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";
import { filter } from "./mod.ts";
import { materialize, type ObserverNotification } from "@observable/materialize";

Deno.test(
  "filter should filter the items emitted by the source observable",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const source = pipe([1, 2, 3, 4, 5], ofIterable());
    const materialized = pipe(
      source,
      filter((value) => value % 2 === 0),
      materialize(),
    );

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [["next", 2], ["next", 4], ["return"]]);
  },
);

Deno.test("filter should pump throws right through itself", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const error = new Error("test");
  const materialized = pipe(
    new Observable<number>((observer) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.throw(error);
    }),
    filter((value) => value % 2 === 0),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 2],
    ["throw", error],
  ]);
});

Deno.test("filter should honor abort", () => {
  // Arrange
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Observable<number>((observer) => {
    for (const value of [1, 2, 3, 4]) {
      observer.next(value);
      if (observer.signal.aborted) return;
    }
    observer.throw(new Error("Should not make it here"));
  });
  const materialized = pipe(
    source,
    filter((value) => value % 2 === 0),
    materialize(),
  );

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

  // Assert
  assertEquals(notifications, [["next", 2]]);
});
