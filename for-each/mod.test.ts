import { assertEquals, assertThrows } from "@std/assert";
import { Observable, Observer } from "@observable/core";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";
import { throwError } from "@observable/throw-error";
import { forEach } from "./mod.ts";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { MinimumArgumentsRequiredError, noop, ParameterTypeError } from "@observable/internal";

Deno.test("forEach should throw if no arguments are provided", () => {
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => forEach(),
    MinimumArgumentsRequiredError,
  );
});

Deno.test("forEach should throw if next is not a function", () => {
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => forEach("not a function"),
    ParameterTypeError,
  );
});

Deno.test("forEach operator function should throw if no arguments are provided", () => {
  const operatorFn = forEach(noop);
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => operatorFn(),
    MinimumArgumentsRequiredError,
  );
});

Deno.test("forEach operator function should throw if source is not an Observable", () => {
  const operatorFn = forEach(noop);
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => operatorFn("not an observable"),
    ParameterTypeError,
  );
});

Deno.test("forEach should perform side-effects for each value", () => {
  // Arrange
  const sideEffects: Array<[number, number]> = [];
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    [1, 2, 3],
    ofIterable(),
    forEach((value, index) => sideEffects.push([value, index])),
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

Deno.test("forEach should pass values through unchanged", () => {
  // Arrange
  const notifications: Array<ObserverNotification<string>> = [];
  const observable = pipe(
    ["a", "b", "c"],
    ofIterable(),
    forEach(noop),
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

Deno.test("forEach should pump throws through itself", () => {
  // Arrange
  const error = new Error("test");
  const sideEffects: Array<number> = [];
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    throwError(error),
    forEach((value) => sideEffects.push(value)),
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

Deno.test("forEach should pump returns through itself", () => {
  // Arrange
  const sideEffects: Array<number> = [];
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    [],
    ofIterable(),
    forEach((value) => sideEffects.push(value)),
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

Deno.test("forEach should handle abort", () => {
  // Arrange
  let sourceAborted = false;
  const controller = new AbortController();
  const source = new Observable<number>((observer) =>
    observer.signal.addEventListener("abort", () => (sourceAborted = true), {
      once: true,
    })
  );
  const observable = pipe(
    source,
    forEach(noop),
  );

  // Act
  observable.subscribe(new Observer({ signal: controller.signal }));
  controller.abort();

  // Assert
  assertEquals(sourceAborted, true);
});

Deno.test("forEach should throw if the callback throws", () => {
  // Arrange
  const error = new Error("test");
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    [1, 2, 3],
    ofIterable(),
    forEach(() => {
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

Deno.test("forEach callback error should be delivered as throw notification without return", () => {
  // Arrange
  const error = new Error("callback error");
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    [1],
    ofIterable(),
    forEach(() => {
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

Deno.test("forEach callback throwing on later value should stop processing", () => {
  // Arrange
  const error = new Error("callback error on value 2");
  const sideEffects: Array<number> = [];
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    [1, 2, 3],
    ofIterable(),
    forEach((value) => {
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

Deno.test("forEach should execute side-effect before downstream receives value", () => {
  // Arrange
  const order: Array<string> = [];
  const observable = pipe(
    [1],
    ofIterable(),
    forEach(() => order.push("forEach")),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => order.push(notification[0])),
  );

  // Assert
  assertEquals(order, ["forEach", "next", "return"]);
});
