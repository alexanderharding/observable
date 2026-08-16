import { assertEquals, assertThrows } from "@std/assert";
import { type Observable, Observer } from "@observable/core";
import { forOf } from "@observable/for-of";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";
import { throwError } from "@observable/throw-error";
import { map } from "./mod.ts";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { empty } from "@observable/empty";
import { finalize } from "@observable/finalize";
import { never } from "@observable/never";

Deno.test("map should throw if no arguments are provided", () => {
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => map(),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("map should throw if project is not a function", () => {
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => map("not a function"),
    TypeError,
    "Parameter 1 is not of type 'Function'",
  );
});

Deno.test("map should throw if source is not provided", () => {
  const mapFn = map(() => true);
  assertThrows(
    () => (mapFn as (source?: unknown) => Observable<boolean>)(),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test(
  "map should throw if source is not an Observable (e.g. undefined)",
  () => {
    const mapFn = map(() => true);
    assertThrows(
      () => mapFn(undefined as unknown as Observable<number>),
      TypeError,
      "Parameter 1 is not of type 'Observable'",
    );
  },
);

Deno.test(
  "map should throw if source is not an Observable (invalid object)",
  () => {
    const mapFn = map(() => true);
    assertThrows(
      () => mapFn({ subscribe: 1 } as unknown as Observable<number>),
      TypeError,
      "Parameter 1 is not of type 'Observable'",
    );
  },
);

Deno.test("map should project the values", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const indices: Array<number> = [];
  const observable = pipe(
    forOf([1, 2, 3]),
    map((value, index) => {
      indices.push(index);
      return value * 2;
    }),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 2],
    ["next", 4],
    ["next", 6],
    ["return"],
  ]);
  assertEquals(indices, [0, 1, 2]);
});

Deno.test("map should pump throws through itself", () => {
  // Arrange
  const error = new Error("test");
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    throwError(error),
    map((value) => value * 2),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", error]]);
});

Deno.test("map should pump returns through itself", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    empty,
    map((value) => value * 2),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("map should handle unsubscribe", () => {
  // Arrange
  let sourceAborted = false;
  const controller = new AbortController();
  const source = pipe(never, finalize(() => (sourceAborted = true)));
  const doubled = pipe(source, map((value) => value * 2));

  // Act
  doubled.subscribe(new Observer({ signal: controller.signal }));
  controller.abort();

  // Assert
  assertEquals(sourceAborted, true);
});

Deno.test("map should throw if the project function throws", () => {
  // Arrange
  const error = new Error("test");
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    of(1),
    map(() => {
      throw error;
    }),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", error]]);
});
