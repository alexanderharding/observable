import { assertEquals, assertInstanceOf, assertStrictEquals, assertThrows } from "@std/assert";
import { Subject } from "./subject.ts";
import { Observer } from "./observer.ts";
import { Observable } from "./observable.ts";

Deno.test("Subject.toString should be '[object Subject]'", () => {
  // Arrange / Act / Assert
  assertStrictEquals(`${new Subject()}`, "[object Subject]");
});

Deno.test("Subject.constructor should be frozen", () => {
  // Arrange / Act / Assert
  assertStrictEquals(Object.isFrozen(Subject), true);
});

Deno.test("Subject should be frozen", () => {
  // Arrange / Act / Assert
  assertStrictEquals(Object.isFrozen(new Subject()), true);
});

Deno.test("Subject.prototype should be frozen", () => {
  // Arrange / Act / Assert
  assertStrictEquals(Object.isFrozen(Subject.prototype), true);
});

Deno.test(
  "Subject.constructor should throw when creating with arguments",
  () => {
    // Arrange / Act / Assert
    new Subject(
      ...([1, 2, 3] as unknown as ConstructorParameters<typeof Subject>),
    );
  },
);

Deno.test(
  "Subject should allow next with undefined or any when created with no type",
  () => {
    // Arrange
    const subject = new Subject();
    const notifications: Array<
      Readonly<["return"] | ["throw", unknown] | ["next", unknown]>
    > = [];

    // Act
    const value = Math.random();
    subject.subscribe(
      new Observer({
        next: (value) => notifications.push(["next", value]),
        return: () => notifications.push(["return"]),
        throw: (value) => notifications.push(["throw", value]),
      }),
    );
    subject.next(undefined);
    subject.next(value);
    subject.return();

    // Assert
    assertEquals(notifications, [
      ["next", undefined],
      ["next", value],
      ["return"],
    ]);
  },
);

Deno.test("Subject should allow empty next when created with void type", () => {
  // Arrange
  const subject = new Subject<void>();
  const notifications: Array<
    Readonly<["return"] | ["throw", unknown] | ["next", void]>
  > = [];

  // Act
  subject.subscribe(
    new Observer({
      next: (value) => notifications.push(["next", value]),
      return: () => notifications.push(["return"]),
      throw: (value) => notifications.push(["throw", value]),
    }),
  );
  subject.next();
  subject.return();

  // Assert
  assertEquals(notifications, [["next", void 0], ["return"]]);
});

Deno.test("Subject should pump values right on through itself", () => {
  // Arrange
  const subject = new Subject<string>();
  const notifications: Array<
    Readonly<["return"] | ["throw", unknown] | ["next", string]>
  > = [];

  // Act
  subject.subscribe(
    new Observer({
      next: (value) => notifications.push(["next", value]),
      return: () => notifications.push(["return"]),
      throw: (value) => notifications.push(["throw", value]),
    }),
  );
  subject.next("foo");
  subject.next("bar");
  subject.return();

  // Assert
  assertEquals(notifications, [["next", "foo"], ["next", "bar"], ["return"]]);
});

Deno.test("Subject should push values to multiple observers", () => {
  // Arrange
  const subject = new Subject<string>();
  const notifications: Array<
    [1 | 2, Readonly<["return"] | ["throw", unknown] | ["next", string]>]
  > = [];

  // Act
  subject.subscribe(
    new Observer({
      next: (value) => notifications.push([1, ["next", value]]),
      return: () => notifications.push([1, ["return"]]),
      throw: (value) => notifications.push([1, ["throw", value]]),
    }),
  );
  subject.subscribe(
    new Observer({
      next: (value) => notifications.push([2, ["next", value]]),
      return: () => notifications.push([2, ["return"]]),
      throw: (value) => notifications.push([2, ["throw", value]]),
    }),
  );
  subject.next("foo");
  subject.next("bar");
  subject.return();

  // Assert
  assertEquals(notifications, [
    [1, ["next", "foo"]],
    [2, ["next", "foo"]],
    [1, ["next", "bar"]],
    [2, ["next", "bar"]],
    [1, ["return"]],
    [2, ["return"]],
  ]);
});

