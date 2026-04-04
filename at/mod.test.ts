import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { Observable, Observer } from "@observable/core";
import { empty } from "@observable/empty";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { materialize } from "@observable/materialize";
import type { ObserverNotification } from "@observable/materialize";
import { at } from "./mod.ts";
import { throwError } from "@observable/throw-error";

Deno.test("at should throw if no arguments are provided", () => {
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => at(),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("at should throw if index is not a number", () => {
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => at("not a number"),
    TypeError,
    "Parameter 1 is not of type 'Number'",
  );
});

Deno.test("at should throw if source is not provided", () => {
  const atOne = at(1);
  assertThrows(
    () => (atOne as (source?: unknown) => Observable<number>)(),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("at should throw if source is not an Observable (e.g. undefined)", () => {
  const atOne = at(1);
  assertThrows(
    () => atOne(undefined as unknown as Observable<number>),
    TypeError,
    "Parameter 1 is not of type 'Observable'",
  );
});

Deno.test("at should throw if source is not an Observable (invalid object)", () => {
  const atOne = at(1);
  assertThrows(
    () => atOne({ subscribe: 1 } as unknown as Observable<number>),
    TypeError,
    "Parameter 1 is not of type 'Observable'",
  );
});

Deno.test("at should return empty observable when index is NaN", () => {
  const source = new Observable(() => {});
  const result = pipe(source, at(NaN));
  assertStrictEquals(result, empty);
});

Deno.test("at(0) should emit only the first value", () => {
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(forOf([1, 2, 3]), at(0), materialize());

  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  assertEquals(notifications, [["next", 1], ["return"]]);
});

Deno.test("at(1) should emit only the second value", () => {
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(forOf([1, 2, 3]), at(1), materialize());

  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  assertEquals(notifications, [["next", 2], ["return"]]);
});

Deno.test("at(2) should emit only the third value", () => {
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(forOf([10, 20, 30]), at(2), materialize());

  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  assertEquals(notifications, [["next", 30], ["return"]]);
});

Deno.test("at(positive fractional) should truncate index and emit value at truncated position", () => {
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(forOf([1, 2, 3]), at(1.7), materialize());

  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  assertEquals(notifications, [["next", 2], ["return"]]);
});

Deno.test("at(1.1) should behave like at(1) (Array.at semantics)", () => {
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(forOf([1, 2]), at(1.1), materialize());

  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  assertEquals(notifications, [["next", 2], ["return"]]);
});

Deno.test("at(positive fractional) should truncate index 2.9 to 2", () => {
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(forOf([10, 20, 30]), at(2.9), materialize());

  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  assertEquals(notifications, [["next", 30], ["return"]]);
});

Deno.test("at(negative fractional) should truncate index and emit value at truncated position", () => {
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(forOf([1, 2, 3]), at(-1.2), materialize());

  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  assertEquals(notifications, [["next", 3], ["return"]]);
});

Deno.test("at(-0.1) should truncate to 0 and emit first value (Array.at semantics)", () => {
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(forOf([1, 2]), at(-0.1), materialize());

  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  assertEquals(notifications, [["next", 1], ["return"]]);
});

Deno.test("at(-1.1) should truncate to -1 and emit last value (Array.at semantics)", () => {
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(forOf([1, 2]), at(-1.1), materialize());

  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  assertEquals(notifications, [["next", 2], ["return"]]);
});

Deno.test("at(negative fractional) should truncate index -2.8 to -2", () => {
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(forOf([10, 20, 30]), at(-2.8), materialize());

  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  assertEquals(notifications, [["next", 20], ["return"]]);
});

Deno.test("at(positive) when source has fewer items should emit nothing then return", () => {
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(forOf([1, 2]), at(5), materialize());

  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  assertEquals(notifications, [["return"]]);
});

Deno.test("at(-1) should emit only the last value", () => {
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(forOf([1, 2, 3]), at(-1), materialize());

  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  assertEquals(notifications, [["next", 3], ["return"]]);
});

Deno.test("at(-2) should emit only the second-to-last value", () => {
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(forOf([10, 20, 30]), at(-2), materialize());

  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  assertEquals(notifications, [["next", 20], ["return"]]);
});

Deno.test("at(negative) when source has fewer than |index| items should emit nothing then return", () => {
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(forOf([1, 2]), at(-5), materialize());

  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  assertEquals(notifications, [["return"]]);
});

Deno.test("at(Infinity) should never emit", () => {
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(forOf([1, 2, 3]), at(Infinity), materialize());

  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  assertEquals(notifications, [["return"]]);
});

Deno.test("at(-Infinity) should never emit", () => {
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(forOf([1, 2, 3]), at(-Infinity), materialize());

  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  assertEquals(notifications, [["return"]]);
});

Deno.test("at should pump throws through itself", () => {
  const error = new Error("test");
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(throwError(error), at(1), materialize());

  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  assertEquals(notifications, [["throw", error]]);
});

Deno.test("at should pump return through when source is empty", () => {
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(empty, at(0), materialize());

  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  assertEquals(notifications, [["return"]]);
});
