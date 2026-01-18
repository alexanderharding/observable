import { assertEquals } from "@std/assert";
import { Observer } from "@observable/core";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { pipe } from "@observable/pipe";
import { finalize } from "./mod.ts";
import { flat } from "@observable/flat";
import { of } from "@observable/of";
import { throwError } from "@observable/throw-error";

Deno.test(
  "finalize should call the finalizer function after the source is returned",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number> | [type: "finalize"]> = [];
    const values = [1, 2, 3] as const;
    const observable = pipe(
      of(values),
      finalize(() => notifications.push(["finalize"])),
      materialize(),
    );

    // Act
    observable.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ...values.map((value) => ["next", value] as const),
      ["finalize"],
      ["return"],
    ]);
  },
);

Deno.test(
  "finalize should call the finalizer function after the source is thrown",
  () => {
    // Arrange
    const error = new Error("test");
    const notifications: Array<ObserverNotification<number> | [type: "finalize"]> = [];
    const values = [1, 2, 3] as const;
    const observable = pipe(
      flat([of(values), throwError(error)]),
      finalize(() => notifications.push(["finalize"])),
      materialize(),
    );

    // Act
    observable.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ...values.map((value) => ["next", value] as const),
      ["finalize"],
      ["throw", error],
    ]);
  },
);

Deno.test(
  "finalize should call the finalizer function after the source is unsubscribed",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number> | [type: "finalize"]> = [];
    const controller = new AbortController();
    const observable = pipe(
      of([1, 2, 3]),
      finalize(() => notifications.push(["finalize"])),
      materialize(),
    );

    // Act
    observable.subscribe(
      new Observer({
        signal: controller.signal,
        next: (notification) => {
          notifications.push(notification);
          if (notification[0] === "next" && notification[1] === 2) {
            controller.abort();
          }
        },
      }),
    );

    // Assert
    assertEquals(notifications, [["next", 1], ["next", 2], ["finalize"]]);
  },
);