Deno.test(
  "Subject should handle observers that arrive and leave at different times but subject does not return",
  () => {
    // Arrange
    const subject = new Subject<number>();
    const notifications: Array<
      [1 | 2 | 3, Readonly<["return"] | ["throw", unknown] | ["next", number]>]
    > = [];
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    const controller3 = new AbortController();

    // Act - Initial values before any observers
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    // First subscriber joins
    subject.subscribe(
      new Observer({
        next: (value) => notifications.push([1, ["next", value]]),
        return: () => notifications.push([1, ["return"]]),
        throw: (value) => notifications.push([1, ["throw", value]]),
        signal: controller1.signal,
      }),
    );
    subject.next(5);

    // Second subscriber joins
    subject.subscribe(
      new Observer({
        next: (value) => notifications.push([2, ["next", value]]),
        return: () => notifications.push([2, ["return"]]),
        throw: (value) => notifications.push([2, ["throw", value]]),
        signal: controller2.signal,
      }),
    );
    subject.next(6);
    subject.next(7);

    // First subscriber leaves
    controller1.abort();
    subject.next(8);

    // Second subscriber leaves
    controller2.abort();
    subject.next(9);
    subject.next(10);

    // Third subscriber joins and leaves
    subject.subscribe(
      new Observer({
        next: (value) => notifications.push([3, ["next", value]]),
        return: () => notifications.push([3, ["return"]]),
        throw: (value) => notifications.push([3, ["throw", value]]),
        signal: controller3.signal,
      }),
    );
    subject.next(11);
    controller3.abort();

    // Assert
    assertEquals(notifications, [
      [1, ["next", 5]],
      [1, ["next", 6]],
      [2, ["next", 6]],
      [1, ["next", 7]],
      [2, ["next", 7]],
      [2, ["next", 8]],
      [3, ["next", 11]],
    ]);
  },
);

Deno.test(
  "Subject should handle observers that arrive and leave at different times, subject returns",
  () => {
    // Arrange
    const subject = new Subject<number>();
    const notifications: Array<
      [1 | 2 | 3, Readonly<["return"] | ["throw", unknown] | ["next", number]>]
    > = [];
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    const controller3 = new AbortController();

    // Act - Initial values before any observers
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    // First subscriber joins
    subject.subscribe(
      new Observer({
        next: (value) => notifications.push([1, ["next", value]]),
        return: () => notifications.push([1, ["return"]]),
        throw: (value) => notifications.push([1, ["throw", value]]),
        signal: controller1.signal,
      }),
    );
    subject.next(5);

    // Second subscriber joins
    subject.subscribe(
      new Observer({
        next: (value) => notifications.push([2, ["next", value]]),
        return: () => notifications.push([2, ["return"]]),
        throw: (value) => notifications.push([2, ["throw", value]]),
        signal: controller2.signal,
      }),
    );
    subject.next(6);
    subject.next(7);

    // First subscriber leaves
    controller1.abort();

    // Subject returns
    subject.return();

    // Second subscriber leaves
    controller2.abort();

    // Third subscriber joins and leaves after completion
    subject.subscribe(
      new Observer({
        next: (value) => notifications.push([3, ["next", value]]),
        return: () => notifications.push([3, ["return"]]),
        throw: (value) => notifications.push([3, ["throw", value]]),
        signal: controller3.signal,
      }),
    );
    controller3.abort();

    // Assert
    assertEquals(notifications, [
      [1, ["next", 5]],
      [1, ["next", 6]],
      [2, ["next", 6]],
      [1, ["next", 7]],
      [2, ["next", 7]],
      [2, ["return"]],
      [3, ["return"]],
    ]);
  },
);

