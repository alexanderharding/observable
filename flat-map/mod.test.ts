import { assertEquals } from "@std/assert";
import { type Observable, Observer, Subject } from "@observable/core";
import { pipe } from "@observable/pipe";
import { flatMap } from "./mod.ts";
import { map } from "@observable/map";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { ofIterable } from "@observable/of-iterable";

Deno.test("flatMap should flatten many inners", () => {
  // Arrange
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
  const observable = pipe(
    source,
    flatMap((value) => observableLookup[value] as Observable<string>),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next("a");
  a.next();
  source.next("b");
  b.next();
  a.next();
  b.next();
  a.next();
  a.return();
  b.next();
  b.return();
  source.next("c");
  c.next();
  c.next();
  d.next();
  c.return();
  source.next("d");
  d.next();
  d.next();
  d.return();
  source.return();

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

Deno.test("flatMap should flatten many inner, and inner throws", () => {
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
  const observable = pipe(
    source,
    flatMap((value) => observableLookup[value]),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next("a");
  a.next();
  source.next("b");
  b.next();
  a.next();
  b.next();
  a.next();
  a.return();
  b.next();
  b.return();
  source.next("c");
  c.next();
  c.next();
  d.next();
  c.throw(error);
  source.next("d");
  d.next();
  d.next();
  d.return();
  source.return();

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

Deno.test("flatMap should flatten many inner, and outer throws", () => {
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
  const observable = pipe(
    source,
    flatMap((value) => observableLookup[value]),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next("a");
  a.next();
  source.next("b");
  b.next();
  a.next();
  b.next();
  a.next();
  a.return();
  b.next();
  b.return();
  source.next("c");
  c.next();
  c.next();
  d.next();
  c.return();
  source.throw(error);
  d.next();
  d.next();
  d.return();
  source.return();

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

Deno.test(
  "flatMap should propagate from error when project returns non-observable",
  () => {
    // Arrange
    const source = new Subject<number>();
    const notifications: Array<ObserverNotification<unknown>> = [];
    const observable = pipe(
      source,
      flatMap(() => "not an observable" as unknown as Observable<number>),
      materialize(),
    );

    // Act
    observable.subscribe(
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
  "flatMap should propagate from error when project returns non-observable after first value",
  () => {
    // Arrange
    const source = pipe(["a", "b"], ofIterable());
    const notifications: Array<ObserverNotification<number>> = [];
    const observableLookup = {
      a: new Subject<number>(),
      b: "not an observable" as unknown as Observable<number>,
    } as const;
    const observable = pipe(
      source,
      flatMap((value) => observableLookup[value]),
      materialize(),
    );

    // Act
    observable.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );
    observableLookup.a.next(0);
    observableLookup.a.return();

    // Assert
    assertEquals(notifications.length, 2);
    assertEquals(notifications[0][0], "next");
    assertEquals(notifications[0][1], 0);
    assertEquals(notifications[1][0], "throw");
    assertEquals(
      (notifications[1][1] as TypeError).message,
      "Parameter 1 is not of type 'Observable'",
    );
  },
);

Deno.test(
  "flatMap should propagate error when project throws synchronously",
  () => {
    // Arrange
    const projectError = new Error("project threw");
    const source = new Subject<number>();
    const notifications: Array<ObserverNotification<unknown>> = [];
    const observable = pipe(
      source,
      flatMap((): never => {
        throw projectError;
      }),
      materialize(),
    );

    // Act
    observable.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );
    source.next(1);

    // Assert
    assertEquals(notifications, [["throw", projectError]]);
  },
);
