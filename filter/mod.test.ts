import { assertEquals } from "@std/assert";
import { Observer } from "@observable/core";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { filter } from "./mod.ts";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { flat } from "@observable/flat";
import { throwError } from "@observable/throw-error";

Deno.test(
  "filter should filter the items emitted by the source observable",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const source = forOf([1, 2, 3, 4, 5]);
    const materialized = pipe(
      source,
      filter((value) => value % 2 === 0),
      materialize(),
    );

    // Act
    materialized.subscribe(new Observer((notification) => notifications.push(notification)));

    // Assert
    assertEquals(notifications, [["next", 2], ["next", 4], ["return"]]);
  },
);

Deno.test("filter should pump throws right through itself", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const error = new Error("test");
  const materialized = pipe(
    flat([forOf([1, 2, 3]), throwError(error)]),
    filter((value) => value % 2 === 0),
    materialize(),
  );

  // Act
  materialized.subscribe(new Observer((notification) => notifications.push(notification)));

  // Assert
  assertEquals(notifications, [
    ["next", 2],
    ["throw", error],
  ]);
});

Deno.test("filter should honor unsubscribe", () => {
  // Arrange
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<number>> = [];
  const source = flat([forOf([1, 2, 3, 4]), throwError(new Error("Should not make it here"))]);
  const materialized = pipe(source, filter((value) => value % 2 === 0), materialize());

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
