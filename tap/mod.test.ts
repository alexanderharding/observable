import { assertEquals, assertThrows } from "@std/assert";
import { Observer } from "@observable/core";
import { forOf } from "@observable/for-of";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";
import { throwError } from "@observable/throw-error";
import { tap } from "./mod.ts";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { ParameterTypeError } from "@observable/internal";
import { empty } from "@observable/empty";
import { never } from "@observable/never";
import { finalize } from "@observable/finalize";

Deno.test("tap should throw if no arguments are provided", () => {
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => tap(),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("tap should throw if callback is not a function", () => {
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => tap("not a function"),
    ParameterTypeError,
  );
});

Deno.test("tap should throw if no arguments are provided", () => {
  const operatorFn = tap(() => {});
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => operatorFn(),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("tap should throw if source is not an Observable", () => {
  const operatorFn = tap(() => {});
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => operatorFn("not an observable"),
    ParameterTypeError,
  );
});

Deno.test("tap should perform side-effects for each value", () => {
  // Arrange
  const sideEffects: Array<[number, number]> = [];
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    forOf([1, 2, 3]),
    tap((value, index) => sideEffects.push([value, index])),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(sideEffects, [
    [1, 0],
    [2, 1],
    [3, 2],
  ]);
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["return"],
  ]);
});

Deno.test("tap should pass values through unchanged", () => {
  // Arrange
  const notifications: Array<ObserverNotification<string>> = [];
  const observable = pipe(
    forOf(["a", "b", "c"]),
    tap(() => {}),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", "a"],
    ["next", "b"],
    ["next", "c"],
    ["return"],
  ]);
});

Deno.test("tap should pump throws through itself", () => {
  // Arrange
  const error = new Error("test");
  const sideEffects: Array<number> = [];
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    throwError(error),
    tap((value) => sideEffects.push(value)),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(sideEffects, []);
  assertEquals(notifications, [["throw", error]]);
});

Deno.test("tap should pump returns through itself", () => {
  // Arrange
  const sideEffects: Array<number> = [];
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    empty,
    tap((value) => sideEffects.push(value)),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(sideEffects, []);
  assertEquals(notifications, [["return"]]);
});

Deno.test("tap should handle unsubscribe", () => {
  // Arrange
  let sourceAborted = false;
  const controller = new AbortController();
  const source = pipe(never, finalize(() => (sourceAborted = true)));
  const observable = pipe(source, tap(() => {}));

  // Act
  observable.subscribe(new Observer({ signal: controller.signal }));
  controller.abort();

  // Assert
  assertEquals(sourceAborted, true);
});

Deno.test("tap should throw if the callback throws", () => {
  // Arrange
  const error = new Error("test");
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    forOf([1, 2, 3]),
    tap(() => {
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

Deno.test("tap callback error should be delivered as throw notification without return", () => {
  // Arrange
  const error = new Error("callback error");
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    of(1),
    tap(() => {
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

Deno.test("tap callback throwing on later value should stop processing", () => {
  // Arrange
  const error = new Error("callback error on value 2");
  const sideEffects: Array<number> = [];
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    forOf([1, 2, 3]),
    tap((value) => {
      sideEffects.push(value);
      if (value === 2) throw error;
    }),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(sideEffects, [1, 2]);
  assertEquals(notifications, [["next", 1], ["throw", error]]);
});

Deno.test("tap should execute side-effect before downstream receives value", () => {
  // Arrange
  const order: Array<string> = [];
  const observable = pipe(
    of(1),
    tap(() => order.push("tap")),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => order.push(notification[0])),
  );

  // Assert
  assertEquals(order, ["tap", "next", "return"]);
});
