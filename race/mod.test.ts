import { assertEquals, assertStrictEquals } from "@std/assert";
import { Observer, Subject } from "@observable/core";
import { empty } from "@observable/empty";
import { never } from "@observable/never";
import { pipe } from "@observable/pipe";
import { throwError } from "@observable/throw-error";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { race } from "./mod.ts";
import { defer } from "@observable/defer";
import { of } from "@observable/of";
import { flat } from "@observable/flat";

Deno.test(
  "race should mirror the first source observable to emit an item and ignore the others",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification> = [];
    const source1 = empty;
    const source2 = new Subject<number>();
    const source3 = new Subject<number>();
    const observable = race([source1, source2, source3]);

    // Act
    pipe(observable, materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );
    source2.next(1);
    source3.next(2);
    source2.next(3);
    source2.return();

    // Assert
    assertEquals(notifications, [["next", 1], ["next", 3], ["return"]]);
  },
);

Deno.test(
  "race should return empty when given an empty array",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification> = [];
    const observable = race([]);

    // Act
    pipe(observable, materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertStrictEquals(observable, empty);
    assertEquals(notifications, [["return"]]);
  },
);

Deno.test(
  "race should stop iterating over the sources when the first source observable nexts",
  () => {
    // Arrange
    const deferredCalls: Array<1 | 2 | 3> = [];
    const notifications: Array<ObserverNotification> = [];
    const source1 = defer(() => {
      deferredCalls.push(1);
      return never;
    });
    const source2 = defer(() => {
      deferredCalls.push(2);
      return flat([of([1, 2, 3]), never]);
    });
    const source3 = defer(() => {
      deferredCalls.push(3);
      return of([4, 5, 6]);
    });
    const observable = race([source1, source2, source3]);

    // Act
    pipe(observable, materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ["next", 1],
      ["next", 2],
      ["next", 3],
    ]);
    assertEquals(deferredCalls, [1, 2]);
  },
);

Deno.test(
  "race should stop iterating over the sources when the first source observable throws",
  () => {
    // Arrange
    const error = new Error("test");
    const deferredCalls: Array<1 | 2 | 3> = [];
    const notifications: Array<ObserverNotification> = [];
    const source1 = defer(() => {
      deferredCalls.push(1);
      return never;
    });
    const source2 = defer(() => {
      deferredCalls.push(2);
      return flat([of([1, 2, 3]), throwError(error)]);
    });
    const source3 = defer(() => {
      deferredCalls.push(3);
      return of([4, 5, 6]);
    });
    const observable = race([source1, source2, source3]);

    // Act
    pipe(observable, materialize()).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ["next", 1],
      ["next", 2],
      ["next", 3],
      ["throw", error],
    ]);
    assertEquals(deferredCalls, [1, 2]);
  },
);
