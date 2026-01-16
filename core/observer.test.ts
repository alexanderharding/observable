import { noop } from "@observable/internal";
import { Observer } from "./observer.ts";
import { assertEquals, assertInstanceOf, assertStrictEquals, assertThrows } from "@std/assert";
import { isObserver } from "./is-observer.ts";

Deno.test("Observer.constructor should create with undefined", () => {
  // Arrange / Act / Assert
  new Observer(undefined);
});

Deno.test("Observer.toString should be '[object Observer]'", () => {
  // Arrange / Act / Assert
  assertStrictEquals(`${new Observer()}`, "[object Observer]");
});

Deno.test("Observer.constructor should be frozen", () => {
  // Arrange / Act / Assert
  assertStrictEquals(Object.isFrozen(Observer), true);
});

Deno.test("Observer.constructor should be created as frozen", () => {
  // Arrange / Act / Assert
  assertStrictEquals(Object.isFrozen(new Observer()), true);
});

Deno.test("Observer.prototype should be frozen", () => {
  // Arrange / Act / Assert
  assertStrictEquals(Object.isFrozen(Observer.prototype), true);
});

Deno.test("Observer.constructor should create with no arguments", () => {
  // Arrange / Act / Assert
  new Observer();
});

Deno.test("Observer.constructor should create with null", () => {
  // Arrange / Act / Assert
  new Observer(null);
});

Deno.test("Observer.constructor should create with next function", () => {
  // Arrange
  const calls: Array<Parameters<Observer["next"]>> = [];
  const next: Observer["next"] = (value) => calls.push([value]);

  // Act
  const observer = new Observer(next);

  // Assert
  assertStrictEquals(observer.signal.aborted, false);
  observer.next(1);
  assertEquals(calls, [[1]]);
});

Deno.test("Observer.constructor should create with partial observer", () => {
  // Arrange
  const calls: Array<Parameters<Observer["next"]>> = [];
  const next: Observer["next"] = (value) => calls.push([value]);

  // Act
  const observer = new Observer({ next });

  // Assert
  assertStrictEquals(observer.signal.aborted, false);
  observer.next(1);
  assertEquals(calls, [[1]]);
});

Deno.test(
  "Observer.constructor should throw when creating with invalid observer",
  () => {
    // Arrange / Act / Assert
    assertThrows(
      // This type-cast is necessary for this test case.
      // deno-lint-ignore no-explicit-any
      () => new Observer(1 as any),
      TypeError,
      "Parameter 1 is not of type '(Partial<Observer> or Observer['next'])'",
    );
    assertThrows(
      // This type-cast is necessary for this test case.
      // deno-lint-ignore no-explicit-any
      () => new Observer({ next: 1 as any }),
      TypeError,
      "Parameter 1 is not of type '(Partial<Observer> or Observer['next'])'",
    );
  },
);

Deno.test("Observer.constructor should create with full observer", () => {
  // Arrange
  const nextCalls: Array<Parameters<Observer["next"]>> = [];
  const throwCalls: Array<Parameters<Observer["throw"]>> = [];
  const returnCalls: Array<Parameters<Observer["return"]>> = [];
  const controller = new AbortController();

  // Act
  const observer = new Observer({
    next: (...args) => nextCalls.push(args),
    throw: (...args) => throwCalls.push(args),
    return: (...args) => returnCalls.push(args),
    signal: controller.signal,
  });
  // Assert
  assertStrictEquals(observer.signal.aborted, false);
  observer.next(1);
  observer.return();
  assertEquals(nextCalls, [[1]]);
  assertEquals(throwCalls, []);
  assertEquals(returnCalls, [[]]);
});

Deno.test(
  "Observer.constructor should abort when consumer signal is already aborted",
  () => {
    // Arrange
    const nextCalls: Array<Parameters<Observer["next"]>> = [];
    const throwCalls: Array<Parameters<Observer["throw"]>> = [];
    const returnCalls: Array<Parameters<Observer["return"]>> = [];
    const reason = Symbol("reason");
    const controller = new AbortController();
    controller.abort(reason);

    // Act
    const observer = new Observer({
      next: (...args) => nextCalls.push(args),
      throw: (...args) => throwCalls.push(args),
      return: (...args) => returnCalls.push(args),
      signal: controller.signal,
    });

    // Assert
    assertStrictEquals(observer.signal.aborted, true);
    assertStrictEquals(observer.signal.reason, reason);
    assertEquals(nextCalls, []);
    assertEquals(throwCalls, []);
    assertEquals(returnCalls, []);
  },
);