Deno.test(
  "Subject should handle observers that arrive and leave at different times, subject terminates with an error",
  () => {
    // Arrange
    const subject = new Subject<number>();
    const notifications: Array<
      [1 | 2 | 3, Readonly<["return"] | ["throw", unknown] | ["next", number]>]
    > = [];
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    const controller3 = new AbortController();
    const testError = new Error("err");

    // Act - Initial values before any observers
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    // First subscriber joins
    subject.subscribe(
      new Observer({
        next: (value) => notifications.push([1, ["next", value]]),
        return: () => notifications.push([1, ["return"]]),
        throw: (value) => notifications.push([1, ["throw", value]]),
        signal: controller1.signal,
      }),
    );
    subject.next(5);

    // Second subscriber joins
    subject.subscribe(
      new Observer({
        next: (value) => notifications.push([2, ["next", value]]),
        return: () => notifications.push([2, ["return"]]),
        throw: (value) => notifications.push([2, ["throw", value]]),
        signal: controller2.signal,
      }),
    );
    subject.next(6);
    subject.next(7);

    // First subscriber leaves
    controller1.abort();

    // Subject errors
    subject.throw(testError);

    // Second subscriber leaves
    controller2.abort();

    // Third subscriber joins and leaves after error
    subject.subscribe(
      new Observer({
        next: (value) => notifications.push([3, ["next", value]]),
        return: () => notifications.push([3, ["return"]]),
        throw: (value) => notifications.push([3, ["throw", value]]),
        signal: controller3.signal,
      }),
    );
    controller3.abort();

    // Assert
    assertEquals(notifications, [
      [1, ["next", 5]],
      [1, ["next", 6]],
      [2, ["next", 6]],
      [1, ["next", 7]],
      [2, ["next", 7]],
      [2, ["throw", testError]],
      [3, ["throw", testError]],
    ]);
  },
);

Deno.test(
  "Subject should handle observers that arrive and leave at different times, subject returns before nexting any value",
  () => {
    // Arrange
    const subject = new Subject<number>();
    const notifications: Array<
      [1 | 2 | 3, Readonly<["return"] | ["throw", unknown] | ["next", number]>]
    > = [];
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    const controller3 = new AbortController();

    // Act
    subject.subscribe(
      new Observer({
        next: (value) => notifications.push([1, ["next", value]]),
        return: () => notifications.push([1, ["return"]]),
        throw: (value) => notifications.push([1, ["throw", value]]),
        signal: controller1.signal,
      }),
    );
    subject.subscribe(
      new Observer({
        next: (value) => notifications.push([2, ["next", value]]),
        return: () => notifications.push([2, ["return"]]),
        throw: (value) => notifications.push([2, ["throw", value]]),
        signal: controller2.signal,
      }),
    );

    controller1.abort();
    subject.return();
    controller2.abort();

    subject.subscribe(
      new Observer({
        next: (value) => notifications.push([3, ["next", value]]),
        return: () => notifications.push([3, ["return"]]),
        throw: (value) => notifications.push([3, ["throw", value]]),
        signal: controller3.signal,
      }),
    );
    controller3.abort();

    // Assert
    assertEquals(notifications, [
      [2, ["return"]],
      [3, ["return"]],
    ]);
  },
);

Deno.test(
  "Subject should disallow new subscriber once subject has been returned",
  () => {
    // Arrange
    const subject = new Subject<number>();
    const notifications: Array<
      [1 | 2 | 3, Readonly<["return"] | ["throw", unknown] | ["next", number]>]
    > = [];
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    const controller3 = new AbortController();

    // Act
    subject.subscribe(
      new Observer({
        next: (value) => notifications.push([1, ["next", value]]),
        return: () => notifications.push([1, ["return"]]),
        throw: (value) => notifications.push([1, ["throw", value]]),
        signal: controller1.signal,
      }),
    );
    subject.next(1);
    subject.next(2);

    subject.subscribe(
      new Observer({
        next: (value) => notifications.push([2, ["next", value]]),
        return: () => notifications.push([2, ["return"]]),
        throw: (value) => notifications.push([2, ["throw", value]]),
        signal: controller2.signal,
      }),
    );
    subject.next(3);
    subject.next(4);
    subject.next(5);

    controller1.abort();
    controller2.abort();
    subject.return();

    subject.subscribe(
      new Observer({
        next: (value) => notifications.push([3, ["next", value]]),
        return: () => notifications.push([3, ["return"]]),
        throw: (value) => notifications.push([3, ["throw", value]]),
        signal: controller3.signal,
      }),
    );

    // Assert
    assertStrictEquals(subject.signal.aborted, true);
    assertEquals(notifications, [
      [1, ["next", 1]],
      [1, ["next", 2]],
      [1, ["next", 3]],
      [2, ["next", 3]],
      [1, ["next", 4]],
      [2, ["next", 4]],
      [1, ["next", 5]],
      [2, ["next", 5]],
      [3, ["return"]],
    ]);
  },
);

