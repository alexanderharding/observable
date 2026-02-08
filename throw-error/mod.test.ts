import { Observer } from "@observable/core";
import { throwError } from "./mod.ts";
import { assertEquals } from "@std/assert";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { pipe } from "@observable/pipe";

Deno.test(
  "throwError should push an error to the observer immediately upon observation",
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
