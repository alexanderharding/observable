import { assertEquals } from "@std/assert";
import { type Observable, Observer, Subject } from "@observable/core";
import { empty } from "@observable/empty";
import { never } from "@observable/never";
import { pipe } from "@observable/pipe";
import { take } from "@observable/take";
import { throwError } from "@observable/throw-error";
import { BehaviorSubject } from "@observable/behavior-subject";
import { flat } from "@observable/flat";
import { switchMap } from "./mod.ts";
import { map } from "@observable/map";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { forOf } from "@observable/for-of";
import { finalize } from "@observable/finalize";
import { of } from "@observable/of";
import { tap } from "@observable/tap";
import { defer } from "@observable/defer";

Deno.test("switchMap should map-and-flatten each item to an Observable", () => {
  // Arrange
  const hot = new Subject<number>();
  const cold = forOf(Array.from({ length: 3 }, () => 10));
  const notifications: Array<ObserverNotification<number>> = [];
  const materialized = pipe(
    hot,
    switchMap((x) => pipe(cold, map((i) => i * +x))),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  hot.next(1);
  hot.next(3);
  hot.next(5);
  hot.return();

  // Assert
  assertEquals(notifications, [
    ["next", 10],
    ["next", 10],
    ["next", 10],
    ["next", 30],
    ["next", 30],
    ["next", 30],
    ["next", 50],
    ["next", 50],
    ["next", 50],
    ["return"],
  ]);
});

Deno.test("switchMap should unsub inner observables", () => {
  // Arrange
  const unsubbed: Array<string> = [];

  // Act
  pipe(
    forOf(["a", "b"]),
    switchMap(
      (x) => pipe(never, finalize(() => unsubbed.push(x))),
    ),
  ).subscribe(new Observer());

  // Assert
  assertEquals(unsubbed, ["a"]);
});

Deno.test("switchMap should raise error when projection throws", () => {
  // Arrange
  const error = new Error("error");
  const notifications: Array<ObserverNotification<never>> = [];
  const materialized = pipe(
    forOf(["x", "y"]),
    switchMap<string, never>(() => {
      throw error;
    }),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", error]]);
});

Deno.test(
  "should switch inner cold observables, outer is unsubscribed early",
  () => {
    // Arrange
    const controller = new AbortController();
    const x = forOf(["a", "b", "c", "d", "e"]);
    const y = forOf(["f", "g", "h", "i"]);
    const notifications: Array<ObserverNotification<string>> = [];
    const materialized = pipe(
      forOf(["x", "y"]),
      switchMap((x) => observableLookup[x]),
      materialize(),
    );
    const observableLookup: Record<string, Observable<string>> = { x: x, y: y };

    // Act

    materialized.subscribe(
      new Observer({
        signal: controller.signal,
        next: (notification) => {
          notifications.push(notification);
          if (notifications.length === 3) controller.abort();
        },
      }),
    );

    // Assert
    assertEquals(notifications, [
      ["next", "a"],
      ["next", "b"],
      ["next", "c"],
    ]);
  },
);

Deno.test(
  "switchMap should switch inner cold observables, inner never returns",
  () => {
    // Arrange
    const x = forOf(["a", "b", "c", "d", "e"]);
    const y = flat([forOf(["f", "g", "h", "i"]), never]);
    const notifications: Array<ObserverNotification<string>> = [];
    const materialized = pipe(
      forOf(["x", "y"]),
      switchMap((x) => observableLookup[x]),
      materialize(),
    );
    const observableLookup: Record<string, Observable<string>> = { x: x, y: y };

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ["next", "a"],
      ["next", "b"],
      ["next", "c"],
      ["next", "d"],
      ["next", "e"],
      ["next", "f"],
      ["next", "g"],
      ["next", "h"],
      ["next", "i"],
    ]);
  },
);

Deno.test(
  "switchMap should handle a synchronous switch to the second inner observable",
  () => {
    // Arrange
    const x = never;
    const y = forOf(["f", "g", "h", "i"]);
    const notifications: Array<ObserverNotification<string>> = [];
    const materialized = pipe(
      forOf(["x", "y"]),
      switchMap((x) => observableLookup[x]),
      materialize(),
    );

    const observableLookup: Record<string, Observable<string>> = { x: x, y: y };

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ["next", "f"],
      ["next", "g"],
      ["next", "h"],
      ["next", "i"],
      ["return"],
    ]);
  },
);

Deno.test(
  "switchMap should switch inner cold observables, one inner throws",
  () => {
    // Arrange
    const error = new Error("error");
    const source = new BehaviorSubject<"x" | "y">("x");
    const x = new Subject<string>();
    const y = forOf(["f", "g", "h", "i"]);
    const notifications: Array<ObserverNotification<string>> = [];
    const materialized = pipe(
      source,
      switchMap((x) => observableLookup[x]),
      materialize(),
    );
    const observableLookup: Record<string, Observable<string>> = { x: x, y: y };

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );
    x.next("a");
    x.next("b");
    x.throw(error);
    source.next("y");
    x.next("d");
    x.next("e");

    // Assert
    assertEquals(notifications, [
      ["next", "a"],
      ["next", "b"],
      ["throw", error],
    ]);
  },
);

