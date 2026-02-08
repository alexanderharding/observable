import { assertEquals } from "@std/assert";
import { Observable, Observer, Subject } from "@observable/core";
import { empty } from "@observable/empty";
import { never } from "@observable/never";
import { defer } from "@observable/defer";
import { pipe } from "@observable/pipe";
import { take } from "@observable/take";
import { throwError } from "@observable/throw-error";
import { BehaviorSubject } from "@observable/behavior-subject";
import { flat } from "@observable/flat";
import { switchMap } from "./mod.ts";
import { map } from "@observable/map";
import { materialize, type ObserverNotification } from "@observable/materialize";

Deno.test("switchMap should map-and-flatten each item to an Observable", () => {
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
    switchMap((x) =>
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

Deno.test("switchMap should unsub inner observables", () => {
  // Arrange
  const unsubbed: Array<string> = [];

  // Act
  pipe(
    new Observable<string>((observer) => {
      for (const value of ["a", "b"]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    }),
    switchMap(
      (x) =>
        new Observable<string>((observer) => {
          observer.signal.addEventListener("abort", () => {
            unsubbed.push(x);
          });
        }),
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
    new Observable<string>((observer) => {
      for (const value of ["x", "y"]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    }),
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
  "should switch inner cold observables, outer is aborted early",
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
    const materialized = pipe(
      new Observable<string>((observer) => {
        for (const value of ["x", "y"]) {
          observer.next(value);
          if (observer.signal.aborted) return;
        }
        observer.return();
      }),
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
    const x = new Observable<string>((observer) => {
      for (const value of ["a", "b", "c", "d", "e"]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    });
    const y = new Observable<string>((observer) => {
      observer.next("f");
      observer.next("g");
      observer.next("h");
      observer.next("i");
    });
    const notifications: Array<ObserverNotification<string>> = [];
    const materialized = pipe(
      new Observable<string>((observer) => {
        for (const value of ["x", "y"]) {
          observer.next(value);
          if (observer.signal.aborted) return;
        }
        observer.return();
      }),
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
    const y = new Observable<string>((observer) => {
      for (const value of ["f", "g", "h", "i"]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    });
    const notifications: Array<ObserverNotification<string>> = [];
    const materialized = pipe(
      new Observable<string>((observer) => {
        for (const value of ["x", "y"]) {
          observer.next(value);
          if (observer.signal.aborted) return;
        }
        observer.return();
      }),
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
    new Observable<string>((observer) => {
      for (const value of ["x", "y"]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    }),
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
    new Observable<string>((observer) => {
      for (const value of ["x", "y"]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    }),
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
    new Observable<string>((observer) => {
      for (const value of ["x", "y"]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    }),
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
    new Observable<string>((observer) => {
      for (const value of ["x", "y"]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    }),
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
    new Observable<string>((observer) => {
      for (const value of ["x", "y"]) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    }),
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

Deno.test("switchMap should handle outer empty", () => {
  // Arrange
  const notifications: Array<ObserverNotification<never>> = [];
  const materialized = pipe(
    empty,
    switchMap(
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
  assertEquals(notifications, [["return"]]);
});

Deno.test("switchMap should handle outer never", () => {
  // Arrange
  const notifications: Array<ObserverNotification<never>> = [];
  const materialized = pipe(
    never,
    switchMap(
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

Deno.test("switchMap should handle outer throw", () => {
  // Arrange
  const error = new Error("error");
  const notifications: Array<ObserverNotification<never>> = [];
  const materialized = pipe(
    throwError(error),
    switchMap(
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
  assertEquals(notifications, [["throw", error]]);
});

Deno.test(
  "switchMap should stop listening to a synchronous observable when aborted",
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
      switchMap(
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
  "switchMap should abort previous inner observation when getting synchronously reentrance during subscribing the inner observation",
  () => {
    // Arrange
    const e = new Subject<number>();
    const notifications: Array<ObserverNotification<number>> = [];
    const observer = new Observer<ObserverNotification<number>>((value) =>
      notifications.push(value)
    );

    // Act
    pipe(
      e,
      take(3),
      switchMap(
        (value) =>
          new Observable<number>((observer) => {
            e.next(value + 1);
            observer.next(value);
          }),
      ),
      materialize(),
    ).subscribe(observer);
    e.next(1);

    // Assert
    assertEquals(notifications, [["next", 3]]);
  },
);

Deno.test(
  "switchMap should stop listening to a synchronous observable when aborted",
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
      switchMap(() => synchronousObservable),
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
