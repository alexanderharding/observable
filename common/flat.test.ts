import { assertEquals } from "@std/assert";
import { Observer, Subject } from "@xan/observable-core";
import { pipe } from "./pipe.ts";
import { throwError } from "./throw-error.ts";
import { flat } from "./flat.ts";
import { materialize } from "./materialize.ts";
import type { ObserverNotification } from "./observer-notification.ts";

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
    ["N", "a"],
    ["N", "a"],
    ["N", "a"],
    ["N", "b"],
    ["N", "c"],
    ["N", "c"],
    ["N", "d"],
    ["N", "d"],
    ["R"],
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
    ["N", "a"],
    ["N", "a"],
    ["N", "a"],
    ["N", "b"],
    ["N", "c"],
    ["N", "c"],
    ["T", error],
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
    ["N", "a"],
    ["N", "a"],
    ["N", "a"],
    ["N", "b"],
    ["N", "c"],
    ["N", "c"],
    ["T", error],
  ]);
});
