import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { Observer, Subject } from "@observable/core";
import { empty } from "@observable/empty";
import { pipe } from "@observable/pipe";
import { forOf } from "@observable/for-of";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { audit } from "./mod.ts";
import { flat } from "@observable/flat";
import { of } from "@observable/of";
import { throwError } from "@observable/throw-error";
import { tap } from "@observable/tap";

Deno.test("audit should return empty if milliseconds is negative", () => {
  // Arrange
  const source = forOf([1, 2, 3]);

  // Act
  const result = pipe(source, audit(-1));

  // Assert
  assertStrictEquals(result, empty);
});

Deno.test("audit should return empty if milliseconds is NaN", () => {
  // Arrange
  const source = forOf([1, 2, 3]);

  // Act
  const result = pipe(source, audit(NaN));

  // Assert
  assertStrictEquals(result, empty);
});

Deno.test("audit should never next when milliseconds is Infinity", () => {
  // Arrange
  const notifications: Array<["tap", value: number] | ObserverNotification<number>> = [];
  const observable = pipe(
    forOf([1, 2, 3]),
    tap((value) => notifications.push(["tap", value])),
    audit(Infinity),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["tap", 1], ["tap", 2], ["tap", 3], ["return"]]);
});

Deno.test("audit should emit all values immediately when milliseconds is 0", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = forOf([1, 2, 3]);
  const observable = pipe(source, audit(0), materialize());

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["next", 1], ["next", 2], ["next", 3], ["return"]]);
});

Deno.test("audit should not emit until window elapses after first value", () => {
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
  const observable = pipe(source, audit(100), materialize());

  // Act
  observable.subscribe(
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

Deno.test("audit should emit latest value when multiple values arrive during window", () => {
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
  const observable = pipe(source, audit(100), materialize());

  // Act
  observable.subscribe(
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

Deno.test("audit should open a new window after previous window completes", () => {
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
  const observable = pipe(source, audit(100), materialize());

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next(1);
  (setTimeoutCalls[setTimeoutCalls.length - 1][0] as () => void)();

  // Assert
  assertEquals(notifications, [["next", 1]]);

  // Act
  source.next(2);
  (setTimeoutCalls[setTimeoutCalls.length - 1][0] as () => void)();

  // Assert
  assertEquals(notifications, [["next", 1], ["next", 2]]);
  overrideGlobals = false;
});

Deno.test("audit should return without next when source returns with no pending value", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Subject<number>();
  const observable = pipe(source, audit(100), materialize());

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.return();

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("audit should pump throws right through without emitting pending audited value", () => {
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

  const source = flat([of(1), throwError(error)]);
  const observable = pipe(source, audit(100), materialize());

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", error]]);
  overrideGlobals = false;
});

Deno.test("audit should honor unsubscribe before window elapses", () => {
  // Arrange
  let overrideGlobals = true;
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<number>> = [];
  const setTimeoutCalls: Array<Parameters<typeof setTimeout>> = [];
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
      return overrideGlobals ? undefined : originalClearTimeout(...args);
    },
  });

  const source = new Subject<number>();
  const observable = pipe(source, audit(100), materialize());

  // Act
  observable.subscribe(
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

Deno.test(
  "audit should handle reentrant source next when the audited observer receives next",
  () => {
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
    const observable = pipe(source, audit(100), materialize());

    // Act
    observable.subscribe(
      new Observer((notification) => {
        notifications.push(notification);
        if (notification[0] === "next" && notification[1] === 1) {
          source.next(2);
        }
      }),
    );

    source.next(1);
    (setTimeoutCalls[setTimeoutCalls.length - 1][0] as () => void)();
    if (notifications.length < 2) {
      (setTimeoutCalls[setTimeoutCalls.length - 1][0] as () => void)();
    }

    // Assert
    assertEquals(notifications, [["next", 1], ["next", 2]]);
    overrideGlobals = false;
  },
);

Deno.test(
  "audit should handle multiple reentrant source next calls when the audited observer receives next",
  () => {
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
    const observable = pipe(source, audit(100), materialize());

    // Act
    observable.subscribe(
      new Observer((notification) => {
        notifications.push(notification);
        if (notification[0] === "next" && notification[1] === 1) {
          source.next(2);
          source.next(3);
        }
      }),
    );

    source.next(1);
    (setTimeoutCalls[setTimeoutCalls.length - 1][0] as () => void)();
    if (notifications.length < 2) {
      (setTimeoutCalls[setTimeoutCalls.length - 1][0] as () => void)();
    }

    // Assert
    assertEquals(notifications, [["next", 1], ["next", 3]]);
    overrideGlobals = false;
  },
);

Deno.test(
  "audit should handle reentrant source return when the audited observer receives next",
  () => {
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
    const observable = pipe(source, audit(100), materialize());

    // Act
    observable.subscribe(
      new Observer((notification) => {
        notifications.push(notification);
        if (notification[0] === "next" && notification[1] === 1) {
          source.return();
        }
      }),
    );

    source.next(1);
    (setTimeoutCalls[setTimeoutCalls.length - 1][0] as () => void)();

    // Assert
    assertEquals(notifications, [["next", 1], ["return"]]);
    overrideGlobals = false;
  },
);

Deno.test("audit should throw when called with no arguments", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => audit(...([] as unknown as Parameters<typeof audit>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("audit should throw when milliseconds is not a number", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => audit("s" as unknown as number),
    TypeError,
    "Parameter 1 is not of type 'Number'",
  );
});

Deno.test("audit should throw when called with no source", () => {
  // Arrange
  const operator = audit(100);

  // Act / Assert
  assertThrows(
    () => operator(...([] as unknown as Parameters<typeof operator>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("audit should throw when source is not an Observable", () => {
  // Arrange
  const operator = audit(100);

  // Act / Assert
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => operator(1 as any),
    TypeError,
    "Parameter 1 is not of type 'Observable'",
  );
});