Deno.test(
  "Observer.constructor should abort when provided signal is already aborted",
  () => {
    // Arrange
    const nextCalls: Array<Parameters<Observer["next"]>> = [];
    const throwCalls: Array<Parameters<Observer["throw"]>> = [];
    const returnCalls: Array<Parameters<Observer["return"]>> = [];
    const reason = Symbol("reason");
    const controller = new AbortController();
    controller.abort(reason);

    // Act
    const observer = new Observer({
      next: (...args) => nextCalls.push(args),
      throw: (...args) => throwCalls.push(args),
      return: (...args) => returnCalls.push(args),
      signal: controller.signal,
    });

    // Assert
    assertStrictEquals(observer.signal.aborted, true);
    assertStrictEquals(observer.signal.reason, reason);
    assertEquals(returnCalls, []);
    assertEquals(nextCalls, []);
    assertEquals(throwCalls, []);
  },
);

Deno.test("Observer.next should not emit when aborted", () => {
  // Arrange
  const controller = new AbortController();
  const nextCalls: Array<Parameters<Observer["next"]>> = [];
  const throwCalls: Array<Parameters<Observer["throw"]>> = [];
  const returnCalls: Array<Parameters<Observer["return"]>> = [];
  const observer = new Observer({
    next: (...args) => nextCalls.push(args),
    throw: (...args) => throwCalls.push(args),
    return: (...args) => returnCalls.push(args),
    signal: controller.signal,
  });
  controller.abort();

  // Act
  observer.next(1);

  // Assert
  assertEquals(nextCalls, []);
  assertEquals(throwCalls, []);
  assertEquals(returnCalls, []);
});

Deno.test("Observer.next should call error when next throws", () => {
  // Arrange
  const error = new Error("test error");
  const throwCalls: Array<Parameters<Observer["throw"]>> = [];
  const observer = new Observer({
    next: () => {
      throw error;
    },
    throw: (...args) => throwCalls.push(args),
  });

  // Act
  observer.next(1);

  // Assert
  assertEquals(throwCalls, [[error]]);
});

Deno.test("Observer.next should throw with incorrect 'this' binding", () => {
  // Arrange
  assertThrows(
    () => new Observer().next.call(null, 1),
    TypeError,
    "'this' is not instanceof 'Observer'",
  );
});

Deno.test("Observer.throw should be a noop when aborted", () => {
  // Arrange
  const controller = new AbortController();
  const nextCalls: Array<Parameters<Observer["next"]>> = [];
  const throwCalls: Array<Parameters<Observer["throw"]>> = [];
  const returnCalls: Array<Parameters<Observer["return"]>> = [];
  const observer = new Observer({
    next: (...args) => nextCalls.push(args),
    throw: (...args) => throwCalls.push(args),
    return: (...args) => returnCalls.push(args),
    signal: controller.signal,
  });
  controller.abort();

  // Act
  observer.throw(new Error("test"));

  // Assert
  assertEquals(throwCalls, []);
  assertEquals(returnCalls, []);
  assertEquals(nextCalls, []);
});

Deno.test("Observer.throw should call the throw handler when present", () => {
  // Arrange
  const error = new Error("test");
  const throwCalls: Array<Parameters<Observer["throw"]>> = [];
  const observer = new Observer({ throw: (...args) => throwCalls.push(args) });

  // Act
  observer.throw(error);

  // Assert
  assertEquals(throwCalls, [[error]]);
  assertStrictEquals(observer.signal.aborted, true);
  assertInstanceOf(observer.signal.reason, DOMException);
});

Deno.test("Observer.throw should throw with incorrect 'this' binding", () => {
  // Arrange
  assertThrows(
    () => new Observer().throw.call(null, new Error("test")),
    TypeError,
    "'this' is not instanceof 'Observer'",
  );
});

Deno.test(
  "Observer.throw should report unhandled error when throw handler is not present",
  () => {
    // Arrange
    let proxy = true;
    const error = new Error("test");
    const queueMicrotaskCalls: Array<
      Parameters<typeof globalThis.queueMicrotask>
    > = [];
    const observer = new Observer({});
    Object.defineProperty(globalThis, "queueMicrotask", {
      value: new Proxy(globalThis.queueMicrotask, {
        apply: (
          target,
          _,
          argumentsList: Parameters<typeof globalThis.queueMicrotask>,
        ) => {
          queueMicrotaskCalls.push(argumentsList);
          if (!proxy) return target(...argumentsList);
        },
      }),
    });

    // Act
    observer.throw(error);

    // Assert
    assertStrictEquals(queueMicrotaskCalls.length, 1);
    assertThrows(() => queueMicrotaskCalls[0][0](), Error, "test");
    proxy = false;
  },
);

