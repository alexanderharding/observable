import { assertEquals, assertStrictEquals } from "@std/assert";
import { Observable, Observer, Subject } from "@observable/core";
import { noop } from "@observable/internal";
import { empty } from "@observable/empty";
import { never } from "@observable/never";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { take } from "./mod.ts";
import { finalize } from "@observable/finalize";

Deno.test(
  "take should return an empty observable if the count is equal to 0",
  () => {
    // Arrange
    const source = never;

    // Act
    const result = pipe(source, take(0));

    // Assert
    assertStrictEquals(result, empty);
  },
);

Deno.test(
  "take should return an empty observable if the count is less than 0",
  () => {
    // Arrange
    const source = never;

    // Act
    const result = pipe(source, take(-1));

    // Assert
    assertStrictEquals(result, empty);
  },
);

Deno.test(
  "take should return the source observable if the count is Infinity",
  () => {
    // Arrange
    const source = new Observable(noop);

    // Act
    const result = pipe(source, take(Infinity));

    // Assert
    assertStrictEquals(result, source);
  },
);

Deno.test("take should return empty observable if the count is NaN", () => {
  // Arrange
  const source = new Observable(noop);

  // Act
  const result = pipe(source, take(NaN));

  // Assert
  assertStrictEquals(result, empty);
});

Deno.test(
  "take should terminate the source observable at the given count if the count is a positive finite number",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const source = of([1, 2, 3]);
    const materialized = pipe(source, take(2), materialize());

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [["next", 1], ["next", 2], ["return"]]);
  },
);

Deno.test("take should handle reentrant subscribers", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number> | [type: "finalize"]> = [];
  const source = new Subject<number>();
  const materialized = pipe(
    source,
    finalize(() => notifications.push(["finalize"])),
    take(2),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => {
      notifications.push(notification);
      if (notification[0] === "next" && notification[1] === 2) source.next(3);
    }),
  );
  source.next(1);
  source.next(2);
  source.return();

  // Assert
  assertEquals(notifications, [["next", 1], ["finalize"], ["next", 2], ["return"]]);
});
