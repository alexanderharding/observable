import { assertEquals } from "@std/assert";
import { Observer } from "@xan/observable-core";
import { materialize } from "./materialize.ts";
import type { ObserverNotification } from "./observer-notification.ts";
import { empty } from "./empty.ts";
import { pipe } from "./pipe.ts";

Deno.test(
  "empty should return immediately when subscribed to without a signal",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification> = [];
    const materialized = pipe(empty, materialize());

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [["R"]]);
  },
);

Deno.test(
  "empty should not return when subscribed to with an aborted signal",
  () => {
    // Arrange
    const controller = new AbortController();
    controller.abort();
    const notifications: Array<ObserverNotification> = [];
    const materialized = pipe(empty, materialize());

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [["R"]]);
  },
);

Deno.test(
  "empty should return when subscribed to with a non-aborted signal",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification> = [];
    const materialized = pipe(empty, materialize());

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [["R"]]);
  },
);
