import { assertEquals, assertThrows } from "@std/assert";
import { type Observable, Observer } from "@observable/core";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { filter } from "./mod.ts";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { flat } from "@observable/flat";
import { throwError } from "@observable/throw-error";
import { tap } from "@observable/tap";

Deno.test("filter should throw if no arguments are provided", () => {
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => filter(),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("filter should throw if project is not a function", () => {
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => filter("not a function"),
    TypeError,
    "Parameter 1 is not of type 'Function'",
  );
});

Deno.test("filter should throw if source is not provided", () => {
  const filterFn = filter(() => true);
  assertThrows(
    () => (filterFn as (source?: unknown) => Observable<number>)(),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test(
  "filter should throw if source is not an Observable (e.g. undefined)",
  () => {
    const filterFn = filter(() => true);
    assertThrows(
      () => filterFn(undefined as unknown as Observable<number>),
      TypeError,
      "Parameter 1 is not of type 'Observable'",
    );
  },
);

Deno.test(
  "filter should throw if source is not an Observable (invalid object)",
  () => {
    const filterFn = filter(() => true);
    assertThrows(
      () => filterFn({ subscribe: 1 } as unknown as Observable<number>),
      TypeError,
      "Parameter 1 is not of type 'Observable'",
    );
  },
);

Deno.test(
  "filter should filter the items emitted by the source observable",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const source = forOf([1, 2, 3, 4, 5]);
    const materialized = pipe(
      source,
      filter((value) => value % 2 === 0),
      materialize(),
    );

    // Act
    materialized.subscribe(new Observer((notification) => notifications.push(notification)));

    // Assert
    assertEquals(notifications, [["next", 2], ["next", 4], ["return"]]);
  },
);

Deno.test(
  "filter should drop all values and return when the predicate never matches",
  () => {
    // Arrange
    const notifications: Array<["tap", value: number] | ObserverNotification<number>> = [];

    // Act
    pipe(
      forOf([1, 2, 3]),
      tap((value) => notifications.push(["tap", value])),
      filter(() => false),
      materialize(),
    ).subscribe(new Observer((notification) => notifications.push(notification)));

    // Assert
    assertEquals(notifications, [
      ["tap", 1],
      ["tap", 2],
      ["tap", 3],
      ["return"],
    ]);
  },
);

Deno.test("filter should pump throws right through itself", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const error = new Error("test");
  const materialized = pipe(
    flat([forOf([1, 2, 3]), throwError(error)]),
    filter((value) => value % 2 === 0),
    materialize(),
  );

  // Act
  materialized.subscribe(new Observer((notification) => notifications.push(notification)));

  // Assert
  assertEquals(notifications, [
    ["next", 2],
    ["throw", error],
  ]);
});

Deno.test("filter should honor unsubscribe", () => {
  // Arrange
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<number>> = [];
  const source = flat([forOf([1, 2, 3, 4]), throwError(new Error("Should not make it here"))]);
  const materialized = pipe(source, filter((value) => value % 2 === 0), materialize());

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

  // Assert
  assertEquals(notifications, [["next", 2]]);
});
