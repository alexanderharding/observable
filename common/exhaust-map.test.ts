import { assertEquals } from "@std/assert";
import { Observable, Observer, Subject } from "@xan/observable-core";
import { empty } from "./empty.ts";
import { never } from "./never.ts";
import { defer } from "./defer.ts";
import { pipe } from "./pipe.ts";
import { take } from "./take.ts";
import { throwError } from "./throw-error.ts";
import { BehaviorSubject } from "./behavior-subject.ts";
import { flat } from "./flat.ts";
import { exhaustMap } from "./exhaust-map.ts";
import { materialize } from "./materialize.ts";
import type { ObserverNotification } from "./observer-notification.ts";
import { map } from "./map.ts";

Deno.test(
  "exhaustMap should map-and-flatten each item to an Observable",
  () => {
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
      exhaustMap((x) =>
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
    // Since cold is synchronous, by the time hot.next(3) is called,
    // the first inner observable has already completed
    assertEquals(notifications, [
      ["N", 10],
      ["N", 10],
      ["N", 10],
      ["N", 30],
      ["N", 30],
      ["N", 30],
      ["N", 50],
      ["N", 50],
      ["N", 50],
      ["R"],
    ]);
  },
);

Deno.test("exhaustMap should ignore values while inner is active", () => {
  // Arrange
  const source = new Subject<string>();
  const innerA = new Subject<void>();
  const innerB = new Subject<void>();
  const notifications: Array<ObserverNotification<string>> = [];
  const observableLookup: Record<string, Observable<string>> = {
    a: pipe(
      innerA,
      map(() => "a"),
    ),
    b: pipe(
      innerB,
      map(() => "b"),
    ),
  };
  const materialized = pipe(
    source,
    exhaustMap((value) => observableLookup[value]),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next("a"); // Start inner A
  innerA.next();
  source.next("b"); // Ignored because inner A is active
  innerA.next();
  source.next("b"); // Ignored because inner A is active
  innerA.next();
  innerA.return(); // Inner A completes
  source.next("b"); // Now B should be accepted
  innerB.next();
  innerB.next();
  innerB.return();
  source.return();

  // Assert
  assertEquals(notifications, [
    ["N", "a"],
    ["N", "a"],
    ["N", "a"],
    ["N", "b"],
    ["N", "b"],
    ["R"],
  ]);
});

Deno.test("exhaustMap should exhaust many hot inners", () => {
  // Arrange
  const a = new Subject<void>();
  const b = new Subject<void>();
  const c = new Subject<void>();
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
  } as const;
  const source = new Subject<keyof typeof observableLookup>();
  const materialized = pipe(
    source,
    exhaustMap((value) => observableLookup[value]),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next("a");
  a.next();
  source.next("b"); // Ignored - a is active
  a.next();
  b.next(); // Emits nothing (b was ignored)
  a.next();
  a.return(); // a completes
  source.next("c"); // Now c is accepted
  c.next();
  source.next("a"); // Ignored - c is active
  c.next();
  c.return();
  source.return();

  // Assert
  assertEquals(notifications, [
    ["N", "a"],
    ["N", "a"],
    ["N", "a"],
    ["N", "c"],
    ["N", "c"],
    ["R"],
  ]);
});

Deno.test("exhaustMap should raise error when projection throws", () => {
  // Arrange
  const error = new Error("error");
  const notifications: Array<ObserverNotification<never>> = [];
  const materialized = pipe(
    new Observable<string>((observer) => {
      for (const value of ["x", "y"]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    }),
    exhaustMap<string, never>(() => {
      throw error;
    }),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["T", error]]);
});

Deno.test(
  "exhaustMap should exhaust cold observables, one inner throws",
  () => {
    // Arrange
    const error = new Error("error");
    const source = new BehaviorSubject<"x" | "y">("x");
    const x = new Subject<string>();
    const y = new Observable<string>((observer) => {
      for (const value of ["f", "g", "h", "i"]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    });
    const notifications: Array<ObserverNotification<string>> = [];
    const materialized = pipe(
      source,
      exhaustMap((x) => observableLookup[x]),
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
      ["N", "a"],
      ["N", "b"],
      ["T", error],
    ]);
  },
);

Deno.test("exhaustMap should handle outer throw", () => {
  // Arrange
  const error = new Error("error");
  const source = new Subject<string>();
  const inner = new Subject<string>();
  const notifications: Array<ObserverNotification<string>> = [];
  const materialized = pipe(
    source,
    exhaustMap(() => inner),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next("a");
  inner.next("1");
  inner.next("2");
  source.throw(error);
  inner.next("3");

  // Assert
  assertEquals(notifications, [
    ["N", "1"],
    ["N", "2"],
    ["T", error],
  ]);
});

Deno.test("exhaustMap should exhaust inner empty and empty", () => {
  // Arrange
  const x = empty;
  const y = empty;
  const observableLookup: Record<string, Observable<string>> = { x: x, y: y };
  const notifications: Array<ObserverNotification<string>> = [];
  const materialized = pipe(
    new Observable<string>((observer) => {
      for (const value of ["x", "y"]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    }),
    exhaustMap((x) => observableLookup[x]),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["R"]]);
});

Deno.test("exhaustMap should exhaust inner empty and never", () => {
  // Arrange
  const x = empty;
  const y = never;
  const observableLookup: Record<string, Observable<string>> = { x: x, y: y };
  const notifications: Array<ObserverNotification<string>> = [];
  const materialized = pipe(
    new Observable<string>((observer) => {
      for (const value of ["x", "y"]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    }),
    exhaustMap((x) => observableLookup[x]),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  // x emits empty (completes immediately), then y (never) is subscribed
  assertEquals(notifications, []);
});

Deno.test("exhaustMap should exhaust inner never and empty", () => {
  // Arrange
  const x = never;
  const y = empty;
  const observableLookup: Record<string, Observable<string>> = { x: x, y: y };
  const notifications: Array<ObserverNotification<string>> = [];
  const materialized = pipe(
    new Observable<string>((observer) => {
      for (const value of ["x", "y"]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    }),
    exhaustMap((x) => observableLookup[x]),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  // x (never) is subscribed first and never completes
  // y is ignored because x is still active
  assertEquals(notifications, []);
});

Deno.test("exhaustMap should exhaust inner never and throw", () => {
  // Arrange
  const error = new Error("error");
  const x = never;
  const y = throwError(error);
  const observableLookup: Record<string, Observable<string>> = { x: x, y: y };
  const notifications: Array<ObserverNotification<string>> = [];
  const materialized = pipe(
    new Observable<string>((observer) => {
      for (const value of ["x", "y"]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    }),
    exhaustMap((x) => observableLookup[x]),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  // x (never) is subscribed first
  // y is ignored because x is still active, no error thrown
  assertEquals(notifications, []);
});

Deno.test("exhaustMap should exhaust inner empty and throw", () => {
  // Arrange
  const error = new Error("error");
  const x = empty;
  const y = throwError(error);
  const observableLookup: Record<string, Observable<string>> = { x: x, y: y };
  const notifications: Array<ObserverNotification<string>> = [];
  const materialized = pipe(
    new Observable<string>((observer) => {
      for (const value of ["x", "y"]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    }),
    exhaustMap((x) => observableLookup[x]),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  // x (empty) completes, then y (throw) is subscribed
  assertEquals(notifications, [["T", error]]);
});

Deno.test("exhaustMap should handle outer empty", () => {
  // Arrange
  const notifications: Array<ObserverNotification<never>> = [];
  const materialized = pipe(
    empty,
    exhaustMap(
      (x) =>
        new Observable<never>((observer) => {
          observer.next(x);
          observer.return();
        }),
    ),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["R"]]);
});

Deno.test("exhaustMap should handle outer never", () => {
  // Arrange
  const notifications: Array<ObserverNotification<never>> = [];
  const materialized = pipe(
    never,
    exhaustMap(
      (x) =>
        new Observable<never>((observer) => {
          observer.next(x);
          observer.return();
        }),
    ),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, []);
});

Deno.test("exhaustMap should handle outer throwError", () => {
  // Arrange
  const error = new Error("error");
  const notifications: Array<ObserverNotification<never>> = [];
  const materialized = pipe(
    throwError(error),
    exhaustMap(
      (x) =>
        new Observable<never>((observer) => {
          observer.next(x);
          observer.return();
        }),
    ),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["T", error]]);
});

Deno.test(
  "exhaustMap should stop listening to a synchronous observable when unsubscribed",
  () => {
    // Arrange
    const sideEffects: Array<number> = [];
    const synchronousObservable = new Observable<number>((observer) => {
      for (let i = 0; !observer.signal.aborted && i < 10; i++) {
        sideEffects.push(i);
        observer.next(i);
      }
    });

    // Act
    pipe(
      synchronousObservable,
      exhaustMap(
        (value) =>
          new Observable<number>((observer) => {
            observer.next(value);
            observer.return();
          }),
      ),
      take(3),
    ).subscribe(new Observer());

    // Assert
    assertEquals(sideEffects, [0, 1, 2]);
  },
);

Deno.test(
  "exhaustMap should stop listening to a synchronous observable when unsubscribed via controller",
  () => {
    // Arrange
    const controller = new AbortController();
    const sideEffects: number[] = [];
    const synchronousObservable = flat([
      defer(() => {
        sideEffects.push(1);
        return new Observable<number>((observer) => {
          observer.next(1);
          observer.return();
        });
      }),
      defer(() => {
        sideEffects.push(2);
        return new Observable<number>((observer) => {
          observer.next(2);
          observer.return();
        });
      }),
      defer(() => {
        sideEffects.push(3);
        return new Observable<number>((observer) => {
          observer.next(3);
          observer.return();
        });
      }),
    ]);

    // Act
    pipe(
      new Observable<null>((observer) => {
        observer.next(null);
        observer.return();
      }),
      exhaustMap(() => synchronousObservable),
    ).subscribe(
      new Observer({
        signal: controller.signal,
        next: (value) => value === 2 && controller.abort(),
      }),
    );

    // Assert
    assertEquals(sideEffects, [1, 2]);
  },
);

Deno.test("exhaustMap should pass index to projection function", () => {
  // Arrange
  const indices: Array<number> = [];
  const source = new Subject<string>();
  const inner = new Observable<string>((observer) => {
    observer.next("x");
    observer.return();
  });
  const notifications: Array<ObserverNotification<string>> = [];
  const materialized = pipe(
    source,
    exhaustMap((_, index) => {
      indices.push(index);
      return inner;
    }),
    materialize(),
  );

  // Act
  materialized.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next("a");
  source.next("b");
  source.next("c");
  source.return();

  // Assert
  // All indices should be recorded since inner completes synchronously
  assertEquals(indices, [0, 1, 2]);
  assertEquals(notifications, [["N", "x"], ["N", "x"], ["N", "x"], ["R"]]);
});

Deno.test(
  "exhaustMap should only count indices for accepted source values",
  () => {
    // Arrange
    const indices: Array<number> = [];
    const source = new Subject<string>();
    const inner1 = new Subject<string>();
    const inner2 = new Subject<string>();
    let innerCount = 0;
    const notifications: Array<ObserverNotification<string>> = [];
    const materialized = pipe(
      source,
      exhaustMap((_, index) => {
        indices.push(index);
        innerCount++;
        return innerCount === 1 ? inner1 : inner2;
      }),
      materialize(),
    );

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );
    source.next("a"); // index 0, starts inner1
    source.next("b"); // ignored (inner active)
    source.next("c"); // ignored (inner active)
    inner1.next("1");
    inner1.return(); // inner1 completes
    source.next("d"); // index 1, starts inner2
    inner2.next("2");
    inner2.return();
    source.return();

    // Assert - indices should only count accepted source values
    assertEquals(indices, [0, 1]);
    assertEquals(notifications, [["N", "1"], ["N", "2"], ["R"]]);
  },
);

Deno.test(
  "exhaustMap should exhaust cold observables, outer is unsubscribed early",
  () => {
    // Arrange
    const controller = new AbortController();
    const x = new Observable<string>((observer) => {
      for (const value of ["a", "b", "c", "d", "e"]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    });
    const y = new Observable<string>((observer) => {
      for (const value of ["f", "g", "h", "i"]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    });
    const notifications: Array<ObserverNotification<string>> = [];
    const observableLookup: Record<string, Observable<string>> = { x: x, y: y };
    const materialized = pipe(
      new Observable<string>((observer) => {
        for (const value of ["x", "y"]) {
          observer.next(value);
          if (observer.signal.aborted) return;
        }
        observer.return();
      }),
      exhaustMap((x) => observableLookup[x]),
      materialize(),
    );

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
      ["N", "a"],
      ["N", "b"],
      ["N", "c"],
    ]);
  },
);

Deno.test(
  "exhaustMap should process next source value after inner completes",
  () => {
    // Arrange
    const source = new Subject<number>();
    const inners: Record<number, Subject<string>> = {
      1: new Subject<string>(),
      2: new Subject<string>(),
      3: new Subject<string>(),
    };
    const notifications: Array<ObserverNotification<string>> = [];
    const materialized = pipe(
      source,
      exhaustMap((value) => inners[value]),
      materialize(),
    );

    // Act
    materialized.subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    source.next(1); // Inner 1 starts
    inners[1].next("1a");
    source.next(2); // Ignored - inner 1 active
    inners[1].next("1b");
    inners[1].return(); // Inner 1 completes

    source.next(3); // Inner 3 starts (2 was never accepted)
    inners[3].next("3a");
    inners[3].next("3b");
    inners[3].return();

    source.return();

    // Assert
    assertEquals(notifications, [
      ["N", "1a"],
      ["N", "1b"],
      ["N", "3a"],
      ["N", "3b"],
      ["R"],
    ]);
  },
);
