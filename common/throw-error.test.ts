import { Observer } from "@xan/observable-core";
import { throwError } from "./throw-error.ts";
import { assertEquals } from "@std/assert";
import { materialize } from "./materialize.ts";
import type { ObserverNotification } from "./observer-notification.ts";
import { pipe } from "./pipe.ts";

Deno.test(
  "throwError should push an error to the observer immediately upon subscription",
  () => {
    // Arrange
    const error = new Error(Math.random().toString());
    const notifications: Array<ObserverNotification<unknown>> = [];
    const observable = pipe(throwError(error), materialize());

    // Act
    observable.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [["throw", error]]);
  },
);
