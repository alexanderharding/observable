import { assertEquals, assertStrictEquals } from "@std/assert";
import { empty } from "@observable/empty";
import { Observer, Subject } from "@observable/core";
import { pipe } from "@observable/pipe";
import { throwError } from "@observable/throw-error";
import { flat } from "@observable/flat";
import { materialize, type ObserverNotification } from "@observable/materialize";

Deno.test("flat should flatten many inners", () => {
  // Arrange
  const a = new Subject<"a">();
  const b = new Subject<"b">();
  const c = new Subject<"c">();
  const d = new Subject<"d">();
  const notifications: Array<ObserverNotification<string>> = [];
  const observable = flat([a, b, c, d] as const);

  // Act
  pipe(observable, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  a.next("a");
  b.next("b");
  a.next("a");
  b.next("b");
  a.next("a");
  a.return();
  b.next("b");
  b.return();
  c.next("c");
  c.next("c");
  d.next("d");
  c.return();
  d.next("d");
  d.next("d");
  d.return();

  // Assert
  assertEquals(notifications, [
    ["next", "a"],
    ["next", "a"],
    ["next", "a"],
    ["next", "b"],
    ["next", "c"],
    ["next", "c"],
    ["next", "d"],
    ["next", "d"],
    ["return"],
  ]);
});

Deno.test("flat should flatten many inner, and inner throws", () => {
  // Arrange
  const error = new Error("error");
  const a = new Subject<"a">();
  const b = new Subject<"b">();
  const c = new Subject<"c">();
  const d = new Subject<"d">();
  const notifications: Array<ObserverNotification<string>> = [];
  const observable = flat([a, b, c, d] as const);

  // Act
  pipe(observable, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  a.next("a");
  b.next("b");
  a.next("a");
  b.next("b");
  a.next("a");
  a.return();
  b.next("b");
  b.return();
  c.next("c");
  c.next("c");
  d.next("d");
  c.throw(error);
  d.next("d");
  d.next("d");
  d.return();

  // Assert
  assertEquals(notifications, [
    ["next", "a"],
    ["next", "a"],
    ["next", "a"],
    ["next", "b"],
    ["next", "c"],
    ["next", "c"],
    ["throw", error],
  ]);
});

Deno.test("flat should flatten many inner, and outer throws", () => {
  // Arrange
  const error = new Error("error");
  const a = new Subject<"a">();
  const b = new Subject<"b">();
  const c = new Subject<"c">();
  const d = new Subject<"d">();
  const notifications: Array<ObserverNotification<string>> = [];
  const observable = flat([a, b, c, throwError(error), d] as const);

  // Act
  pipe(observable, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  a.next("a");
  b.next("b");
  a.next("a");
  b.next("b");
  a.next("a");
  a.return();
  b.next("b");
  b.return();
  c.next("c");
  c.next("c");
  d.next("d");
  c.return();
  d.next("d");
  d.next("d");
  d.return();

  // Assert
  assertEquals(notifications, [
    ["next", "a"],
    ["next", "a"],
    ["next", "a"],
    ["next", "b"],
    ["next", "c"],
    ["next", "c"],
    ["throw", error],
  ]);
});

Deno.test("flat should return empty when given an empty array", () => {
  // Arrange
  const notifications: Array<ObserverNotification> = [];
  const observable = flat([]);

  // Act
  pipe(observable, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertStrictEquals(observable, empty);
  assertEquals(notifications, [["return"]]);
});
