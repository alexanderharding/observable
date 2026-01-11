import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { Observable, Observer } from "@xan/observable-core";
import { AsyncSubject } from "./async-subject.ts";
import { materialize, type ObserverNotification } from "./materialize.ts";
import { pipe } from "./pipe.ts";

Deno.test("AsyncSubject.toString should be '[object AsyncSubject]'", () => {
  // Arrange / Act / Assert
  assertStrictEquals(`${new AsyncSubject()}`, "[object AsyncSubject]");
});

Deno.test("AsyncSubject.constructor should be frozen", () => {
  // Arrange / Act / Assert
  assertStrictEquals(Object.isFrozen(AsyncSubject), true);
});

Deno.test("AsyncSubject should be frozen", () => {
  // Arrange / Act / Assert
  assertStrictEquals(Object.isFrozen(new AsyncSubject()), true);
});

Deno.test("AsyncSubject.prototype should be frozen", () => {
  // Arrange / Act / Assert
  assertStrictEquals(Object.isFrozen(AsyncSubject.prototype), true);
});

Deno.test(
  "AsyncSubject.constructor should not throw when creating with arguments",
  () => {
    // Arrange / Act / Assert
    new AsyncSubject(
      ...([1, 2, 3] as unknown as ConstructorParameters<typeof AsyncSubject>),
    );
  },
);

Deno.test(
  "AsyncSubject.constructor should throw when creating with arguments",
  () => {
    // Arrange / Act / Assert
    new AsyncSubject(
      ...([1, 2, 3] as unknown as ConstructorParameters<typeof AsyncSubject>),
    );
  },
);

Deno.test(
  "AsyncSubject should be an Observer which can be given to Observable.subscribe",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const source = new Observable<number>((observer) => {
      for (const value of [1, 2, 3, 4, 5]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    });
    const subject = new AsyncSubject<number>();

    // Act
    pipe(subject, materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );
    source.subscribe(subject);

    // Assert
    assertEquals(notifications, [["N", 5], ["R"]]);
  },
);

Deno.test("AsyncSubject should only emit the last value on return", () => {
  // Arrange
  const subject = new AsyncSubject<string>();
  const notifications: Array<ObserverNotification<string>> = [];

  // Act
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  subject.next("foo");
  subject.next("bar");
  subject.return();

  // Assert
  assertEquals(notifications, [["N", "bar"], ["R"]]);
});

Deno.test("AsyncSubject should not emit if no value is nexted", () => {
  // Arrange
  const subject = new AsyncSubject<string>();
  const notifications: Array<ObserverNotification<string>> = [];

  // Act
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  subject.return();

  // Assert
  assertEquals(notifications, [["R"]]);
});

Deno.test("AsyncSubject should emit last value to late subscribers", () => {
  // Arrange
  const subject = new AsyncSubject<string>();
  const notifications: Array<ObserverNotification<string>> = [];

  // Act
  subject.next("foo");
  subject.next("bar");
  subject.return();
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["N", "bar"], ["R"]]);
});

Deno.test(
  "AsyncSubject should not emit to late subscribers if no value was nexted",
  () => {
    // Arrange
    const subject = new AsyncSubject<string>();
    const notifications: Array<ObserverNotification<string>> = [];

    // Act
    subject.return();
    pipe(subject, materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [["R"]]);
  },
);

Deno.test("AsyncSubject should not emit values until return", () => {
  // Arrange
  const subject = new AsyncSubject<string>();
  const notifications: Array<ObserverNotification<string>> = [];
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Act
  subject.next("foo");
  subject.next("bar");

  // Assert
  assertEquals(notifications, []);
});

Deno.test("AsyncSubject.throw should pass through this subject", () => {
  // Arrange
  const error = new Error("test error");
  const subject = new AsyncSubject<string>();
  const notifications: Array<ObserverNotification<string>> = [];
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Act
  subject.next("foo");
  subject.throw(error);

  // Assert
  assertEquals(notifications, [["T", error]]);
});

Deno.test("AsyncSubject.throw should notify late subscribers", () => {
  // Arrange
  let overrideGlobals = true;
  const error = new Error("test error");
  const subject = new AsyncSubject<string>();
  const queueMicrotaskCalls: Array<
    Parameters<typeof globalThis.queueMicrotask>
  > = [];
  const notifications: Array<ObserverNotification<string>> = [];
  Object.defineProperty(globalThis, "queueMicrotask", {
    value: new Proxy(globalThis.queueMicrotask, {
      apply: (
        target,
        thisArg,
        argumentsList: Parameters<typeof globalThis.queueMicrotask>,
      ) => {
        queueMicrotaskCalls.push(argumentsList);
        if (!overrideGlobals) Reflect.apply(target, thisArg, argumentsList);
      },
    }),
  });

  // Act
  subject.next("foo");
  subject.throw(error);
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["T", error]]);
  assertStrictEquals(queueMicrotaskCalls.length, 1);
  assertThrows(queueMicrotaskCalls[0][0], Error, "test error");
  overrideGlobals = false;
});

Deno.test(
  "AsyncSubject.throw should throw in microtask queue if there are no observers",
  () => {
    // Arrange
    let overrideGlobals = true;
    const error = new Error("test error");
    const subject = new AsyncSubject<string>();
    const queueMicrotaskCalls: Array<
      Parameters<typeof globalThis.queueMicrotask>
    > = [];
    Object.defineProperty(globalThis, "queueMicrotask", {
      value: new Proxy(globalThis.queueMicrotask, {
        apply: (
          target,
          thisArg,
          argumentsList: Parameters<typeof globalThis.queueMicrotask>,
        ) => {
          queueMicrotaskCalls.push(argumentsList);
          if (!overrideGlobals) Reflect.apply(target, thisArg, argumentsList);
        },
      }),
    });

    // Act
    subject.throw(error);

    // Assert
    assertStrictEquals(queueMicrotaskCalls.length, 1);
    assertThrows(queueMicrotaskCalls[0][0], Error, "test error");
    overrideGlobals = false;
  },
);

Deno.test("AsyncSubject.return should pass through this subject", () => {
  // Arrange
  const subject = new AsyncSubject<string>();
  const notifications: Array<ObserverNotification<string>> = [];
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Act
  subject.next("foo");
  subject.return();

  // Assert
  assertEquals(notifications, [["N", "foo"], ["R"]]);
});

Deno.test("AsyncSubject.return should notify late subscribers", () => {
  // Arrange
  const subject = new AsyncSubject<string>();
  const notifications: Array<ObserverNotification<string>> = [];

  // Act
  subject.next("foo");
  subject.return();
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["N", "foo"], ["R"]]);
});

Deno.test(
  "AsyncSubject should enforce the correct 'this' binding when calling instance methods",
  () => {
    // Arrange
    const subject = new AsyncSubject();
    assertThrows(
      () => subject.next.call(null, 1),
      TypeError,
      "'this' is not instanceof 'AsyncSubject'",
    );
    assertThrows(
      () => subject.return.call(null),
      TypeError,
      "'this' is not instanceof 'AsyncSubject'",
    );
    assertThrows(
      () => subject.throw.call(null, new Error("test")),
      TypeError,
      "'this' is not instanceof 'AsyncSubject'",
    );
    assertThrows(
      () => subject.subscribe.call(null, new Observer()),
      TypeError,
      "'this' is not instanceof 'AsyncSubject'",
    );
  },
);
