import { assertEquals, assertStrictEquals } from "@std/assert";
import { empty } from "./empty.ts";
import { never } from "./never.ts";
import { timer } from "./timer.ts";
import type { ObserverNotification } from "./observer-notification.ts";
import { pipe } from "./pipe.ts";
import { Observer } from "@xan/observable-core";
import { materialize } from "./materialize.ts";

Deno.test(
  "timer should return empty if the milliseconds is less than 0",
  () => {
    // Arrange
    const milliseconds = -1;

    // Act
    const observable = timer(milliseconds);

    // Assert
    assertStrictEquals(observable, empty);
  },
);

Deno.test(
  "timer should return empty if the milliseconds is less than NaN",
  () => {
    // Arrange
    const milliseconds = NaN;

    // Act
    const observable = timer(milliseconds);

    // Assert
    assertStrictEquals(observable, empty);
  },
);

Deno.test(
  "timer should emit immediately without setting the timeout when the milliseconds is 0",
  () => {
    // Arrange
    let proxy = true;
    const milliseconds = 0;
    const notifications: Array<ObserverNotification<number>> = [];
    const setTimeoutCalls: Array<Parameters<typeof globalThis.setTimeout>> = [];
    Object.defineProperty(globalThis, "setTimeout", {
      value: new Proxy(globalThis.setTimeout, {
        apply: (
          target,
          _,
          argumentsList: Parameters<typeof globalThis.setTimeout>,
        ) => {
          setTimeoutCalls.push(argumentsList);
          if (!proxy) return target(...argumentsList);
        },
      }),
    });

    // Act
    pipe(timer(milliseconds), materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [["next", 0], ["return"]]);
    assertStrictEquals(setTimeoutCalls.length, 0);
    proxy = false;
  },
);

Deno.test("timer should return never if the milliseconds is Infinity", () => {
  // Arrange
  const milliseconds = Infinity;

  // Act
  const observable = timer(milliseconds);

  // Assert
  assertStrictEquals(observable, never);
});

Deno.test(
  "timer should emit 0 after the specified number of milliseconds and then return",
  () => {
    // Arrange
    let proxy = true;
    const notifications: Array<ObserverNotification<number>> = [];
    const setTimeoutCalls: Array<Parameters<typeof globalThis.setTimeout>> = [];
    const milliseconds = 1_000;
    Object.defineProperty(globalThis, "setTimeout", {
      value: new Proxy(globalThis.setTimeout, {
        apply: (
          target,
          _,
          argumentsList: Parameters<typeof globalThis.setTimeout>,
        ) => {
          setTimeoutCalls.push(argumentsList);
          if (!proxy) return target(...argumentsList);
        },
      }),
    });

    // Act
    pipe(timer(milliseconds), materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );
    const callback = setTimeoutCalls[0][0];
    if (typeof callback !== "function") {
      throw new Error("callback is not a function");
    }
    callback();

    // Assert
    assertEquals(notifications, [["next", 0], ["return"]]);
    assertStrictEquals(setTimeoutCalls.length, 1);
    assertEquals(setTimeoutCalls[0][1], milliseconds);
    proxy = false;
  },
);

Deno.test(
  "timer should clear the timeout when the observer is unsubscribed after the subscription is created",
  () => {
    // Arrange
    let proxy = true;
    const timeoutId = Math.random();
    const milliseconds = 500;
    const controller = new AbortController();
    const notifications: Array<ObserverNotification<number>> = [];
    const clearTimeoutCalls: Array<Parameters<typeof globalThis.clearTimeout>> = [];
    Object.defineProperty(globalThis, "setTimeout", {
      value: new Proxy(globalThis.setTimeout, {
        apply: (
          target,
          _,
          argumentsList: Parameters<typeof globalThis.setTimeout>,
        ) => (proxy ? timeoutId : target(...argumentsList)),
      }),
    });
    Object.defineProperty(globalThis, "clearTimeout", {
      value: new Proxy(globalThis.clearTimeout, {
        apply: (
          target,
          _,
          argumentsList: Parameters<typeof globalThis.clearTimeout>,
        ) => {
          clearTimeoutCalls.push(argumentsList);
          if (!proxy) return target(...argumentsList);
        },
      }),
    });

    // Act
    pipe(timer(milliseconds), materialize()).subscribe(
      new Observer({
        signal: controller.signal,
        next: (notification) => notifications.push(notification),
      }),
    );
    controller.abort();

    // Assert
    assertEquals(notifications, []);
    assertEquals(clearTimeoutCalls, [[timeoutId]]);
    proxy = false;
  },
);

Deno.test(
  "timer should should not set the timeout when the observer is unsubscribed before the subscription is created",
  () => {
    // Arrange
    let proxy = true;
    const milliseconds = 500;
    const controller = new AbortController();
    const notifications: Array<ObserverNotification<number>> = [];
    const setTimeoutCalls: Array<Parameters<typeof globalThis.setTimeout>> = [];
    Object.defineProperty(globalThis, "setTimeout", {
      value: new Proxy(globalThis.setTimeout, {
        apply: (
          target,
          _,
          argumentsList: Parameters<typeof globalThis.setTimeout>,
        ) => {
          setTimeoutCalls.push(argumentsList);
          if (!proxy) return target(...argumentsList);
        },
      }),
    });

    // Act
    controller.abort();
    pipe(timer(milliseconds), materialize()).subscribe(
      new Observer({
        signal: controller.signal,
        next: (notification) => notifications.push(notification),
      }),
    );

    // Assert
    assertEquals(notifications, []);
    assertEquals(setTimeoutCalls, []);
    proxy = false;
  },
);
