import { assertEquals } from "@std/assert";
import { type Observable, Observer } from "@observable/core";
import { sequence } from "@observable/sequence";
import { pipe } from "@observable/pipe";
import { filter } from "./mod.ts";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { throwError } from "@observable/throw-error";
import { flat } from "@observable/flat";

Deno.test(
  "filter should filter the items emitted by the source observable",
  () => {
    // Arrange
    const materialized = pipe(
      sequence([1, 2, 3, 4, 5]),
      filter((value) => value % 2 === 0),
      materialize(),
    );
    const notifications: Array<
      ObserverNotification<
        typeof materialized extends Observable<ObserverNotification<infer Value>> ? Value
          : never
      >
    > = [];

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
  const error = new Error("test");
  const materialized = pipe(
    flat([sequence([1, 2, 3]), throwError(error)]),
    filter((value) => value % 2 === 0),
    materialize(),
  );
  const notifications: Array<
    ObserverNotification<
      typeof materialized extends Observable<ObserverNotification<infer Value>> ? Value
        : never
    >
  > = [];

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

Deno.test("filter should honor unsubscribe", () => {
  // Arrange
  const controller = new AbortController();
  const observable = pipe(
    flat([sequence([1, 2, 3]), throwError(new Error("Should not make it here"))]),
    filter((value) => value % 2 === 0),
    materialize(),
  );
  const notifications: Array<
    ObserverNotification<
      typeof observable extends Observable<ObserverNotification<infer Value>> ? Value
        : never
    >
  > = [];

  // Act
  observable.subscribe(
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
