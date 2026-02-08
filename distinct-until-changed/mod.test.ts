import { assertEquals, assertThrows } from "@std/assert";
import { Observer, Subject } from "@observable/core";
import { pipe } from "@observable/pipe";
import { ofIterable } from "@observable/of-iterable";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { distinctUntilChanged } from "./mod.ts";
import { flat } from "@observable/flat";
import { throwError } from "@observable/throw-error";

Deno.test(
  "distinctUntilChanged should filter out consecutive duplicate values",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const source = pipe([1, 1, 1, 2, 2, 3, 3, 3, 1, 1], ofIterable());
    const materialized = pipe(source, distinctUntilChanged(), materialize());

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
      ["return"],
    ]);
  },
);

Deno.test(
  "distinctUntilChanged should emit all values when none are consecutive duplicates",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const source = pipe([1, 2, 3, 4, 5], ofIterable());
    const materialized = pipe(source, distinctUntilChanged(), materialize());

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ["next", 1],
      ["next", 2],
      ["next", 3],
      ["next", 4],
      ["next", 5],
      ["return"],
    ]);
  },
);

Deno.test(
  "distinctUntilChanged should emit only first value when all values are the same",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const source = pipe([5, 5, 5, 5, 5], ofIterable());
    const materialized = pipe(source, distinctUntilChanged(), materialize());

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [["next", 5], ["return"]]);
  },
);

Deno.test("distinctUntilChanged should handle empty source", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = pipe([], ofIterable<number>());
  const materialized = pipe(source, distinctUntilChanged(), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("distinctUntilChanged should pump throws right through itself", () => {
  // Arrange
  const error = new Error("test error");
  const notifications: Array<ObserverNotification<number>> = [];
  const source = flat([pipe([1, 1, 2], ofIterable()), throwError(error)]);
  const materialized = pipe(source, distinctUntilChanged(), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["throw", error],
  ]);
});

Deno.test("distinctUntilChanged should honor abort", () => {
  // Arrange
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<number>> = [];
  const source = flat([
    pipe([1, 2, 2, 3, 3, 3], ofIterable()),
    throwError(new Error("Should not make it here")),
  ]);
  const materialized = pipe(source, distinctUntilChanged(), materialize());

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

Deno.test(
  "distinctUntilChanged should use custom comparator when provided",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<{ id: number }>> = [];
    const source = pipe([
      { id: 1 },
      { id: 1 },
      { id: 2 },
      { id: 2 },
      { id: 3 },
    ], ofIterable());
    const comparator = (a: { id: number }, b: { id: number }) => a.id === b.id;
    const materialized = pipe(
      source,
      distinctUntilChanged(comparator),
      materialize(),
    );

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ["next", { id: 1 }],
      ["next", { id: 2 }],
      ["next", { id: 3 }],
      ["return"],
    ]);
  },
);

Deno.test(
  "distinctUntilChanged should use Object.is by default",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const source = pipe([NaN, NaN, 1, 1], ofIterable());
    const materialized = pipe(source, distinctUntilChanged(), materialize());

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ["next", NaN],
      ["next", 1],
      ["return"],
    ]);
  },
);

Deno.test(
  "distinctUntilChanged should throw when comparator is not a function",
  () => {
    // Arrange / Act / Assert
    assertThrows(
      // deno-lint-ignore no-explicit-any
      () => distinctUntilChanged(1 as any),
      TypeError,
      "Parameter 1 is not of type 'Function'",
    );
  },
);

Deno.test(
  "distinctUntilChanged should throw when called with no source",
  () => {
    // Arrange
    const operator = distinctUntilChanged();

    // Act / Assert
    assertThrows(
      () => operator(...([] as unknown as Parameters<typeof operator>)),
      TypeError,
      "1 argument required but 0 present",
    );
  },
);

Deno.test(
  "distinctUntilChanged should throw when source is not an Observable",
  () => {
    // Arrange
    const operator = distinctUntilChanged();

    // Act / Assert
    assertThrows(
      // deno-lint-ignore no-explicit-any
      () => operator(1 as any),
      TypeError,
      "Parameter 1 is not of type 'Observable'",
    );
  },
);

Deno.test("distinctUntilChanged should work with Subject", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Subject<number>();
  const materialized = pipe(source, distinctUntilChanged(), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next(1);
  source.next(1);
  source.next(2);
  source.next(2);
  source.next(1);
  source.return();

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 1],
    ["return"],
  ]);
});
