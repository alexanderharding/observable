import { assertEquals } from "@std/assert";
import { Observable, Observer, Subject } from "@xan/observable-core";
import { noop } from "@xan/observable-internal";
import { of } from "./of.ts";
import { pipe } from "./pipe.ts";
import { takeUntil } from "./take-until.ts";
import { materialize } from "./materialize.ts";
import type { ObserverNotification } from "./observer-notification.ts";

Deno.test("takeUntil should complete when notifier nexts", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = of([1, 2, 3, 4, 5]);
  const notifier = new Subject<void>();
  const materialized = pipe(source, takeUntil(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => {
      notifications.push(notification);
      if (notification[1] === 2) notifier.next();
    }),
  );

  // Assert
  assertEquals(notifications, [["N", 1], ["N", 2], ["R"]]);
});

Deno.test("takeUntil should let values through until notifier nexts", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Subject<number>();
  const notifier = new Subject<void>();
  const materialized = pipe(source, takeUntil(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next(1);
  source.next(2);
  notifier.next(); // trigger completion
  source.next(3);
  source.return();

  // Assert
  assertEquals(notifications, [["N", 1], ["N", 2], ["R"]]);
});

Deno.test("takeUntil should allow all values if notifier never fires", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = of([10, 20, 30]);
  const notifier = new Observable<void>(noop);
  const materialized = pipe(source, takeUntil(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["N", 10], ["N", 20], ["N", 30], ["R"]]);
});

Deno.test("takeUntil should propagate throws from source", () => {
  // Arrange
  const error = new Error("source error");
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Observable<number>((observer) => {
    observer.next(1);
    observer.throw(error);
  });
  const notifier = new Subject<void>();
  const materialized = pipe(source, takeUntil(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["N", 1],
    ["T", error],
  ]);
});

Deno.test("takeUntil should propagate throws from notifier", () => {
  // Arrange
  const error = new Error("notifier error");
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Subject<number>();
  const notifier = new Subject<void>();
  const materialized = pipe(source, takeUntil(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  notifier.throw(error);

  // Assert
  assertEquals(notifications, [["T", error]]);
});

Deno.test("takeUntil should honor unsubscribe", () => {
  // Arrange
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Subject<number>();
  const notifier = new Subject<void>();
  const materialized = pipe(source, takeUntil(notifier), materialize());

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
  source.next(123);
  notifier.next();
  source.return();

  // Assert
  assertEquals(notifications, [["N", 123]]);
});
