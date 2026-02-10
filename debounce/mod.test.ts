import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { Observable, Observer, Subject } from "@observable/core";
import { empty } from "@observable/empty";
import { pipe } from "@observable/pipe";
import { ofIterable } from "@observable/of-iterable";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { debounce } from "./mod.ts";

Deno.test("debounce should return empty if milliseconds is negative", () => {
  // Arrange
  const source = pipe([1, 2, 3], ofIterable());

  // Act
  const result = pipe(source, debounce(-1));

  // Assert
  assertStrictEquals(result, empty);
});

Deno.test("debounce should return empty if milliseconds is NaN", () => {
  // Arrange
  const source = pipe([1, 2, 3], ofIterable());

  // Act
  const result = pipe(source, debounce(NaN));

  // Assert
  assertStrictEquals(result, empty);
});

Deno.test("debounce should ignore values but propagate return when milliseconds is Infinity", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = pipe([1, 2, 3], ofIterable());
  const materialized = pipe(source, debounce(Infinity), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("debounce should ignore values but propagate throw when milliseconds is Infinity", () => {
  // Arrange
  const error = new Error("test error");
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Observable<number>((observer) => {
    observer.next(1);
    observer.next(2);
    observer.throw(error);
  });
  const materialized = pipe(source, debounce(Infinity), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", error]]);
});

Deno.test("debounce should emit value after timeout expires", () => {
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
  const materialized = pipe(source, debounce(100), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next(1);
  assertEquals(notifications, []);
  const [[callback]] = setTimeoutCalls;
  (callback as () => void)();

  // Assert
  assertEquals(notifications, [["next", 1]]);
  overrideGlobals = false;
});

Deno.test("debounce should only emit the latest value when multiple values are emitted rapidly", () => {
  // Arrange
  let overrideGlobals = true;
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
  const materialized = pipe(source, debounce(100), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next(1);
  source.next(2);
  source.next(3);
  const lastCallback = setTimeoutCalls[setTimeoutCalls.length - 1][0];
  (lastCallback as () => void)();

  // Assert
  assertEquals(notifications, [["next", 3]]);
  overrideGlobals = false;
});

Deno.test("debounce should emit immediately if milliseconds is 0", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Subject<number>();
  const materialized = pipe(source, debounce(0), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next(1);
  source.next(2);
  source.next(3);
  source.return();

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["return"],
  ]);
});

Deno.test("debounce should pump throws right through itself", () => {
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
  const materialized = pipe(source, debounce(100), materialize());

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", error]]);

  overrideGlobals = false;
});

Deno.test("debounce should honor abort", () => {
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
  const materialized = pipe(source, debounce(100), materialize());

  // Act
  materialized.subscribe(
    new Observer({
      signal: controller.signal,
      next: (notification) => notifications.push(notification),
    }),
  );
  source.next(1);
  controller.abort();

  // Assert
  assertEquals(notifications, []);

  overrideGlobals = false;
});

Deno.test("debounce should throw when called with no arguments", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => debounce(...([] as unknown as Parameters<typeof debounce>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("debounce should throw when milliseconds is not a number", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => debounce("s" as unknown as number),
    TypeError,
    "Parameter 1 is not of type 'Number'",
  );
});

Deno.test("debounce should throw when called with no source", () => {
  // Arrange
  const operator = debounce(100);

  // Act / Assert
  assertThrows(
    () => operator(...([] as unknown as Parameters<typeof operator>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("debounce should throw when source is not an Observable", () => {
  // Arrange
  const operator = debounce(100);

  // Act / Assert
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => operator(1 as any),
    TypeError,
    "Parameter 1 is not of type 'Observable'",
  );
});