Deno.test("switchMap should switch inner empty and empty", () => {
  // Arrange
  const x = empty;
  const y = empty;
  const observableLookup: Record<string, Observable<string>> = { x: x, y: y };
  const notifications: Array<ObserverNotification<string>> = [];
  const materialized = pipe(
    forOf(["x", "y"]),
    switchMap((x) => observableLookup[x]),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("switchMap should switch inner empty and never", () => {
  // Arrange
  const x = empty;
  const y = never;
  const observableLookup: Record<string, Observable<string>> = { x: x, y: y };
  const notifications: Array<ObserverNotification<string>> = [];
  const materialized = pipe(
    forOf(["x", "y"]),
    switchMap((x) => observableLookup[x]),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, []);
});

Deno.test("switchMap should switch inner never and empty", () => {
  // Arrange
  const x = never;
  const y = empty;
  const observableLookup: Record<string, Observable<string>> = { x: x, y: y };
  const notifications: Array<ObserverNotification<string>> = [];
  const materialized = pipe(
    forOf(["x", "y"]),
    switchMap((x) => observableLookup[x]),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("switchMap should switch inner never and throw", () => {
  // Arrange
  const error = new Error("error");
  const x = never;
  const y = throwError(error);
  const observableLookup: Record<string, Observable<string>> = { x: x, y: y };
  const notifications: Array<ObserverNotification<string>> = [];
  const materialized = pipe(
    forOf(["x", "y"]),
    switchMap((x) => observableLookup[x]),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", error]]);
});

Deno.test("switchMap should switch inner empty and throw", () => {
  // Arrange
  const error = new Error("error");
  const x = empty;
  const y = throwError(error);
  const observableLookup: Record<string, Observable<string>> = { x: x, y: y };
  const notifications: Array<ObserverNotification<string>> = [];
  const materialized = pipe(
    forOf(["x", "y"]),
    switchMap((x) => observableLookup[x]),
    materialize(),
  );

  // Act
  materialized.subscribe(new Observer((notification) => notifications.push(notification)));

  // Assert
  assertEquals(notifications, [["throw", error]]);
});

Deno.test("switchMap should handle outer empty", () => {
  // Arrange
  const notifications: Array<ObserverNotification<never>> = [];
  const materialized = pipe(empty, switchMap((x) => of(x)), materialize());

  // Act
  materialized.subscribe(new Observer((notification) => notifications.push(notification)));

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("switchMap should handle outer never", () => {
  // Arrange
  const notifications: Array<ObserverNotification<never>> = [];
  const materialized = pipe(
    never,
    switchMap((x) => of(x)),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, []);
});

Deno.test("switchMap should handle outer throw", () => {
  // Arrange
  const error = new Error("error");
  const notifications: Array<ObserverNotification<never>> = [];
  const materialized = pipe(
    throwError(error),
    switchMap((x) => of(x)),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", error]]);
});

Deno.test(
  "switchMap should stop listening to a synchronous observable when unsubscribed",
  () => {
    // Arrange
    const sideEffects: Array<number> = [];
    const synchronousObservable = pipe(
      forOf(Array.from({ length: 10 }, (_, i) => i)),
      tap((value) => sideEffects.push(value)),
    );

    // Act
    pipe(synchronousObservable, switchMap((value) => of(value)), take(3)).subscribe(new Observer());

    // Assert
    assertEquals(sideEffects, [0, 1, 2]);
  },
);

Deno.test(
  "switchMap should unsubscribe previous inner sub when getting synchronously reentrance during subscribing the inner sub",
  () => {
    // Arrange
    const source = new Subject<number>();
    const notifications: Array<ObserverNotification<number>> = [];
    const observer = new Observer<ObserverNotification<number>>((value) =>
      notifications.push(value)
    );

    // Act
    pipe(
      source,
      take(3),
      switchMap((value) =>
        defer(() => {
          source.next(value + 1);
          return flat([of(value), never]);
        })
      ),
      materialize(),
    ).subscribe(observer);
    source.next(1);

    // Assert
    assertEquals(notifications, [["next", 3]]);
  },
);

Deno.test(
  "switchMap should stop listening to a synchronous observable when unsubscribed",
  () => {
    // Arrange
    const controller = new AbortController();
    const sideEffects: number[] = [];
    const synchronousObservable = pipe(forOf([1, 2, 3]), tap((value) => sideEffects.push(value)));

    // Act
    pipe(of(null), switchMap(() => synchronousObservable)).subscribe(
      new Observer({
        signal: controller.signal,
        next: (value) => value === 2 && controller.abort(),
      }),
    );

    // Assert
    assertEquals(sideEffects, [1, 2]);
  },
);
