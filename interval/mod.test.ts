import { assertEquals, assertInstanceOf, assertStrictEquals, assertThrows } from "@std/assert";
import { Observer } from "@observable/core";
import { empty } from "@observable/empty";
import { never } from "@observable/never";
import { pipe } from "@observable/pipe";
import { take } from "@observable/take";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { interval } from "./mod.ts";

Deno.test("interval should return never if the milliseconds is Infinity", () => {
  // Arrange / Act
  const observable = interval(Infinity);

  // Assert
  assertStrictEquals(observable, never);
});

Deno.test("interval should return empty if the milliseconds is negative", () => {
  // Arrange / Act
  const observable = interval(-1);

  // Assert
  assertStrictEquals(observable, empty);
});

Deno.test("interval should return empty if the milliseconds is NaN", () => {
  // Arrange / Act
  const observable = interval(NaN);

  // Assert
  assertStrictEquals(observable, empty);
});

Deno.test("interval should emit indexes synchronously when milliseconds is 0", () => {
  // Arrange
  const notifications: Array<ObserverNotification<void>> = [];
  const observable = pipe(interval(0), take(5), materialize());

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", undefined],
    ["next", undefined],
    ["next", undefined],
    ["next", undefined],
    ["next", undefined],
    ["return"],
  ]);
});

