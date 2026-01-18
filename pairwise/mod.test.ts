import { assertEquals, assertThrows } from "@std/assert";
import { flat } from "@observable/flat";
import { Observable, Observer, Subject } from "@observable/core";
import { throwError } from "@observable/throw-error";
import { pipe } from "@observable/pipe";
import { of } from "@observable/of";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { pairwise } from "./mod.ts";

Deno.test("pairwise should emit pairs of consecutive values", () => {
  // Arrange
  const notifications: Array<ObserverNotification<readonly [number, number]>> = [];
  const source = of([1, 2, 3, 4, 5]);
  const materialized = pipe(source, pairwise(), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", [1, 2]],
    ["next", [2, 3]],
    ["next", [3, 4]],
    ["next", [4, 5]],
    ["return"],
  ]);
});

Deno.test("pairwise should not emit if source emits only one value", () => {
  // Arrange
  const notifications: Array<ObserverNotification<readonly [number, number]>> = [];
  const source = of([1]);
  const materialized = pipe(source, pairwise(), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("pairwise should not emit if source is empty", () => {
  // Arrange
  const notifications: Array<ObserverNotification<readonly [number, number]>> = [];
  const source = of<number>([]);
  const materialized = pipe(source, pairwise(), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("pairwise should emit exactly one pair when source emits two values", () => {
  // Arrange
  const notifications: Array<ObserverNotification<readonly [string, string]>> = [];
  const source = of(["a", "b"]);
  const materialized = pipe(source, pairwise(), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["next", ["a", "b"]], ["return"]]);
});

Deno.test("pairwise should pump throws right through itself", () => {
  // Arrange
  const error = new Error("test error");
  const notifications: Array<ObserverNotification<readonly [number, number]>> = [];
  const source = flat([of([1, 2, 3]), throwError(error)]);
  const materialized = pipe(source, pairwise(), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", [1, 2]],
    ["next", [2, 3]],
    ["throw", error],
  ]);
});

Deno.test("pairwise should honor unsubscribe", () => {
  // Arrange
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<readonly [number, number]>> = [];
  const source = flat([of([1, 2, 3, 4, 5]), throwError(new Error("Should not make it here"))]);
  const materialized = pipe(source, pairwise(), materialize());

  // Act
  materialized.subscribe(
    new Observer({
      signal: controller.signal,
      next: (notification) => {
        notifications.push(notification);
        if (notification[0] === "next" && notification[1][1] === 3) {
          controller.abort();
        }
      },
    }),
  );

  // Assert
  assertEquals(notifications, [
    ["next", [1, 2]],
    ["next", [2, 3]],
  ]);
});

Deno.test("pairwise should throw when called with no source", () => {
  // Arrange
  const operator = pairwise();

  // Act / Assert
  assertThrows(
    () => operator(...([] as unknown as Parameters<typeof operator>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("pairwise should throw when source is not an Observable", () => {
  // Arrange
  const operator = pairwise();

  // Act / Assert
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => operator(1 as any),
    TypeError,
    "Parameter 1 is not of type 'Observable'",
  );
});

Deno.test("pairwise should work with Subject", () => {
  // Arrange
  const notifications: Array<ObserverNotification<readonly [number, number]>> = [];
  const source = new Subject<number>();
  const materialized = pipe(source, pairwise(), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next(10);
  source.next(20);
  source.next(30);
  source.return();

  // Assert
  assertEquals(notifications, [
    ["next", [10, 20]],
    ["next", [20, 30]],
    ["return"],
  ]);
});

Deno.test("pairwise should reset state for each subscription", () => {
  // Arrange
  const notifications1: Array<ObserverNotification<readonly [number, number]>> = [];
  const notifications2: Array<ObserverNotification<readonly [number, number]>> = [];
  const source = of([1, 2, 3]);
  const pairwiseSource = pipe(source, pairwise());

  // Act
  pipe(pairwiseSource, materialize()).subscribe(
    new Observer((notification) => notifications1.push(notification)),
  );
  pipe(pairwiseSource, materialize()).subscribe(
    new Observer((notification) => notifications2.push(notification)),
  );

  // Assert
  assertEquals(notifications1, [
    ["next", [1, 2]],
    ["next", [2, 3]],
    ["return"],
  ]);
  assertEquals(notifications2, [
    ["next", [1, 2]],
    ["next", [2, 3]],
    ["return"],
  ]);
});

Deno.test("pairwise should work with different types", () => {
  // Arrange
  const notifications: Array<ObserverNotification<readonly [string, string]>> = [];
  const source = of(["first", "second", "third"]);
  const materialized = pipe(source, pairwise(), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", ["first", "second"]],
    ["next", ["second", "third"]],
    ["return"],
  ]);
});
