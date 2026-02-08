import { assertEquals, assertInstanceOf, assertStrictEquals, assertThrows } from "@std/assert";
import { Observer } from "@observable/core";
import { empty } from "@observable/empty";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { delay } from "./mod.ts";

Deno.test(
  "delay should return an empty observable if the milliseconds is less than 0",
  () => {
    // Arrange
    const source = pipe([1, 2, 3], ofIterable());

    // Act
    const result = pipe(source, delay(-1));

    // Assert
    assertStrictEquals(result, empty);
  },
);

Deno.test("delay should return the source observable if the milliseconds is 0 and source is an Observable instance", () => {
  // Arrange
  const source = pipe([1, 2, 3], ofIterable());

  // Act
  const result = pipe(source, delay(0));

  // Assert
  assertStrictEquals(result, source);
});

Deno.test("delay should return empty if the milliseconds is NaN", () => {
  // Arrange
  const source = pipe([1, 2, 3], ofIterable());

  // Act
  const result = pipe(source, delay(NaN));

  // Assert
  assertStrictEquals(result, empty);
});

Deno.test("delay should drop all values and return when source returns if the milliseconds is Infinity", () => {
  // Arrange
  const source = pipe([1, 2, 3], ofIterable());
  const notifications: Array<ObserverNotification<number>> = [];

  // Act
  pipe(source, delay(Infinity), materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test(
  "delay should delay the values if the milliseconds is a positive number",
  () => {
    // Arrange
    let overrode = true;
    const milliseconds = 1_000;
    const setTimeoutId = Math.random();
    const notifications: Array<ObserverNotification<number>> = [];
    const setTimeoutCalls: Array<Parameters<typeof setTimeout>> = [];
    const originalSetTimeout = globalThis.setTimeout;
    Object.defineProperty(globalThis, "setTimeout", {
      value: (...args: Parameters<typeof setTimeout>) => {
        setTimeoutCalls.push(args);
        return overrode ? setTimeoutId : originalSetTimeout(...args);
      },
    });

    // Act
    pipe(pipe([1, 2, 3], ofIterable()), delay(milliseconds), materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertStrictEquals(setTimeoutCalls.length, 3);
    assertEquals(notifications, []);

    // Trigger all timeouts
    for (const [callback, delayMs] of setTimeoutCalls) {
      assertStrictEquals(delayMs, milliseconds);
      assertInstanceOf(callback, Function);
      callback();
    }

    assertEquals(notifications, [
      ["next", 1],
      ["next", 2],
      ["next", 3],
      ["return"],
    ]);
    overrode = false;
  },
);

Deno.test(
  "delay should clear timeouts on unsubscription after the subscription is created",
  () => {
    // Arrange
    let overrideGlobals = true;
    const milliseconds = 1_000;
    const setTimeoutIds: number[] = [];
    const notifications: Array<ObserverNotification<number>> = [];
    const setTimeoutCalls: Array<Parameters<typeof setTimeout>> = [];
    const clearTimeoutCalls: Array<Parameters<typeof clearTimeout>> = [];
    const originalSetTimeout = globalThis.setTimeout;
    const originalClearTimeout = globalThis.clearTimeout;
    const controller = new AbortController();
    const materialized = pipe(pipe([1, 2, 3], ofIterable()), delay(milliseconds), materialize());
    let idCounter = 0;
    Object.defineProperty(globalThis, "setTimeout", {
      value: (...args: Parameters<typeof setTimeout>) => {
        setTimeoutCalls.push(args);
        if (overrideGlobals) {
          const id = ++idCounter;
          setTimeoutIds.push(id);
          return id;
        }
        return originalSetTimeout(...args);
      },
    });
    Object.defineProperty(globalThis, "clearTimeout", {
      value: (...args: Parameters<typeof clearTimeout>) => {
        clearTimeoutCalls.push(args);
        return overrideGlobals ? undefined : originalClearTimeout(...args);
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
    assertStrictEquals(setTimeoutCalls.length, 3);
    assertEquals(notifications, []);
    // Each timeout should be cleared
    assertEquals(clearTimeoutCalls.length, 3);
    for (const id of setTimeoutIds) {
      assertEquals(
        clearTimeoutCalls.some(([clearedId]) => clearedId === id),
        true,
      );
    }

    // Triggering callbacks after abort should not emit notifications
    for (const [callback] of setTimeoutCalls) {
      assertInstanceOf(callback, Function);
      callback();
    }
    assertEquals(notifications, []);
    overrideGlobals = false;
  },
);

Deno.test(
  "delay should not setup timeouts on unsubscription before the subscription is created",
  () => {
    // Arrange
    let overrideGlobals = true;
    const milliseconds = 1_000;
    const notifications: Array<ObserverNotification<number>> = [];
    const setTimeoutCalls: Array<Parameters<typeof setTimeout>> = [];
    const clearTimeoutCalls: Array<Parameters<typeof clearTimeout>> = [];
    const originalSetTimeout = globalThis.setTimeout;
    const originalClearTimeout = globalThis.clearTimeout;
    const controller = new AbortController();
    const materialized = pipe(pipe([1, 2, 3], ofIterable()), delay(milliseconds), materialize());
    Object.defineProperty(globalThis, "setTimeout", {
      value: (...args: Parameters<typeof setTimeout>) => {
        setTimeoutCalls.push(args);
        return overrideGlobals ? Math.random() : originalSetTimeout(...args);
      },
    });
    Object.defineProperty(globalThis, "clearTimeout", {
      value: (...args: Parameters<typeof clearTimeout>) => {
        clearTimeoutCalls.push(args);
        return overrideGlobals ? undefined : originalClearTimeout(...args);
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

Deno.test(
  "delay should throw an error if the milliseconds is not provided",
  () => {
    // Arrange / Act / Assert
    assertThrows(
      () => delay(...([] as unknown as Parameters<typeof delay>)),
      TypeError,
      "1 argument required but 0 present",
    );
  },
);

Deno.test(
  "delay should throw an error if the milliseconds is not of type 'Number'",
  () => {
    // Arrange / Act / Assert
    assertThrows(
      () => delay("s" as unknown as number),
      TypeError,
      "Parameter 1 is not of type 'Number'",
    );
  },
);

Deno.test(
  "delay should throw an error if the source is not provided to the inner function",
  () => {
    // Arrange
    const delayFn = delay(1_000);

    // Act / Assert
    assertThrows(
      () => delayFn(...([] as unknown as Parameters<typeof delayFn>)),
      TypeError,
      "1 argument required but 0 present",
    );
  },
);

Deno.test(
  "delay should throw an error if the source is not of type 'Observable'",
  () => {
    // Arrange
    const delayFn = delay(1_000);

    // Act / Assert
    assertThrows(
      () => delayFn("not-observable" as unknown as Parameters<typeof delayFn>[0]),
      TypeError,
      "Parameter 1 is not of type 'Observable'",
    );
  },
);

Deno.test(
  "delay should emit values immediately when milliseconds is 0",
  () => {
    // Arrange
    let overrideGlobals = true;
    const notifications: Array<ObserverNotification<number>> = [];
    const setTimeoutCalls: Array<Parameters<typeof setTimeout>> = [];
    const clearTimeoutCalls: Array<Parameters<typeof clearTimeout>> = [];
    const originalSetTimeout = globalThis.setTimeout;
    const originalClearTimeout = globalThis.clearTimeout;
    const materialized = pipe(pipe([1, 2, 3], ofIterable()), delay(0), materialize());
    Object.defineProperty(globalThis, "setTimeout", {
      value: (...args: Parameters<typeof setTimeout>) => {
        setTimeoutCalls.push(args);
        return overrideGlobals ? Math.random() : originalSetTimeout(...args);
      },
    });
    Object.defineProperty(globalThis, "clearTimeout", {
      value: (...args: Parameters<typeof clearTimeout>) => {
        clearTimeoutCalls.push(args);
        return overrideGlobals ? undefined : originalClearTimeout(...args);
      },
    });

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
    assertEquals(setTimeoutCalls, []);
    assertEquals(clearTimeoutCalls, []);
    overrideGlobals = false;
  },
);

Deno.test(
  "delay should preserve the order of values after delay",
  () => {
    // Arrange
    let overrode = true;
    const milliseconds = 500;
    const notifications: Array<ObserverNotification<number>> = [];
    const setTimeoutCalls: Array<Parameters<typeof setTimeout>> = [];
    const originalSetTimeout = globalThis.setTimeout;
    Object.defineProperty(globalThis, "setTimeout", {
      value: (...args: Parameters<typeof setTimeout>) => {
        setTimeoutCalls.push(args);
        return overrode ? Math.random() : originalSetTimeout(...args);
      },
    });

    // Act
    pipe(pipe([5, 4, 3, 2, 1], ofIterable()), delay(milliseconds), materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertStrictEquals(setTimeoutCalls.length, 5);
    assertEquals(notifications, []);

    // Trigger all timeouts in order
    for (const [callback, delayMs] of setTimeoutCalls) {
      assertStrictEquals(delayMs, milliseconds);
      assertInstanceOf(callback, Function);
      callback();
    }

    assertEquals(notifications, [
      ["next", 5],
      ["next", 4],
      ["next", 3],
      ["next", 2],
      ["next", 1],
      ["return"],
    ]);
    overrode = false;
  },
);
