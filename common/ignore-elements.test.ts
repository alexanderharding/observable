import { assertEquals } from "@std/assert";
import { Observable, Observer, Subject } from "@xan/observable-core";
import { pipe } from "./pipe.ts";
import { of } from "./of.ts";
import { materialize } from "./materialize.ts";
import type { ObserverNotification } from "./observer-notification.ts";
import { ignoreElements } from "./ignore-elements.ts";

Deno.test(
  "ignoreElements should ignore all next values but pass return",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const source = of([1, 2, 3]);
    const materialized = pipe(source, ignoreElements(), materialize());

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert: should only get a "return" notification
    assertEquals(notifications, [["R"]]);
  },
);

Deno.test("ignoreElements should pump throws right through itself", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const error = new Error("thrown!");
  const errored = new Observable<number>((observer) => {
    observer.next(42);
    observer.throw(error);
  });
  const materialized = pipe(errored, ignoreElements(), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert: next values are ignored, threw value is propagated
  assertEquals(notifications, [["T", error]]);
});

Deno.test("ignoreElements should honor unsubscribe", () => {
  // Arrange
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Subject<number>();
  const materialized = pipe(source, ignoreElements(), materialize());

  // Act
  materialized.subscribe(new Observer({ signal: controller.signal }));
  controller.abort();
  source.return();

  // Assert
  assertEquals(notifications, []);
});
