import { assertEquals } from "@std/assert";
import { Observer, Subject } from "@xan/observable-core";
import { empty } from "./empty.ts";
import { never } from "./never.ts";
import { pipe } from "./pipe.ts";
import { throwError } from "./throw-error.ts";
import { materialize } from "./materialize.ts";
import type { ObserverNotification } from "./observer-notification.ts";
import { race } from "./race.ts";
import { defer } from "./defer.ts";
import { of } from "./of.ts";
import { flat } from "./flat.ts";

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
    assertEquals(notifications, [["N", 1], ["N", 3], ["R"]]);
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
      ["N", 1],
      ["N", 2],
      ["N", 3],
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
      ["N", 1],
      ["N", 2],
      ["N", 3],
      ["T", error],
    ]);
    assertEquals(deferredCalls, [1, 2]);
  },
);
