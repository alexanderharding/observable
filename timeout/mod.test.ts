import { assertEquals, assertInstanceOf, assertStrictEquals, assertThrows } from "@std/assert";
import { empty } from "@observable/empty";
import { never } from "@observable/never";
import { Observer } from "@observable/core";
import { timeout } from "./mod.ts";
import { pipe } from "@observable/pipe";
import { materialize, type ObserverNotification } from "@observable/materialize";

Deno.test("timeout should return never if the milliseconds is Infinity", () => {
  // Arrange
  const milliseconds = Infinity;

  // Act
  const observable = timeout(milliseconds);

  // Assert
  assertStrictEquals(observable, never);
});

Deno.test("timeout should setup a timeout", () => {
  // Arrange
  let overrode = true;
  const milliseconds = 1_000;
  const setTimeoutId = Math.random();
  const notifications: Array<ObserverNotification<void>> = [];
  const setTimeoutCalls: Array<Parameters<typeof setTimeout>> = [];
  const originalSetTimeout = globalThis.setTimeout;
  Object.defineProperty(globalThis, "setTimeout", {
    value: (...args: Parameters<typeof setTimeout>) => {
      setTimeoutCalls.push(args);
      return overrode ? setTimeoutId : originalSetTimeout(...args);
    },
  });

  // Act
  pipe(timeout(milliseconds), materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertStrictEquals(setTimeoutCalls.length, 1);
  assertEquals(notifications, []);
  const [[callback, delay]] = setTimeoutCalls;
  assertStrictEquals(delay, milliseconds);
  assertInstanceOf(callback, Function);
  callback();
  assertEquals(notifications, [["next", undefined], ["return"]]);
  overrode = false;
});

Deno.test(
  "timeout should clear timeout on abort after the Observer is created",
  () => {
    // Arrange
    let overrideGlobals = true;
    const milliseconds = 1_000;
    const setTimeoutId = Math.random();
    const notifications: Array<ObserverNotification<void>> = [];
    const setTimeoutCalls: Array<Parameters<typeof setTimeout>> = [];
    const clearTimeoutCalls: Array<Parameters<typeof clearTimeout>> = [];
    const originalSetTimeout = globalThis.setTimeout;
    const originalClearTimeout = globalThis.clearTimeout;
    const controller = new AbortController();
    const materialized = pipe(timeout(milliseconds), materialize());
    Object.defineProperty(globalThis, "setTimeout", {
      value: (...args: Parameters<typeof setTimeout>) => {
        setTimeoutCalls.push(args);
        return overrideGlobals ? setTimeoutId : originalSetTimeout(...args);
      },
    });
    Object.defineProperty(globalThis, "clearTimeout", {
      value: (...args: Parameters<typeof clearTimeout>) => {
        clearTimeoutCalls.push(args);
        return overrideGlobals ? setTimeoutId : originalClearTimeout(...args);
      },
    });
    // Act
    materialized.subscribe(
      new Observer({
        next: (notification) => notifications.push(notification),
        signal: controller.signal,
      }),
    );
    controller.abort();

    // Assert
    assertStrictEquals(setTimeoutCalls.length, 1);
    assertEquals(notifications, []);
    assertEquals(clearTimeoutCalls, [[setTimeoutId]]);
    const [[callback, delay]] = setTimeoutCalls;
    assertStrictEquals(delay, milliseconds);
    assertInstanceOf(callback, Function);
    callback();
    assertEquals(notifications, []);
    overrideGlobals = false;
  },
);

Deno.test(
  "timeout should clear timeout on abort before the Observer is created",
  () => {
    // Arrange
    let overrideGlobals = true;
    const milliseconds = 1_000;
    const setTimeoutId = Math.random();
    const notifications: Array<ObserverNotification<void>> = [];
    const setTimeoutCalls: Array<Parameters<typeof setTimeout>> = [];
    const clearTimeoutCalls: Array<Parameters<typeof clearTimeout>> = [];
    const originalSetTimeout = globalThis.setTimeout;
    const originalClearTimeout = globalThis.clearTimeout;
    const controller = new AbortController();
    const materialized = pipe(timeout(milliseconds), materialize());
    Object.defineProperty(globalThis, "setTimeout", {
      value: (...args: Parameters<typeof setTimeout>) => {
        setTimeoutCalls.push(args);
        return overrideGlobals ? setTimeoutId : originalSetTimeout(...args);
      },
    });
    Object.defineProperty(globalThis, "clearTimeout", {
      value: (...args: Parameters<typeof clearTimeout>) => {
        clearTimeoutCalls.push(args);
        return overrideGlobals ? setTimeoutId : originalClearTimeout(...args);
      },
    });
    controller.abort();

    // Act
    materialized.subscribe(
      new Observer({
        next: (notification) => notifications.push(notification),
        signal: controller.signal,
      }),
    );

    // Assert
    assertEquals(notifications, []);
    assertEquals(setTimeoutCalls, []);
    assertEquals(clearTimeoutCalls, []);
    overrideGlobals = false;
  },
);

Deno.test("timeout should emit immediately if the milliseconds is 0", () => {
  // Arrange
  let overrideGlobals = true;
  const setTimeoutId = Math.random();
  const notifications: Array<ObserverNotification<void>> = [];
  const setTimeoutCalls: Array<Parameters<typeof setTimeout>> = [];
  const clearTimeoutCalls: Array<Parameters<typeof clearTimeout>> = [];
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  const materialized = pipe(timeout(0), materialize());
  Object.defineProperty(globalThis, "setTimeout", {
    value: (...args: Parameters<typeof setTimeout>) => {
      setTimeoutCalls.push(args);
      return overrideGlobals ? setTimeoutId : originalSetTimeout(...args);
    },
  });
  Object.defineProperty(globalThis, "clearTimeout", {
    value: (...args: Parameters<typeof clearTimeout>) => {
      clearTimeoutCalls.push(args);
      return overrideGlobals ? setTimeoutId : originalClearTimeout(...args);
    },
  });

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["next", undefined], ["return"]]);
  assertEquals(setTimeoutCalls, []);
  assertEquals(clearTimeoutCalls, []);
  overrideGlobals = false;
});

Deno.test("timeout should return empty if the milliseconds is NaN", () => {
  // Arrange / Act / Assert
  assertStrictEquals(timeout(NaN), empty);
});

Deno.test(
  "timeout should throw an error if the milliseconds is not provided",
  () => {
    // Arrange / Act / Assert
    assertThrows(
      () => timeout(...([] as unknown as Parameters<typeof timeout>)),
      TypeError,
      "1 argument required but 0 present",
    );
  },
);

Deno.test(
  "timeout should throw an error if the milliseconds is a not of type 'Number'",
  () => {
    // Arrange / Act / Assert
    assertThrows(
      () => timeout("s" as unknown as number),
      TypeError,
      "Parameter 1 is not of type 'Number'",
    );
  },
);
