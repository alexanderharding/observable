import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { type Observable, Observer } from "@observable/core";
import { empty } from "@observable/empty";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { tap } from "@observable/tap";
import { drop } from "./mod.ts";

Deno.test("drop should throw if no arguments are provided", () => {
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => drop(),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("drop should throw if index is not a number", () => {
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => drop("not a number"),
    TypeError,
    "Parameter 1 is not of type 'Number'",
  );
});

Deno.test("drop should throw if source is not provided", () => {
  const dropOne = drop(1);
  assertThrows(
    () => (dropOne as (source?: unknown) => Observable<number>)(),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test(
  "drop should throw if source is not an Observable (e.g. undefined)",
  () => {
    const dropOne = drop(1);
    assertThrows(
      () => dropOne(undefined as unknown as Observable<number>),
      TypeError,
      "Parameter 1 is not of type 'Observable'",
    );
  },
);

Deno.test(
  "drop should throw if source is not an Observable (invalid object)",
  () => {
    const dropOne = drop(1);
    assertThrows(
      () => dropOne({ subscribe: 1 } as unknown as Observable<number>),
      TypeError,
      "Parameter 1 is not of type 'Observable'",
    );
  },
);

Deno.test(
  "drop should return an empty observable if the count is less than 0",
  () => {
    // Arrange
    const source = forOf([1, 2, 3]);

    // Act
    const result = pipe(source, drop(-1));

    // Assert
    assertStrictEquals(result, empty);
  },
);

Deno.test("drop should return the source observable if the count is 0", () => {
  // Arrange
  const source = forOf([1, 2, 3]);

  // Act
  const result = pipe(source, drop(0));

  // Assert
  assertStrictEquals(result, source);
});

Deno.test(
  "drop should return the source observable if a positive fractional count truncates to 0",
  () => {
    // Arrange
    const source = forOf([1, 2, 3]);

    // Act
    const result = pipe(source, drop(0.8));

    // Assert
    assertStrictEquals(result, source);
  },
);

Deno.test(
  "drop should return the source observable if a negative fractional count truncates to 0",
  () => {
    // Arrange
    const source = forOf([1, 2, 3]);

    // Act
    const result = pipe(source, drop(-0.2));

    // Assert
    assertStrictEquals(result, source);
  },
);

Deno.test("drop should return empty if the count is NaN", () => {
  // Arrange
  const source = forOf([1, 2, 3]);

  // Act
  const result = pipe(source, drop(NaN));

  // Assert
  assertStrictEquals(result, empty);
});

Deno.test("drop should ignore all elements if the count is Infinity", () => {
  // Arrange
  const notifications: Array<["tap", value: number] | ObserverNotification<number>> = [];

  // Act
  pipe(
    forOf([1, 2, 3]),
    tap((value) => notifications.push(["tap", value])),
    drop(Infinity),
    materialize(),
  ).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["tap", 1],
    ["tap", 2],
    ["tap", 3],
    ["return"],
  ]);
});

Deno.test(
  "drop should drop the items if the count is a positive number",
  () => {
    // Arrange
    const source = forOf([1, 2, 3, 4, 5]);
    const notifications: Array<ObserverNotification<number>> = [];
    const materialized = pipe(source, drop(2), materialize());

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ["next", 3],
      ["next", 4],
      ["next", 5],
      ["return"],
    ]);
  },
);

Deno.test(
  "drop should truncate fractional counts toward zero when dropping",
  () => {
    // Arrange
    const source = forOf([1, 2, 3, 4, 5]);
    const notifications: Array<ObserverNotification<number>> = [];
    const materialized = pipe(source, drop(2.7), materialize());

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ["next", 3],
      ["next", 4],
      ["next", 5],
      ["return"],
    ]);
  },
);
