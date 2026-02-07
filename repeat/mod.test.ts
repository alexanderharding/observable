import { assertEquals, assertThrows } from "@std/assert";
import { Observer, Subject } from "@observable/core";
import { pipe } from "@observable/pipe";
import { ofIterable } from "@observable/of-iterable";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { repeat } from "./mod.ts";
import { take } from "@observable/take";
import { defer } from "@observable/defer";
import { empty } from "@observable/empty";
import { throwError } from "@observable/throw-error";
import { flat } from "@observable/flat";

Deno.test("repeat should repeat source when notifier emits", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = pipe([1, 2, 3], ofIterable());
  let repeatCount = 0;
  const notifier = defer(() => ++repeatCount >= 3 ? empty : pipe([undefined], ofIterable()));
  const materialized = pipe(source, repeat(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["return"],
  ]);
});

Deno.test("repeat should return when notifier returns before emitting", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = pipe([1, 2, 3], ofIterable());
  const notifier = empty;
  const materialized = pipe(source, repeat(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["return"],
  ]);
});

Deno.test("repeat should propagate throws from source", () => {
  // Arrange
  const error = new Error("source error");
  const notifications: Array<ObserverNotification<number>> = [];
  const source = flat([pipe([1], ofIterable()), throwError(error)]);
  const notifier = pipe([undefined], ofIterable());
  const materialized = pipe(source, repeat(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["next", 1], ["throw", error]]);
});

Deno.test("repeat should propagate throws from notifier", () => {
  // Arrange
  const error = new Error("notifier error");
  const notifications: Array<ObserverNotification<number>> = [];
  const source = pipe([1, 2, 3], ofIterable());
  const notifier = throwError(error);
  const materialized = pipe(source, repeat(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["throw", error],
  ]);
});

Deno.test("repeat should work with Subject as notifier", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = pipe([1, 2], ofIterable());
  const notifier = new Subject<void>();
  const materialized = pipe(source, repeat(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  notifier.next();
  notifier.return();

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 1],
    ["next", 2],
    ["return"],
  ]);
});

Deno.test("repeat should honor unsubscribe during source", () => {
  // Arrange
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<number>> = [];
  const source = pipe([1, 2, 3, 4, 5], ofIterable());
  const notifier = pipe([undefined], ofIterable());
  const materialized = pipe(source, repeat(notifier), materialize());

  // Act
  materialized.subscribe(
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
  assertEquals(notifications, [["next", 1], ["next", 2]]);
});

Deno.test("repeat should honor unsubscribe during notifier", () => {
  // Arrange
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<number>> = [];
  const source = pipe([1], ofIterable());
  const notifier = new Subject<void>();
  const materialized = pipe(source, repeat(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer({
      signal: controller.signal,
      next: (notification) => {
        notifications.push(notification);
      },
      return: () => notifications.push(["return"]),
    }),
  );
  controller.abort();
  notifier.next();

  // Assert
  assertEquals(notifications, [["next", 1]]);
});

Deno.test("repeat should throw when notifier is not an Observable", () => {
  // Arrange / Act / Assert
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => repeat(1 as any),
    TypeError,
    "Parameter 1 is not of type 'Observable'",
  );
});

Deno.test("repeat should throw when called with no source", () => {
  // Arrange
  const operator = repeat(pipe([undefined], ofIterable()));

  // Act / Assert
  assertThrows(
    () => operator(...([] as unknown as Parameters<typeof operator>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("repeat should throw when source is not an Observable", () => {
  // Arrange
  const operator = repeat(pipe([undefined], ofIterable()));

  // Act / Assert
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => operator(1 as any),
    TypeError,
    "Parameter 1 is not of type 'Observable'",
  );
});

Deno.test("repeat should only use first emission from notifier per repeat cycle", () => {
  // Arrange
  let notifierEmissions = 0;
  const notifications: Array<ObserverNotification<number>> = [];
  const source = pipe([1], ofIterable());
  const notifier = defer(() => {
    notifierEmissions++;
    return pipe([undefined, undefined, undefined], ofIterable());
  });
  let repeatCount = 0;
  const limitedNotifier = defer(() => ++repeatCount >= 3 ? empty : notifier);
  const materialized = pipe(source, repeat(limitedNotifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 1],
    ["next", 1],
    ["return"],
  ]);
  assertEquals(notifierEmissions, 2);
});

Deno.test("repeat should work with defer notifier for controlled repetition", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const notifierSubscriptions: number[] = [];
  const source = pipe([1, 2, 3], ofIterable());
  const repeated = defer(() => {
    let count = 0;
    return pipe(
      source,
      repeat(
        defer(() => {
          notifierSubscriptions.push(++count);
          return count === 2 ? empty : pipe([undefined], ofIterable());
        }),
      ),
    );
  });
  const materialized = pipe(repeated, materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["return"],
  ]);
  assertEquals(notifierSubscriptions, [1, 2]);
});

Deno.test("repeat should pass through return for empty source", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = pipe([], ofIterable<number>());
  const notifier = empty;
  const materialized = pipe(source, repeat(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("repeat should resubscribe to source on each repeat", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  let subscriptionCount = 0;
  const source = defer(() => {
    subscriptionCount++;
    return pipe([subscriptionCount * 10 + 1, subscriptionCount * 10 + 2], ofIterable());
  });
  let repeatCount = 0;
  const notifier = defer(() => ++repeatCount >= 2 ? empty : pipe([undefined], ofIterable()));
  const materialized = pipe(source, repeat(notifier), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 11],
    ["next", 12],
    ["next", 21],
    ["next", 22],
    ["return"],
  ]);
  assertEquals(subscriptionCount, 2);
});
