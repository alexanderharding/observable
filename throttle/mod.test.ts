import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { Observable, Observer, Subject } from "@observable/core";
import { empty } from "@observable/empty";
import { pipe } from "@observable/pipe";
import { of } from "@observable/of";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { throttle } from "./mod.ts";

Deno.test("throttle should return empty if milliseconds is negative", () => {
  // Arrange
  const source = of([1, 2, 3]);

  // Act
  const result = pipe(source, throttle(-1));

  // Assert
  assertStrictEquals(result, empty);
});

Deno.test("throttle should return empty if milliseconds is NaN", () => {
  // Arrange
  const source = of([1, 2, 3]);

  // Act
  const result = pipe(source, throttle(NaN));

  // Assert
  assertStrictEquals(result, empty);
});

Deno.test("throttle should emit first value immediately", () => {
  // Arrange
  let overrideGlobals = true;
  const notifications: Array<ObserverNotification<number>> = [];
  const setTimeoutCalls: Array<Parameters<typeof setTimeout>> = [];
  const originalSetTimeout = globalThis.setTimeout;
  Object.defineProperty(globalThis, "setTimeout", {
    value: (...args: Parameters<typeof setTimeout>) => {
      setTimeoutCalls.push(args);
      return overrideGlobals ? Math.random() : originalSetTimeout(...args);
    },
  });

  const source = new Subject<number>();
  const materialized = pipe(source, throttle(100), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next(1);

  // Assert
  assertEquals(notifications, [["next", 1]]);

  overrideGlobals = false;
});

Deno.test("throttle should ignore values during throttle window", () => {
  // Arrange
  let overrideGlobals = true;
  const notifications: Array<ObserverNotification<number>> = [];
  const setTimeoutCalls: Array<Parameters<typeof setTimeout>> = [];
  const originalSetTimeout = globalThis.setTimeout;
  Object.defineProperty(globalThis, "setTimeout", {
    value: (...args: Parameters<typeof setTimeout>) => {
      setTimeoutCalls.push(args);
      return overrideGlobals ? setTimeoutCalls.length : originalSetTimeout(...args);
    },
  });

  const source = new Subject<number>();
  const materialized = pipe(source, throttle(100), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next(1);
  source.next(2);
  source.next(3);
  assertEquals(notifications, [["next", 1]]);
  const [[callback]] = setTimeoutCalls;
  (callback as () => void)();
  source.next(4);

  // Assert
  assertEquals(notifications, [["next", 1], ["next", 4]]);

  overrideGlobals = false;
});

Deno.test("throttle should pump throws right through itself", () => {
  // Arrange
  let overrideGlobals = true;
  const error = new Error("test error");
  const notifications: Array<ObserverNotification<number>> = [];
  const originalSetTimeout = globalThis.setTimeout;
  Object.defineProperty(globalThis, "setTimeout", {
    value: (...args: Parameters<typeof setTimeout>) => {
      return overrideGlobals ? Math.random() : originalSetTimeout(...args);
    },
  });

  const source = new Observable<number>((observer) => {
    observer.next(1);
    observer.throw(error);
  });
  const materialized = pipe(source, throttle(100), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["throw", error],
  ]);

  overrideGlobals = false;
});

Deno.test("throttle should honor unsubscribe", () => {
  // Arrange
  let overrideGlobals = true;
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<number>> = [];
  const setTimeoutCalls: Array<Parameters<typeof setTimeout>> = [];
  const clearTimeoutCalls: Array<Parameters<typeof clearTimeout>> = [];
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  Object.defineProperty(globalThis, "setTimeout", {
    value: (...args: Parameters<typeof setTimeout>) => {
      setTimeoutCalls.push(args);
      return overrideGlobals ? setTimeoutCalls.length : originalSetTimeout(...args);
    },
  });
  Object.defineProperty(globalThis, "clearTimeout", {
    value: (...args: Parameters<typeof clearTimeout>) => {
      clearTimeoutCalls.push(args);
      return overrideGlobals ? undefined : originalClearTimeout(...args);
    },
  });

  const source = new Subject<number>();
  const materialized = pipe(source, throttle(100), materialize());

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
  source.next(1);

  // Assert
  assertEquals(notifications, [["next", 1]]);

  overrideGlobals = false;
});

Deno.test("throttle should throw when called with no arguments", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => throttle(...([] as unknown as Parameters<typeof throttle>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("throttle should throw when milliseconds is not a number", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => throttle("s" as unknown as number),
    TypeError,
    "Parameter 1 is not of type 'Number'",
  );
});

Deno.test("throttle should throw when called with no source", () => {
  // Arrange
  const operator = throttle(100);

  // Act / Assert
  assertThrows(
    () => operator(...([] as unknown as Parameters<typeof operator>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("throttle should throw when source is not an Observable", () => {
  // Arrange
  const operator = throttle(100);

  // Act / Assert
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => operator(1 as any),
    TypeError,
    "Parameter 1 is not of type 'Observable'",
  );
});

Deno.test("throttle should emit all values immediately when milliseconds is 0", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = of([1, 2, 3]);
  const materialized = pipe(source, throttle(0), materialize());

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

Deno.test("throttle should emit only first value and propagate return when milliseconds is Infinity", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = of([1, 2, 3]);
  const materialized = pipe(source, throttle(Infinity), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["next", 1], ["return"]]);
});

Deno.test("throttle should emit only first value and propagate throw when milliseconds is Infinity", () => {
  // Arrange
  const error = new Error("test error");
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Observable<number>((observer) => {
    observer.next(1);
    observer.next(2);
    observer.throw(error);
  });
  const materialized = pipe(source, throttle(Infinity), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert - take(1) returns after first value, so throw is not propagated
  assertEquals(notifications, [["next", 1], ["return"]]);
});
