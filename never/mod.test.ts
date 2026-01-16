import { assertEquals } from "@std/assert";
import { Observer } from "@observable/core";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { never } from "./mod.ts";
import { pipe } from "@observable/pipe";

Deno.test(
  "never should not emit when subscribed to with an aborted signal",
  () => {
    // Arrange
    const controller = new AbortController();
    controller.abort();
    const notifications: Array<ObserverNotification> = [];
    const materialized = pipe(never, materialize());

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, []);
  },
);

Deno.test(
  "never should not emit when subscribed to with a non-aborted signal",
  () => {
    // Arrange
    const controller = new AbortController();
    const notifications: Array<ObserverNotification> = [];
    const materialized = pipe(never, materialize());

    // Act
    materialized.subscribe(
      new Observer({
        signal: controller.signal,
        next: (notification) => notifications.push(notification),
      }),
    );

    // Assert
    assertEquals(notifications, []);
  },
);