Deno.test(
  "Observer.throw should report unhandled error when throw handler throws",
  () => {
    // Arrange
    let proxy = true;
    const error = new Error("test");
    const throwError = new Error("error handler threw");
    const throwCalls: Array<Parameters<Observer["throw"]>> = [];
    const observer = new Observer({
      throw: (...args) => {
        throwCalls.push(args);
        throw throwError;
      },
    });
    const queueMicrotaskCalls: Array<
      Parameters<typeof globalThis.queueMicrotask>
    > = [];
    Object.defineProperty(globalThis, "queueMicrotask", {
      value: new Proxy(globalThis.queueMicrotask, {
        apply: (
          target,
          _,
          argumentsList: Parameters<typeof globalThis.queueMicrotask>,
        ) => {
          queueMicrotaskCalls.push(argumentsList);
          if (!proxy) return target.apply(target, argumentsList);
        },
      }),
    });

    // Act
    observer.throw(error);

    // Assert
    assertStrictEquals(queueMicrotaskCalls.length, 1);
    assertThrows(
      () => queueMicrotaskCalls[0][0](),
      Error,
      "error handler threw",
    );
    proxy = false;
  },
);

Deno.test("Observer.return should be a noop when aborted", () => {
  // Arrange
  const controller = new AbortController();
  const throwCalls: Array<Parameters<Observer["throw"]>> = [];
  const returnCalls: Array<Parameters<Observer["return"]>> = [];
  const nextCalls: Array<Parameters<Observer["next"]>> = [];
  const observer = new Observer({
    next: (...args) => nextCalls.push(args),
    throw: (...args) => throwCalls.push(args),
    return: (...args) => returnCalls.push(args),
    signal: controller.signal,
  });
  controller.abort();

  // Act
  observer.return();

  // Assert
  assertEquals(throwCalls, []);
  assertEquals(returnCalls, []);
  assertEquals(nextCalls, []);
});

Deno.test("Observer.return should throw with incorrect 'this' binding", () => {
  // Arrange
  assertThrows(
    () => new Observer().return.call(null),
    TypeError,
    "'this' is not instanceof 'Observer'",
  );
});

Deno.test(
  "Observer.return should call handlers correctly when observer is not aborted",
  () => {
    // Arrange
    const throwCalls: Array<Parameters<Observer["throw"]>> = [];
    const returnCalls: Array<Parameters<Observer["return"]>> = [];
    const nextCalls: Array<Parameters<Observer["next"]>> = [];
    const observer = new Observer({
      next: (...args) => nextCalls.push(args),
      throw: (...args) => throwCalls.push(args),
      return: (...args) => returnCalls.push(args),
    });
    const abortCalls: Array<[event: Event]> = [];
    const abortFn: Parameters<AbortSignal["addEventListener"]>[1] = (...args) =>
      abortCalls.push(args);
    observer.signal.addEventListener("abort", abortFn);

    // Act
    observer.return();

    // Assert
    assertStrictEquals(abortCalls.length, 1);
    assertEquals(returnCalls, [[]]);
    assertEquals(throwCalls, []);
    assertEquals(nextCalls, []);
  },
);

Deno.test(
  "Observer.return should report unhandled error when return handler throws",
  () => {
    // Arrange
    let proxy = true;
    // const error = new Error("test");
    const throwError = new Error("return handler threw");
    const returnCalls: Array<Parameters<Observer["return"]>> = [];
    const observer = new Observer({
      return: (...args) => {
        returnCalls.push(args);
        throw throwError;
      },
    });
    const queueMicrotaskCalls: Array<
      Parameters<typeof globalThis.queueMicrotask>
    > = [];
    Object.defineProperty(globalThis, "queueMicrotask", {
      value: new Proxy(globalThis.queueMicrotask, {
        apply: (
          target,
          _,
          argumentsList: Parameters<typeof globalThis.queueMicrotask>,
        ) => {
          queueMicrotaskCalls.push(argumentsList);
          if (!proxy) return target.apply(target, argumentsList);
        },
      }),
    });

    // Act
    observer.return();

    // Assert
    assertStrictEquals(queueMicrotaskCalls.length, 1);
    assertThrows(
      () => queueMicrotaskCalls[0][0](),
      Error,
      "return handler threw",
    );
    proxy = false;
  },
);

Deno.test(
  "isObserver should return true if the value is an instance of Observer",
  () => {
    // Arrange
    const observer = new Observer();

    // Act
    const result = isObserver(observer);

    // Assert
    assertStrictEquals(result, true);
  },
);

Deno.test(
  "isObserver should return true if the value is a custom Observer",
  () => {
    // Arrange
    const observer: Observer = {
      next: noop,
      return: noop,
      throw: noop,
      signal: new AbortController().signal,
    };

    // Act
    const result = isObserver(observer);

    // Assert
    assertStrictEquals(result, true);
  },
);

Deno.test(
  "isObserver should return false if the value is not an empty object",
  () => {
    // Arrange
    const value = {};

    // Act
    const result = isObserver(value);

    // Assert
    assertStrictEquals(result, false);
  },
);
