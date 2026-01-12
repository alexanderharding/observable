import { Observer } from "@xan/observable-core";
import { materialize, type ObserverNotification, of, pipe } from "@xan/observable-common";
import { BroadcastSubject } from "./broadcast-subject.ts";
import { assertEquals, assertInstanceOf, assertStrictEquals, assertThrows } from "@std/assert";
import { noop } from "@xan/observable-internal";

Deno.test(
  "BroadcastSubject.toString should be '[object BroadcastSubject]'",
  () => {
    // Arrange
    const subject = new BroadcastSubject("test");

    // Act / Assert
    assertStrictEquals(`${subject}`, "[object BroadcastSubject]");
    subject.return();
  },
);

Deno.test("BroadcastSubject.constructor should be frozen", () => {
  // Arrange / Act / Assert
  assertStrictEquals(Object.isFrozen(BroadcastSubject), true);
});

Deno.test("BroadcastSubject should be frozen", () => {
  // Arrange
  const subject = new BroadcastSubject("test");

  // Act / Assert
  assertStrictEquals(Object.isFrozen(subject), true);
  subject.return();
});

Deno.test("BroadcastSubject.prototype should be frozen", () => {
  // Arrange / Act / Assert
  assertStrictEquals(Object.isFrozen(BroadcastSubject.prototype), true);
});

Deno.test(
  "BroadcastSubject.constructor should throw when creating with 0 arguments",
  () => {
    // Arrange / Act / Assert
    assertThrows(
      () =>
        new BroadcastSubject(
          ...([] as unknown as ConstructorParameters<typeof BroadcastSubject>),
        ),
      TypeError,
      "1 argument required but 0 present",
    );
  },
);

Deno.test(
  "BroadcastSubject.constructor should not throw when creating with more than one argument (first argument is a string)",
  () => {
    // Arrange / Act / Assert
    new BroadcastSubject(
      ...(["test", 1, 2, 3] as unknown as ConstructorParameters<
        typeof BroadcastSubject
      >),
    ).return();
  },
);

Deno.test(
  "BroadcastSubject.constructor should throw when creating with a non-string",
  () => {
    // Arrange / Act / Assert
    assertThrows(
      () => new BroadcastSubject(5 as unknown as string),
      TypeError,
      "Parameter 1 is not of type 'String'",
    );
  },
);

Deno.test(
  "BroadcastSubject should only receive messages from other subjects with same name",
  async () => {
    // Arrange
    const value = Math.random().toString();
    const name = Math.random().toString();
    const otherName = Math.random().toString();
    const senderSubject = new BroadcastSubject<string>(name);
    const receiverSubject = new BroadcastSubject<string>(name);
    const otherSubject = new BroadcastSubject<string>(otherName);
    const otherChannel = new BroadcastChannel(name);

    // Act
    const { resolve, reject, promise } = Promise.withResolvers();
    receiverSubject.subscribe(new Observer({ next: resolve, throw: reject }));
    otherSubject.next(value);
    otherChannel.postMessage(value);
    senderSubject.next(value);

    // Assert
    assertStrictEquals(await promise, value);
    senderSubject.return();
    receiverSubject.return();
    otherSubject.return();
    otherChannel.close();
  },
);

Deno.test(
  "BroadcastSubject should be an Observer which can be given to Observable.subscribe",
  () => {
    // Arrange
    const source = of([1, 2, 3, 4, 5]);
    const subject = new BroadcastSubject<number>("test");
    const notifications: Array<ObserverNotification<number>> = [];
    const postMessageCalls: Array<Parameters<BroadcastChannel["postMessage"]>> = [];
    Object.defineProperty(BroadcastChannel.prototype, "postMessage", {
      value: new Proxy(BroadcastChannel.prototype.postMessage, {
        apply: (target, thisArg, argumentsList: [message: unknown]) => {
          postMessageCalls.push(argumentsList);
          return target.apply(thisArg, argumentsList);
        },
      }),
    });

    // Act
    pipe(subject, materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );
    source.subscribe(subject);

    // Assert
    assertEquals(postMessageCalls, [[1], [2], [3], [4], [5]]);
    assertEquals(notifications, [["return"]]);
  },
);

Deno.test(
  "BroadcastSubject.next should call postMessage method on BroadcastChannel",
  () => {
    // Arrange
    const subject = new BroadcastSubject<string>("test");
    const postMessageCalls: Array<Parameters<BroadcastChannel["postMessage"]>> = [];
    Object.defineProperty(BroadcastChannel.prototype, "postMessage", {
      value: new Proxy(BroadcastChannel.prototype.postMessage, {
        apply: (target, thisArg, argumentsList: [message: unknown]) => {
          postMessageCalls.push(argumentsList);
          return target.apply(thisArg, argumentsList);
        },
      }),
    });

    // Act
    subject.next("foo");

    // Assert
    assertEquals(postMessageCalls, [["foo"]]);
    subject.return();
  },
);

Deno.test("BroadcastSubject.next should not abort signal", () => {
  // Arrange
  const subject = new BroadcastSubject<string>("test");

  // Act
  subject.next("foo");

  // Assert
  assertStrictEquals(subject.signal.aborted, false);
  subject.return();
});

Deno.test("BroadcastSubject.next should not close channel", () => {
  // Arrange
  const subject = new BroadcastSubject<string>("test");
  const closeCalls: Array<Parameters<BroadcastChannel["close"]>> = [];
  Object.defineProperty(BroadcastChannel.prototype, "close", {
    value: new Proxy(BroadcastChannel.prototype.close, {
      apply: (target, thisArg, argumentsList: []) => {
        closeCalls.push(argumentsList);
        return target.apply(thisArg, argumentsList);
      },
    }),
  });

  // Act
  subject.next("foo");

  // Assert
  assertEquals(closeCalls, []);
  subject.return();
});