Deno.test("interval should setup an interval timer", () => {
  // Arrange
  let overrode = true;
  const milliseconds = 1_000;
  const intervalId = Math.random();
  const notifications: Array<ObserverNotification<void>> = [];
  const setIntervalCalls: Array<Parameters<typeof setInterval>> = [];
  const originalSetInterval = globalThis.setInterval;
  Object.defineProperty(globalThis, "setInterval", {
    value: (...args: Parameters<typeof setInterval>) => {
      setIntervalCalls.push(args);
      return overrode ? intervalId : originalSetInterval(...args);
    },
  });

  // Act
  pipe(interval(milliseconds), materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertStrictEquals(setIntervalCalls.length, 1);
  assertEquals(notifications, []);
  const [[callback, delay]] = setIntervalCalls;
  assertStrictEquals(delay, milliseconds);
  assertInstanceOf(callback, Function);
  callback();
  assertEquals(notifications, [["next", undefined]]);
  callback();
  assertEquals(notifications, [["next", undefined], ["next", undefined]]);
  callback();
  assertEquals(notifications, [["next", undefined], ["next", undefined], ["next", undefined]]);

  overrode = false;
});

Deno.test("interval should clear interval on abort", () => {
  // Arrange
  let overrideGlobals = true;
  const milliseconds = 1_000;
  const intervalId = Math.random();
  const setIntervalCalls: Array<Parameters<typeof setInterval>> = [];
  const clearIntervalCalls: Array<Parameters<typeof clearInterval>> = [];
  const originalSetInterval = globalThis.setInterval;
  const originalClearInterval = globalThis.clearInterval;
  const controller = new AbortController();
  Object.defineProperty(globalThis, "setInterval", {
    value: (...args: Parameters<typeof setInterval>) => {
      setIntervalCalls.push(args);
      return overrideGlobals ? intervalId : originalSetInterval(...args);
    },
  });
  Object.defineProperty(globalThis, "clearInterval", {
    value: (...args: Parameters<typeof clearInterval>) => {
      clearIntervalCalls.push(args);
      return overrideGlobals ? undefined : originalClearInterval(...args);
    },
  });

  // Act
  interval(milliseconds).subscribe(
    new Observer({ signal: controller.signal }),
  );
  controller.abort();

  // Assert
  assertStrictEquals(setIntervalCalls.length, 1);
  assertEquals(clearIntervalCalls, [[intervalId]]);
  overrideGlobals = false;
});

Deno.test(
  "interval should clear interval on abort before observation is created",
  () => {
    // Arrange
    let overrideGlobals = true;
    const milliseconds = 1_000;
    const setIntervalCalls: Array<Parameters<typeof setInterval>> = [];
    const clearIntervalCalls: Array<Parameters<typeof clearInterval>> = [];
    const originalSetInterval = globalThis.setInterval;
    const originalClearInterval = globalThis.clearInterval;
    const controller = new AbortController();
    Object.defineProperty(globalThis, "setInterval", {
      value: (...args: Parameters<typeof setInterval>) => {
        setIntervalCalls.push(args);
        return overrideGlobals ? Math.random() : originalSetInterval(...args);
      },
    });
    Object.defineProperty(globalThis, "clearInterval", {
      value: (...args: Parameters<typeof clearInterval>) => {
        clearIntervalCalls.push(args);
        return overrideGlobals ? undefined : originalClearInterval(...args);
      },
    });
    controller.abort();

    // Act
    interval(milliseconds).subscribe(
      new Observer({ signal: controller.signal }),
    );

    // Assert
    assertEquals(setIntervalCalls, []);
    assertEquals(clearIntervalCalls, []);
    overrideGlobals = false;
  },
);

Deno.test(
  "interval should throw when called with no arguments",
  () => {
    // Arrange / Act / Assert
    assertThrows(
      () => interval(...([] as unknown as Parameters<typeof interval>)),
      TypeError,
      "1 argument required but 0 present",
    );
  },
);

Deno.test(
  "interval should throw when milliseconds is not a number",
  () => {
    // Arrange / Act / Assert
    assertThrows(
      () => interval("s" as unknown as number),
      TypeError,
      "Parameter 1 is not of type 'Number'",
    );
  },
);

Deno.test("interval should emit increasing indexes", () => {
  // Arrange
  let overrode = true;
  const milliseconds = 100;
  const intervalId = Math.random();
  const notifications: Array<ObserverNotification<void>> = [];
  const setIntervalCalls: Array<Parameters<typeof setInterval>> = [];
  const originalSetInterval = globalThis.setInterval;
  const controller = new AbortController();
  Object.defineProperty(globalThis, "setInterval", {
    value: (...args: Parameters<typeof setInterval>) => {
      setIntervalCalls.push(args);
      return overrode ? intervalId : originalSetInterval(...args);
    },
  });

  // Act
  pipe(interval(milliseconds), materialize()).subscribe(
    new Observer({
      signal: controller.signal,
      next: (notification) => notifications.push(notification),
    }),
  );
  const [[callback]] = setIntervalCalls;
  for (let i = 0; i < 10; i++) {
    (callback as () => void)();
  }
  controller.abort();

  // Assert
  assertEquals(notifications, [
    ["next", undefined],
    ["next", undefined],
    ["next", undefined],
    ["next", undefined],
    ["next", undefined],
    ["next", undefined],
    ["next", undefined],
    ["next", undefined],
    ["next", undefined],
    ["next", undefined],
  ]);
  overrode = false;
});

Deno.test("interval should work with take operator", () => {
  // Arrange
  let overrode = true;
  const milliseconds = 100;
  const intervalId = Math.random();
  const notifications: Array<ObserverNotification<void>> = [];
  const setIntervalCalls: Array<Parameters<typeof setInterval>> = [];
  const clearIntervalCalls: Array<Parameters<typeof clearInterval>> = [];
  const originalSetInterval = globalThis.setInterval;
  const originalClearInterval = globalThis.clearInterval;
  Object.defineProperty(globalThis, "setInterval", {
    value: (...args: Parameters<typeof setInterval>) => {
      setIntervalCalls.push(args);
      return overrode ? intervalId : originalSetInterval(...args);
    },
  });
  Object.defineProperty(globalThis, "clearInterval", {
    value: (...args: Parameters<typeof clearInterval>) => {
      clearIntervalCalls.push(args);
      return overrode ? undefined : originalClearInterval(...args);
    },
  });

  // Act
  pipe(interval(milliseconds), take(3), materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  const [[callback]] = setIntervalCalls;
  for (let i = 0; i < 5; i++) {
    (callback as () => void)();
  }

  // Assert
  assertEquals(notifications, [
    ["next", undefined],
    ["next", undefined],
    ["next", undefined],
    ["return"],
  ]);
  assertEquals(clearIntervalCalls, [[intervalId]]);
  overrode = false;
});
