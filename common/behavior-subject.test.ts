import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { Observable, Observer } from "@xan/observable-core";
import { materialize } from "./materialize.ts";
import type { ObserverNotification } from "./observer-notification.ts";
import { pipe } from "./pipe.ts";
import { BehaviorSubject, isBehaviorSubject } from "./behavior-subject.ts";

Deno.test("BehaviorSubject.value should return current value", () => {
  // Arrange
  const subject = new BehaviorSubject("initial");

  // Act
  const { value: value1 } = subject;
  subject.next("second");
  const { value: value2 } = subject;

  // Assert
  assertStrictEquals(value1, "initial");
  assertStrictEquals(value2, "second");
});

Deno.test("BehaviorSubject.value should not change after throw", () => {
  // Arrange
  const subject = new BehaviorSubject("initial");
  subject.subscribe(new Observer({ throw: () => {} })); // Silence the error

  // Act
  const { value: value1 } = subject;
  subject.throw(new Error("test error"));
  subject.next("second");
  const { value: value2 } = subject;

  // Assert
  assertStrictEquals(value1, "initial");
  assertStrictEquals(value2, "initial");
});

Deno.test("BehaviorSubject.value should not change after return", () => {
  // Arrange
  const subject = new BehaviorSubject("initial");

  // Act
  const { value: value1 } = subject;
  subject.return();
  subject.next("second");
  const { value: value2 } = subject;

  // Assert
  assertStrictEquals(value1, "initial");
  assertStrictEquals(value2, "initial");
});

Deno.test(
  "BehaviorSubject.constructor should not throw when creating with more than one argument",
  () => {
    // Arrange / Act / Assert
    new BehaviorSubject(
      ...([1, 2] as unknown as ConstructorParameters<typeof BehaviorSubject>),
    );
  },
);

Deno.test(
  "BehaviorSubject.constructor should throw when creating with no arguments",
  () => {
    // Arrange / Act / Assert
    assertThrows(
      () =>
        new BehaviorSubject(
          ...([] as unknown as ConstructorParameters<typeof BehaviorSubject>),
        ),
      TypeError,
      "1 argument required but 0 present",
    );
  },
);

Deno.test("BehaviorSubject should be created with an initial value", () => {
  // Arrange
  const value = Symbol("BehaviorSubject initial value");
  const subject = new BehaviorSubject(value);
  const notifications: Array<ObserverNotification<unknown>> = [];

  // Act
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["next", value]]);
});

Deno.test(
  "BehaviorSubject.subscribe should emit latest value to subscribers",
  () => {
    // Arrange
    const subject = new BehaviorSubject("initial");
    const notifications: Array<ObserverNotification<string>> = [];
    subject.next("second");

    // Act
    pipe(subject, materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [["next", "second"]]);
  },
);

Deno.test("BehaviorSubject.next should emit value to subscribers", () => {
  // Arrange
  const subject = new BehaviorSubject("initial");
  const notifications: Array<ObserverNotification<string>> = [];
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Act
  subject.next("foo");

  // Assert
  assertEquals(notifications, [
    ["next", "initial"],
    ["next", "foo"],
  ]);
});

Deno.test(
  "BehaviorSubject.next should store value for late subscribers",
  () => {
    // Arrange
    const subject = new BehaviorSubject("initial");
    const notifications: Array<ObserverNotification<string>> = [];

    // Act
    subject.next("foo");
    pipe(subject, materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [["next", "foo"]]);
  },
);

Deno.test("BehaviorSubject.throw should pass through this subject", () => {
  // Arrange
  const error = new Error("test error");
  const subject = new BehaviorSubject("initial");
  const notifications: Array<ObserverNotification<string>> = [];
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Act
  subject.throw(error);

  // Assert
  assertEquals(notifications, [
    ["next", "initial"],
    ["throw", error],
  ]);
});

Deno.test("BehaviorSubject.throw should notify late subscribers", () => {
  // Arrange
  const error = new Error("test error");
  const subject = new BehaviorSubject("initial");
  const notifications: Array<ObserverNotification<string>> = [];
  subject.subscribe(new Observer({ throw: () => {} }));

  // Act
  subject.throw(error);
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", "initial"],
    ["throw", error],
  ]);
});

Deno.test("BehaviorSubject.return should pass through this subject", () => {
  // Arrange
  const subject = new BehaviorSubject("initial");
  const notifications: Array<ObserverNotification<string>> = [];
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Act
  subject.return();

  // Assert
  assertEquals(notifications, [["next", "initial"], ["return"]]);
});

Deno.test("BehaviorSubject.return should notify late subscribers", () => {
  // Arrange
  const subject = new BehaviorSubject("initial");
  const notifications: Array<ObserverNotification<string>> = [];

  // Act
  subject.return();
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["next", "initial"], ["return"]]);
});

Deno.test(
  "BehaviorSubject should be an Observer which can be given to Observable.subscribe",
  () => {
    // Arrange
    const source = new Observable<number>((observer) => {
      [1, 2, 3, 4, 5].forEach((value) => observer.next(value));
      observer.return();
    });
    const subject = new BehaviorSubject(0);
    const notifications: Array<ObserverNotification<number>> = [];

    // Act
    pipe(subject, materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );
    source.subscribe(subject);

    // Assert
    assertEquals(notifications, [
      ["next", 0],
      ["next", 1],
      ["next", 2],
      ["next", 3],
      ["next", 4],
      ["next", 5],
      ["return"],
    ]);
  },
);