Deno.test("BroadcastSubject.next should not pass through this subject", () => {
  // Arrange
  const subject = new BroadcastSubject<string>("test");
  const notifications: Array<ObserverNotification<string>> = [];
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Act
  subject.next("foo");

  // Assert
  assertEquals(notifications, []);
  subject.return();
});

Deno.test(
  "BroadcastSubject.next should not cause throw when called after return",
  () => {
    // Arrange
    const subject = new BroadcastSubject<string>("test");
    subject.return();

    // Act / Assert
    subject.next("foo");
  },
);

Deno.test(
  "BroadcastSubject.next should not cause throw when called after throw",
  () => {
    // Arrange
    const subject = new BroadcastSubject<string>("test");
    subject.subscribe(new Observer({ throw: noop }));
    subject.throw(new Error("test error"));

    // Act / Assert
    subject.next("foo");
  },
);

Deno.test(
  "should throw when postMessage method on BroadcastChannel throws an error",
  () => {
    // Arrange
    const subject = new BroadcastSubject<() => void>("test");
    const notifications: Array<ObserverNotification<() => void>> = [];
    pipe(subject, materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Act
    subject.next(() => {}); // Functions are not structured cloneable

    // Assert
    assertStrictEquals(notifications.length, 1);
    assertStrictEquals(notifications[0][0], "throw");
    assertInstanceOf(notifications[0][1], DOMException);
  },
);

Deno.test("BroadcastSubject.throw should pass through this subject", () => {
  // Arrange
  const error = new Error("test error");
  const subject = new BroadcastSubject<string>("test");
  const notifications: Array<ObserverNotification<string>> = [];
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Act
  subject.throw(error);

  // Assert
  assertEquals(notifications, [["throw", error]]);
});

Deno.test("BroadcastSubject.throw should close channel", () => {
  // Arrange
  const error = new Error("test error");
  const subject = new BroadcastSubject<string>("test");
  const notifications: Array<ObserverNotification<string>> = [];
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  const closeCalls: Array<Parameters<BroadcastChannel["close"]>> = [];
  Object.defineProperty(BroadcastChannel.prototype, "close", {
    value: new Proxy(BroadcastChannel.prototype.close, {
      apply: (target, thisArg, argumentsList: []) => {
        closeCalls.push(argumentsList);
        return target.apply(thisArg, argumentsList);
      },
    }),
  });

  // Act
  subject.throw(error);

  // Assert
  assertEquals(closeCalls, [[]]);
  assertEquals(notifications, [["throw", error]]);
});

Deno.test("BroadcastSubject.throw should abort signal", () => {
  // Arrange
  const error = new Error("test error");
  const subject = new BroadcastSubject<string>("test");
  subject.subscribe(new Observer({ throw: noop }));

  // Act
  subject.throw(error);

  // Assert
  assertStrictEquals(subject.signal.aborted, true);
  assertInstanceOf(subject.signal.reason, DOMException);
});

Deno.test(
  "BroadcastSubject.throw should abort signal before notifying subscribers",
  () => {
    // Arrange
    const error = new Error("test error");
    const subject = new BroadcastSubject<string>("test");
    const notifications: Array<ObserverNotification<string>> = [];
    const abortHandlerCalls: Array<Parameters<EventListener>> = [];
    pipe(subject, materialize()).subscribe(
      new Observer((notification) => {
        notifications.push(notification);
        if (notification[0] === "throw") {
          assertEquals(abortHandlerCalls.length, 1);
          assertInstanceOf(abortHandlerCalls[0][0], Event);
          assertStrictEquals(abortHandlerCalls[0][0].type, "abort");
        }
      }),
    );
    subject.signal.addEventListener("abort", (...args) => {
      abortHandlerCalls.push(args);
    });

    // Act
    subject.throw(error);

    // Assert
    assertEquals(notifications, [["throw", error]]);
  },
);

Deno.test("BroadcastSubject.return should pass through this subject", () => {
  // Arrange
  const subject = new BroadcastSubject<string>("test");
  const notifications: Array<ObserverNotification<string>> = [];
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Act
  subject.return();

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("BroadcastSubject.return should close channel", () => {
  // Arrange
  const subject = new BroadcastSubject<string>("test");
  const closeCalls: Array<Parameters<BroadcastChannel["close"]>> = [];
  Object.defineProperty(BroadcastChannel.prototype, "close", {
    value: new Proxy(BroadcastChannel.prototype.close, {
      apply: (target, thisArg, argumentsList: []) => {
        closeCalls.push(argumentsList);
        return target.apply(thisArg, argumentsList);
      },
    }),
  });

  // Act
  subject.return();

  // Assert
  assertEquals(closeCalls, [[]]);
});

Deno.test(
  "BroadcastSubject.return should abort signal before notifying subscribers",
  () => {
    // Arrange
    const subject = new BroadcastSubject<string>("test");
    const notifications: Array<ObserverNotification<string>> = [];
    const abortHandlerCalls: Array<Parameters<EventListener>> = [];
    pipe(subject, materialize()).subscribe(
      new Observer((notification) => {
        notifications.push(notification);
        if (notification[0] === "return") {
          assertEquals(abortHandlerCalls.length, 1);
          assertInstanceOf(abortHandlerCalls[0][0], Event);
          assertStrictEquals(abortHandlerCalls[0][0].type, "abort");
        }
      }),
    );
    subject.signal.addEventListener("abort", (...args) => {
      abortHandlerCalls.push(args);
    });

    // Act
    subject.return();

    // Assert
    assertEquals(notifications, [["return"]]);
  },
);
