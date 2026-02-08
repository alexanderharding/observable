import { assertEquals, assertThrows } from "@std/assert";
import { Observable, Observer } from "@observable/core";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { pipe } from "@observable/pipe";
import { BehaviorSubject } from "./mod.ts";

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
  "BehaviorSubject.subscribe should emit latest value to observers",
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

Deno.test("BehaviorSubject.next should emit value to observers", () => {
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
  "BehaviorSubject.next should store value for late observers",
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

Deno.test("BehaviorSubject.throw should not notify late observers of current value", () => {
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

Deno.test("BehaviorSubject.return should not notify late observers of current value", () => {
  // Arrange
  const subject = new BehaviorSubject("initial");
  const notifications: Array<ObserverNotification<string>> = [];

  // Act
  subject.return();
  pipe(subject, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["return"]]);
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
  "BehaviorSubject should enforce the correct 'this' binding when calling instance methods",
  () => {
    // Arrange
    const subject = new BehaviorSubject(2);

    // Act / Assert
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
