import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { Observer } from "@observable/core";
import { noop } from "@observable/internal";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { ReplaySubject } from "./mod.ts";

Deno.test("ReplaySubject.toString should be '[object ReplaySubject]'", () => {
  // Arrange / Act / Assert
  assertStrictEquals(
    `${new ReplaySubject(Infinity)}`,
    "[object ReplaySubject]",
  );
});

Deno.test("ReplaySubject.constructor should be frozen", () => {
  // Arrange / Act / Assert
  assertStrictEquals(Object.isFrozen(ReplaySubject), true);
});

Deno.test("ReplaySubject should be frozen", () => {
  // Arrange / Act / Assert
  assertStrictEquals(Object.isFrozen(new ReplaySubject(Infinity)), true);
});

Deno.test("ReplaySubject.prototype should be frozen", () => {
  // Arrange / Act / Assert
  assertStrictEquals(Object.isFrozen(ReplaySubject.prototype), true);
});

Deno.test(
  "ReplaySubject.constructor should not throw when creating with more than one argument",
  () => {
    // Arrange / Act / Assert
    new ReplaySubject(
      ...([1, "foo", true] as unknown as ConstructorParameters<
        typeof ReplaySubject
      >),
    );
  },
);

Deno.test(
  "ReplaySubject should be an Observer which can be given to Observable.subscribe",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const source = of([1, 2, 3, 4, 5]);
    const subject = new ReplaySubject<number>(Infinity);

    // Act
    pipe(subject, materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
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

Deno.test(
  "ReplaySubject.subscribe should emit buffered values to subscribers",
  () => {
    // Arrange
    const subject = new ReplaySubject<string>(2);
    const notifications: Array<ObserverNotification<string>> = [];

    // Act
    subject.next("first");
    subject.next("second");
    subject.next("third");
    pipe(subject, materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ["next", "second"],
      ["next", "third"],
    ]);
  },
);

Deno.test(
  "ReplaySubject.subscribe should emit all values when buffer size is infinite",
  () => {
    // Arrange
    const subject = new ReplaySubject<string>(Infinity);
    const notifications: Array<ObserverNotification<string>> = [];

    // Act
    subject.next("first");
    subject.next("second");
    subject.next("third");
    pipe(subject, materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ["next", "first"],
      ["next", "second"],
      ["next", "third"],
    ]);
  },
);

Deno.test(
  "ReplaySubject.subscribe should emit buffered values to late subscribers",
  () => {
    // Arrange
    const subject = new ReplaySubject<string>(2);
    const notifications: Array<ObserverNotification<string>> = [];

    // Act
    subject.next("first");
    subject.next("second");
    subject.return();
    pipe(subject, materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ["next", "first"],
      ["next", "second"],
      ["return"],
    ]);
  },
);

Deno.test("ReplaySubject.next should emit values to subscribers", () => {
  // Arrange
  const subject = new ReplaySubject<string>(2);
  const notifications: Array<ObserverNotification<string>> = [];
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Act
  subject.next("foo");
  subject.next("bar");

  // Assert
  assertEquals(notifications, [
    ["next", "foo"],
    ["next", "bar"],
  ]);
});

Deno.test("ReplaySubject.next should store values for late subscribers", () => {
  // Arrange
  const subject = new ReplaySubject<string>(2);
  const notifications: Array<ObserverNotification<string>> = [];

  // Act
  subject.next("foo");
  subject.next("bar");
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", "foo"],
    ["next", "bar"],
  ]);
});

Deno.test("ReplaySubject.throw should pass through this subject", () => {
  // Arrange
  const error = new Error("test error");
  const subject = new ReplaySubject<string>(2);
  const notifications: Array<ObserverNotification<string>> = [];
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Act
  subject.next("foo");
  subject.next("bar");
  subject.throw(error);

  // Assert
  assertEquals(notifications, [
    ["next", "foo"],
    ["next", "bar"],
    ["throw", error],
  ]);
});

Deno.test("ReplaySubject.throw should notify late subscribers", () => {
  // Arrange
  const error = new Error("test error");
  const subject = new ReplaySubject<string>(2);
  const notifications: Array<ObserverNotification<string>> = [];
  subject.subscribe(new Observer({ throw: noop }));

  // Act
  subject.next("foo");
  subject.throw(error);
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", "foo"],
    ["throw", error],
  ]);
});

Deno.test("ReplaySubject.return should pass through this subject", () => {
  // Arrange
  const subject = new ReplaySubject<string>(2);
  const notifications: Array<ObserverNotification<string>> = [];
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Act
  subject.next("foo");
  subject.return();

  // Assert
  assertEquals(notifications, [["next", "foo"], ["return"]]);
});

Deno.test("ReplaySubject.return should notify late subscribers", () => {
  // Arrange
  const subject = new ReplaySubject<string>(2);
  const notifications: Array<ObserverNotification<string>> = [];

  // Act
  subject.next("foo");
  subject.return();
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["next", "foo"], ["return"]]);
});

Deno.test(
  "ReplaySubject should enforce the correct 'this' binding when calling instance methods",
  () => {
    // Arrange
    const subject = new ReplaySubject(Infinity);
    assertThrows(
      () => subject.next.call(null, 1),
      TypeError,
      "'this' is not instanceof 'ReplaySubject'",
    );
    assertThrows(
      () => subject.return.call(null),
      TypeError,
      "'this' is not instanceof 'ReplaySubject'",
    );
    assertThrows(
      () => subject.throw.call(null, new Error("test")),
      TypeError,
      "'this' is not instanceof 'ReplaySubject'",
    );
    assertThrows(
      () => subject.subscribe.call(null, new Observer()),
      TypeError,
      "'this' is not instanceof 'ReplaySubject'",
    );
  },
);
