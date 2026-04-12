import { Observer } from "@observable/core";
import { throwError } from "./mod.ts";
import { assertEquals, assertThrows } from "@std/assert";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { pipe } from "@observable/pipe";

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

Deno.test("throwError should throw a TypeError if called with no arguments", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => throwError(...([] as unknown as Parameters<typeof throwError>)),
    TypeError,
    "1 argument required but 0 present",
  );
});