Deno.test(
  "Subject should be an Observer which can be given to Observable.subscribe",
  () => {
    // Arrange
    const source = new Observable<number>((observer) => {
      for (const value of [1, 2, 3, 4, 5]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    });
    const subject = new Subject<number>();
    const notifications: Array<
      Readonly<["return"] | ["throw", unknown] | ["next", number]>
    > = [];

    // Act
    subject.subscribe(
      new Observer({
        next: (value) => notifications.push(["next", value]),
        return: () => notifications.push(["return"]),
        throw: (value) => notifications.push(["throw", value]),
      }),
    );
    source.subscribe(subject);

    // Assert
    assertEquals(notifications, [
      ["next", 1],
      ["next", 2],
      ["next", 3],
      ["next", 4],
      ["next", 5],
      ["return"],
    ]);
  },
);

Deno.test("Subject should be aborted after throwing", () => {
  // Arrange
  let proxy = true;
  const queueMicrotaskCalls: Array<
    Parameters<typeof globalThis.queueMicrotask>
  > = [];
  const subject = new Subject<string>();
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
  subject.throw(new Error("test"));

  // Assert
  assertStrictEquals(subject.signal.aborted, true);
  assertStrictEquals(queueMicrotaskCalls.length, 1);
  assertThrows(() => queueMicrotaskCalls[0][0](), Error, "test");
  proxy = false;
});

Deno.test("Subject should be aborted after return", () => {
  // Arrange
  const subject = new Subject<string>();

  // Act
  subject.return();

  // Assert
  assertStrictEquals(subject.signal.aborted, true);
  assertInstanceOf(subject.signal.reason, DOMException);
});

Deno.test("Subject should not next after returned", () => {
  // Arrange
  const subject = new Subject<string>();
  const notifications: Array<
    Readonly<["return"] | ["throw", unknown] | ["next", string]>
  > = [];

  // Act
  subject.subscribe(
    new Observer({
      next: (value) => notifications.push(["next", value]),
      return: () => notifications.push(["return"]),
      throw: (value) => notifications.push(["throw", value]),
    }),
  );
  subject.next("a");
  subject.return();
  subject.next("b");

  // Assert
  assertEquals(notifications, [["next", "a"], ["return"]]);
});

Deno.test("Subject should not next after error", () => {
  // Arrange
  const error = new Error("wut?");
  const subject = new Subject<string>();
  const notifications: Array<
    Readonly<["return"] | ["throw", unknown] | ["next", string]>
  > = [];

  // Act
  subject.subscribe(
    new Observer({
      next: (value) => notifications.push(["next", value]),
      return: () => notifications.push(["return"]),
      throw: (value) => notifications.push(["throw", value]),
    }),
  );
  subject.next("a");
  subject.throw(error);
  subject.next("b");

  // Assert
  assertEquals(notifications, [
    ["next", "a"],
    ["throw", error],
  ]);
});

Deno.test("Subject should handle reentrant observers when nexting", () => {
  // Arrange
  const notifications: Array<
    [1 | 2, Readonly<["return"] | ["throw", unknown] | ["next", number]>]
  > = [];
  const source = new Subject<number>();

  // Act
  source.subscribe(
    new Observer({
      next: (value) => {
        notifications.push([1, ["next", value]]);
        source.subscribe(
          new Observer({
            next: (value) => notifications.push([2, ["next", value]]),
            return: () => notifications.push([2, ["return"]]),
            throw: (value) => notifications.push([2, ["throw", value]]),
          }),
        );
      },
      return: () => notifications.push([1, ["return"]]),
      throw: (value) => notifications.push([1, ["throw", value]]),
    }),
  );

  source.next(1);
  source.next(2);
  source.next(3);

  // Assert
  assertEquals(notifications, [
    [1, ["next", 1]],
    [1, ["next", 2]],
    [2, ["next", 2]],
    [1, ["next", 3]],
    [2, ["next", 3]],
    [2, ["next", 3]],
  ]);
});

Deno.test("Subject should handle reentrant observers when returning", () => {
  // Arrange
  const notifications: Array<
    [1 | 2, Readonly<["return"] | ["throw", unknown] | ["next", number]>]
  > = [];
  const source = new Subject<number>();

  // Act
  source.subscribe(
    new Observer({
      next: (value) => notifications.push([1, ["next", value]]),
      return: () => {
        notifications.push([1, ["return"]]);
        source.subscribe(
          new Observer({
            next: (value) => notifications.push([2, ["next", value]]),
            return: () => notifications.push([2, ["return"]]),
            throw: (value) => notifications.push([2, ["throw", value]]),
          }),
        );
      },
      throw: (value) => notifications.push([1, ["throw", value]]),
    }),
  );
  source.return();

  // Assert
  assertEquals(notifications, [
    [1, ["return"]],
    [2, ["return"]],
  ]);
});

Deno.test("Subject should handle reentrant observers when throwing", () => {
  // Arrange
  const error = new Error("test");
  const notifications: Array<
    [1 | 2, Readonly<["return"] | ["throw", unknown] | ["next", number]>]
  > = [];
  const source = new Subject<number>();

  // Act
  source.subscribe(
    new Observer({
      next: (value) => notifications.push([1, ["next", value]]),
      return: () => notifications.push([1, ["return"]]),
      throw: (value) => {
        notifications.push([1, ["throw", value]]);
        source.subscribe(
          new Observer({
            next: (value) => notifications.push([2, ["next", value]]),
            return: () => notifications.push([2, ["return"]]),
            throw: (value) => notifications.push([2, ["throw", value]]),
          }),
        );
      },
    }),
  );

  source.throw(error);

  // Assert
  assertEquals(notifications, [
    [1, ["throw", error]],
    [2, ["throw", error]],
  ]);
});

Deno.test(
  "Subject should handle late observers when throwing starting with some observers",
  () => {
    // Arrange
    const error = new Error("test");
    const notifications: Array<
      [1 | 2, Readonly<["return"] | ["throw", unknown] | ["next", number]>]
    > = [];
    const source = new Subject<number>();

    // Act
    source.subscribe(
      new Observer({
        next: (value) => notifications.push([1, ["next", value]]),
        return: () => notifications.push([1, ["return"]]),
        throw: (value) => notifications.push([1, ["throw", value]]),
      }),
    );
    source.throw(error);
    source.subscribe(
      new Observer({
        next: (value) => notifications.push([2, ["next", value]]),
        return: () => notifications.push([2, ["return"]]),
        throw: (value) => notifications.push([2, ["throw", value]]),
      }),
    );

    source.throw(error);

    // Assert
    assertEquals(notifications, [
      [1, ["throw", error]],
      [2, ["throw", error]],
    ]);
  },
);

Deno.test(
  "Subject should handle late observers when throwing starting with no observers",
  () => {
    // Arrange
    let proxy = true;
    const error = new Error("test");
    const notifications: Array<
      [1 | 2, Readonly<["return"] | ["throw", unknown] | ["next", number]>]
    > = [];
    const source = new Subject<number>();
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
          if (!proxy) return target(...argumentsList);
        },
      }),
    });

    // Act

    source.throw(error);
    source.subscribe(
      new Observer({
        next: (value) => notifications.push([1, ["next", value]]),
        return: () => notifications.push([1, ["return"]]),
        throw: (value) => notifications.push([1, ["throw", value]]),
      }),
    );
    source.subscribe(
      new Observer({
        next: (value) => notifications.push([2, ["next", value]]),
        return: () => notifications.push([2, ["return"]]),
        throw: (value) => notifications.push([2, ["throw", value]]),
      }),
    );

    source.throw(error);

    // Assert
    assertEquals(notifications, [
      [1, ["throw", error]],
      [2, ["throw", error]],
    ]);
    assertStrictEquals(queueMicrotaskCalls.length, 1);
    assertThrows(() => queueMicrotaskCalls[0][0](), Error, "test");
    proxy = false;
  },
);

Deno.test(
  "Subject should enforce the correct 'this' binding when calling instance methods",
  () => {
    // Arrange
    const subject = new Subject();
    assertThrows(
      () => subject.next.call(null, 1),
      TypeError,
      "'this' is not instanceof 'Subject'",
    );
    assertThrows(
      () => subject.return.call(null),
      TypeError,
      "'this' is not instanceof 'Subject'",
    );
    assertThrows(
      () => subject.throw.call(null, new Error("test")),
      TypeError,
      "'this' is not instanceof 'Subject'",
    );
    assertThrows(
      () => subject.subscribe.call(null, new Observer()),
      TypeError,
      "'this' is not instanceof 'Subject'",
    );
  },
);
