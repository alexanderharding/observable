import { assertEquals } from "@std/assert";
import { Observable, Observer } from "@observable/core";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { pipe } from "@observable/pipe";
import { finalize } from "./mod.ts";
import { never } from "@observable/never";

Deno.test(
  "finalize should call the finalizer function after the source is returned",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number> | [type: "F"]> = [];
    const values = [1, 2, 3] as const;
    const observable = pipe(
      new Observable<number>((observer) => {
        for (const value of values) {
          observer.next(value);
          if (observer.signal.aborted) return;
        }
        observer.return();
      }),
      materialize(),
      finalize(() => notifications.push(["F"])),
    );

    // Act
    observable.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ...values.map((value) => ["next", value] as const),
      ["return"],
      ["F"],
    ]);
  },
);

Deno.test(
  "finalize should call the finalizer function after the source is thrown",
  () => {
    // Arrange
    const error = new Error("test");
    const notifications: Array<ObserverNotification<number> | [type: "F"]> = [];
    const values = [1, 2, 3] as const;
    const observable = pipe(
      new Observable<number>((observer) => {
        for (const value of values) observer.next(value);
        observer.throw(error);
      }),
      materialize(),
      finalize(() => notifications.push(["F"])),
    );

    // Act
    observable.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ...values.map((value) => ["next", value] as const),
      ["throw", error],
      ["F"],
    ]);
  },
);

Deno.test(
  "finalize should call the finalizer function after the source is unsubscribed",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number> | [type: "F"]> = [];
    const controller = new AbortController();
    const observable = pipe(
      never,
      materialize(),
      finalize(() => notifications.push(["F"])),
    );

    // Act
    observable.subscribe(
      new Observer({
        next: (notification) => notifications.push(notification),
        signal: controller.signal,
      }),
    );
    controller.abort();

    // Assert
    assertEquals(notifications, [["F"]]);
  },
);