Deno.test(
  "Subject should enforce the correct 'this' binding when calling instance methods",
  () => {
    // Arrange
    const subject = new BehaviorSubject(2);

    assertThrows(
      () => BehaviorSubject.prototype.value,
      TypeError,
      "'this' is not instanceof 'BehaviorSubject'",
    );

    assertThrows(
      () => subject.next.call(null, 1),
      TypeError,
      "'this' is not instanceof 'BehaviorSubject'",
    );
    assertThrows(
      () => subject.return.call(null),
      TypeError,
      "'this' is not instanceof 'BehaviorSubject'",
    );
    assertThrows(
      () => subject.throw.call(null, new Error("test")),
      TypeError,
      "'this' is not instanceof 'BehaviorSubject'",
    );
    assertThrows(
      () => subject.subscribe.call(null, new Observer()),
      TypeError,
      "'this' is not instanceof 'BehaviorSubject'",
    );
  },
);

Deno.test(
  "isBehaviorSubject should return true if the value is an instance of BehaviorSubject",
  () => {
    // Arrange
    const behaviorSubject = new BehaviorSubject(Math.random());

    // Act
    const result = isBehaviorSubject(behaviorSubject);

    // Assert
    assertEquals(result, true);
  },
);

Deno.test(
  "isBehaviorSubject should return true if the value is a custom BehaviorSubject",
  () => {
    // Arrange
    const behaviorSubject: BehaviorSubject<number> = {
      value: Math.random(),
      subscribe: () => {},
      signal: new AbortController().signal,
      next: () => {},
      return: () => {},
      throw: () => {},
    };

    // Act
    const result = isBehaviorSubject(behaviorSubject);

    // Assert
    assertEquals(result, true);
  },
);

Deno.test(
  "isBehaviorSubject should return false if the value is an empty object",
  () => {
    // Arrange
    const value = {};

    // Act
    const result = isBehaviorSubject(value);

    // Assert
    assertEquals(result, false);
  },
);

Deno.test("isBehaviorSubject should return false if the value is null", () => {
  // Arrange
  const value = null;

  // Act
  const result = isBehaviorSubject(value);

  // Assert
  assertEquals(result, false);
});

Deno.test(
  "isBehaviorSubject should return false if the value is undefined",
  () => {
    // Arrange
    const value = undefined;

    // Act
    const result = isBehaviorSubject(value);

    // Assert
    assertEquals(result, false);
  },
);

Deno.test(
  "isBehaviorSubject should return false if 'subscribe' is not a function",
  () => {
    // Arrange
    const value:
      & Omit<BehaviorSubject, "subscribe">
      & Record<"subscribe", "not a function"> = {
        value: Math.random(),
        subscribe: "not a function",
        signal: new AbortController().signal,
        next: () => {},
        return: () => {},
        throw: () => {},
      };

    // Act
    const result = isBehaviorSubject(value);

    // Assert
    assertEquals(result, false);
  },
);

Deno.test(
  "isBehaviorSubject should return false if 'signal' is not an instance of AbortSignal",
  () => {
    // Arrange
    const value:
      & Omit<BehaviorSubject, "signal">
      & Record<"signal", "not an AbortSignal"> = {
        value: Math.random(),
        subscribe: () => {},
        signal: "not an AbortSignal",
        next: () => {},
        return: () => {},
        throw: () => {},
      };

    // Act
    const result = isBehaviorSubject(value);

    // Assert
    assertEquals(result, false);
  },
);

Deno.test("isBehaviorSubject should return false if 'value' is missing", () => {
  // Arrange
  const value: Omit<BehaviorSubject<number>, "value"> = {
    subscribe: () => {},
    signal: new AbortController().signal,
    next: () => {},
    return: () => {},
    throw: () => {},
  };

  // Act
  const result = isBehaviorSubject(value);

  // Assert
  assertEquals(result, false);
});

Deno.test(
  "isBehaviorSubject should return false if 'next' is not a function",
  () => {
    // Arrange
    const value:
      & Omit<BehaviorSubject<number>, "next">
      & Record<"next", "not a function"> = {
        value: Math.random(),
        subscribe: () => {},
        signal: new AbortController().signal,
        next: "not a function",
        return: () => {},
        throw: () => {},
      };

    // Act
    const result = isBehaviorSubject(value);

    // Assert
    assertEquals(result, false);
  },
);

Deno.test(
  "isBehaviorSubject should return false if 'return' is not a function",
  () => {
    // Arrange
    const value:
      & Omit<BehaviorSubject<number>, "return">
      & Record<"return", "not a function"> = {
        value: Math.random(),
        subscribe: () => {},
        signal: new AbortController().signal,
        next: () => {},
        return: "not a function",
        throw: () => {},
      };

    // Act
    const result = isBehaviorSubject(value);

    // Assert
    assertEquals(result, false);
  },
);

Deno.test(
  "isBehaviorSubject should return false if 'throw' is not a function",
  () => {
    // Arrange
    const value:
      & Omit<BehaviorSubject<number>, "throw">
      & Record<"throw", "not a function"> = {
        value: Math.random(),
        subscribe: () => {},
        signal: new AbortController().signal,
        next: () => {},
        return: () => {},
        throw: "not a function",
      };

    // Act
    const result = isBehaviorSubject(value);

    // Assert
    assertEquals(result, false);
  },
);

Deno.test(
  "isBehaviorSubject should return false if 'signal' is not an instance of AbortSignal",
  () => {
    // Arrange
    const value:
      & Omit<BehaviorSubject<number>, "signal">
      & Record<"signal", "not an AbortSignal"> = {
        value: Math.random(),
        subscribe: () => {},
        signal: "not an AbortSignal",
        next: () => {},
        return: () => {},
        throw: () => {},
      };

    // Act
    const result = isBehaviorSubject(value);

    // Assert
    assertEquals(result, false);
  },
);
