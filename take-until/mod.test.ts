import { assertEquals } from "@std/assert";
import { Observable, Observer, Subject } from "@observable/core";
import { noop } from "@observable/internal";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";
import { takeUntil } from "./mod.ts";
import { materialize, type ObserverNotification } from "@observable/materialize";

Deno.test("takeUntil should return when notifier nexts", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = pipe([1, 2, 3, 4, 5], ofIterable());
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
  assertEquals(notifications, [["next", 1], ["next", 2], ["return"]]);
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
  assertEquals(notifications, [["next", 1], ["next", 2], ["return"]]);
});

Deno.test("takeUntil should allow all values if notifier never fires", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = pipe([10, 20, 30], ofIterable());
  const notifier = new Observable<void>(noop);
  const materialized = pipe(source, takeUntil(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 10],
    ["next", 20],
    ["next", 30],
    ["return"],
  ]);
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
    ["next", 1],
    ["throw", error],
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
  assertEquals(notifications, [["throw", error]]);
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
  assertEquals(notifications, [["next", 123]]);
});
