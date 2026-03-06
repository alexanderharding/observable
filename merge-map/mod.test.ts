import { assertEquals } from "@std/assert";
import { Observable, Observer, Subject } from "@observable/core";
import { noop } from "@observable/internal";
import { pipe } from "@observable/pipe";
import { map } from "@observable/map";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { mergeMap } from "./mod.ts";

Deno.test("mergeMap should map-and-flatten each item to an Observable", () => {
  // Arrange
  const hot = new Subject<number>();
  const cold = new Observable<number>((observer) => {
    for (const value of Array.from({ length: 3 }, () => 10)) {
      observer.next(value);
      if (observer.signal.aborted) return;
    }
    observer.return();
  });
  const notifications: Array<ObserverNotification<number>> = [];
  const materialized = pipe(
    hot,
    mergeMap((x) =>
      pipe(
        cold,
        map((i) => i * +x),
      )
    ),
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

Deno.test("mergeMap should merge many regular interval inners", () => {
  const a = new Subject<void>();
  const b = new Subject<void>();
  const c = new Subject<void>();
  const d = new Subject<void>();
  const notifications: Array<ObserverNotification<string>> = [];
  const observableLookup = {
    a: pipe(
      a,
      map(() => "a"),
    ),
    b: pipe(
      b,
      map(() => "b"),
    ),
    c: pipe(
      c,
      map(() => "c"),
    ),
    d: pipe(
      d,
      map(() => "d"),
    ),
  } as const;
  const source = new Subject<keyof typeof observableLookup>();
  const materialized = pipe(
    source,
    mergeMap((value) => observableLookup[value]),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next("a");
  a.next();
  source.next("b");
  a.next();
  b.next();
  a.next();
  b.next();
  source.next("c");
  a.next();
  a.return();
  b.next();
  b.return();
  c.next();
  c.next();
  source.next("d");
  c.next();
  d.next();
  d.return();
  c.next();
  source.return();
  c.next();
  c.return();

  // Assert
  assertEquals(notifications, [
    ["next", "a"],
    ["next", "a"],
    ["next", "b"],
    ["next", "a"],
    ["next", "b"],
    ["next", "a"],
    ["next", "b"],
    ["next", "c"],
    ["next", "c"],
    ["next", "c"],
    ["next", "d"],
    ["next", "c"],
    ["next", "c"],
    ["return"],
  ]);
});

Deno.test(
  "mergeMap should merge many outer to many inner, and inner throws",
  () => {
    // Arrange
    const error = new Error("error");
    const a = new Subject<void>();
    const b = new Subject<void>();
    const c = new Subject<void>();
    const d = new Subject<void>();
    const notifications: Array<ObserverNotification<string>> = [];
    const observableLookup = {
      a: pipe(
        a,
        map(() => "a"),
      ),
      b: pipe(
        b,
        map(() => "b"),
      ),
      c: pipe(
        c,
        map(() => "c"),
      ),
      d: pipe(
        d,
        map(() => "d"),
      ),
    } as const;
    const source = new Subject<keyof typeof observableLookup>();
    const materialized = pipe(
      source,
      mergeMap((value) => observableLookup[value]),
      materialize(),
    );

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );
    source.next("a");
    a.next();
    source.next("b");
    a.next();
    b.next();
    a.next();
    b.next();
    source.next("c");
    a.next();
    a.throw(error);
    b.next();
    b.return();
    c.next();
    c.next();
    source.next("d");
    c.next();
    d.next();
    d.return();
    c.next();
    source.return();
    c.next();
    c.return();

    // Assert
    assertEquals(notifications, [
      ["next", "a"],
      ["next", "a"],
      ["next", "b"],
      ["next", "a"],
      ["next", "b"],
      ["next", "a"],
      ["throw", error],
    ]);
  },
);

Deno.test(
  "mergeMap should merge many outer to many inner, and outer throws",
  () => {
    // Arrange
    const error = new Error("error");
    const a = new Subject<void>();
    const b = new Subject<void>();
    const c = new Subject<void>();
    const d = new Subject<void>();
    const notifications: Array<ObserverNotification<string>> = [];
    const observableLookup = {
      a: pipe(
        a,
        map(() => "a"),
      ),
      b: pipe(
        b,
        map(() => "b"),
      ),
      c: pipe(
        c,
        map(() => "c"),
      ),
      d: pipe(
        d,
        map(() => "d"),
      ),
    } as const;
    const source = new Subject<keyof typeof observableLookup>();
    const materialized = pipe(
      source,
      mergeMap((value) => observableLookup[value]),
      materialize(),
    );

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );
    source.next("a");
    a.next();
    source.next("b");
    a.next();
    b.next();
    a.next();
    b.next();
    source.next("c");
    a.next();
    a.return();
    b.next();
    b.return();
    c.next();
    c.next();
    source.next("d");
    c.next();
    d.next();
    d.return();
    c.next();
    source.throw(error);
    c.next();
    c.return();

    // Assert
    assertEquals(notifications, [
      ["next", "a"],
      ["next", "a"],
      ["next", "b"],
      ["next", "a"],
      ["next", "b"],
      ["next", "a"],
      ["next", "b"],
      ["next", "c"],
      ["next", "c"],
      ["next", "c"],
      ["next", "d"],
      ["next", "c"],
      ["throw", error],
    ]);
  },
);

Deno.test(
  "mergeMap should merge many outer to many inner, both inner and outer throw",
  () => {
    // Arrange
    const error = new Error("error");
    const a = new Subject<void>();
    const b = new Subject<void>();
    const c = new Subject<void>();
    const d = new Subject<void>();
    const notifications: Array<ObserverNotification<string>> = [];
    const observableLookup = {
      a: pipe(
        a,
        map(() => "a"),
      ),
      b: pipe(
        b,
        map(() => "b"),
      ),
      c: pipe(
        c,
        map(() => "c"),
      ),
      d: pipe(
        d,
        map(() => "d"),
      ),
    } as const;
    const source = new Subject<keyof typeof observableLookup>();
    const materialized = pipe(
      source,
      mergeMap((value) => observableLookup[value]),
      materialize(),
    );
    source.subscribe(new Observer({ throw: noop }));

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );
    source.next("a");
    a.next();
    source.next("b");
    a.next();
    b.next();
    a.next();
    b.next();
    source.next("c");
    a.next();
    a.return();
    b.next();
    b.return();
    c.next();
    c.throw(error);
    source.next("d");
    c.next();
    d.next();
    d.return();
    c.next();
    source.throw(new Error("other error"));
    c.next();
    c.return();

    // Assert
    assertEquals(notifications, [
      ["next", "a"],
      ["next", "a"],
      ["next", "b"],
      ["next", "a"],
      ["next", "b"],
      ["next", "a"],
      ["next", "b"],
      ["next", "c"],
      ["throw", error],
    ]);
  },
);

Deno.test(
  "mergeMap should propagate from error when project returns non-observable",
  () => {
    // Arrange
    const source = new Subject<number>();
    const notifications: Array<ObserverNotification<unknown>> = [];
    const materialized = pipe(
      source,
      // deno-lint-ignore no-explicit-any
      mergeMap(() => "not an observable" as any),
      materialize(),
    );

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );
    source.next(1);

    // Assert
    assertEquals(notifications.length, 1);
    assertEquals(notifications[0][0], "throw");
    assertEquals(
      (notifications[0][1] as TypeError).message,
      "Parameter 1 is not of type 'Observable'",
    );
  },
);

Deno.test(
  "mergeMap should propagate error when project throws synchronously",
  () => {
    // Arrange
    const projectError = new Error("project threw");
    const source = new Subject<number>();
    const notifications: Array<ObserverNotification<unknown>> = [];
    const materialized = pipe(
      source,
      mergeMap((): never => {
        throw projectError;
      }),
      materialize(),
    );

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );
    source.next(1);

    // Assert
    assertEquals(notifications, [["throw", projectError]]);
  },
);
