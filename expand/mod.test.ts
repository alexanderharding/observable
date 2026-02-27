import { assertEquals, assertThrows } from "@std/assert";
import { Observable, Observer, Subject } from "@observable/core";
import { MinimumArgumentsRequiredError, noop, ParameterTypeError } from "@observable/internal";
import { pipe } from "@observable/pipe";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { ofIterable } from "@observable/of-iterable";
import { empty } from "@observable/empty";
import { expand } from "./mod.ts";

Deno.test("expand should throw if no arguments are provided", () => {
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => expand(),
    MinimumArgumentsRequiredError,
  );
});

Deno.test("expand should throw if project is not a function", () => {
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => expand("not a function"),
    ParameterTypeError,
  );
});

Deno.test("expand operator function should throw if no arguments are provided", () => {
  const operatorFn = expand(() => empty);
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => operatorFn(),
    MinimumArgumentsRequiredError,
  );
});

Deno.test("expand operator function should throw if source is not an Observable", () => {
  const operatorFn = expand(() => empty);
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => operatorFn("not an observable"),
    ParameterTypeError,
  );
});

Deno.test("expand should emit source values and recursively expand", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = pipe([2], ofIterable<number>());
  const observable = pipe(
    source,
    expand((value) => value < 16 ? pipe([value * 2], ofIterable()) : empty),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 2],
    ["next", 4],
    ["next", 8],
    ["next", 16],
    ["return"],
  ]);
});

Deno.test("expand should handle multiple source values", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = pipe([1, 10], ofIterable<number>());
  const observable = pipe(
    source,
    expand((value) =>
      value < 4 || (value >= 10 && value < 40) ? pipe([value * 2], ofIterable()) : empty
    ),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 4],
    ["next", 10],
    ["next", 20],
    ["next", 40],
    ["return"],
  ]);
});

Deno.test("expand should pass index to project function", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const indices: number[] = [];
  const source = pipe([1], ofIterable<number>());
  const observable = pipe(
    source,
    expand((value, index) => {
      indices.push(index);
      return value < 4 ? pipe([value + 1], ofIterable()) : empty;
    }),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["next", 4],
    ["return"],
  ]);
  assertEquals(indices, [0, 1, 2, 3]);
});

Deno.test("expand should handle async inner observables", () => {
  // Arrange
  const notifications: Array<ObserverNotification<string>> = [];
  const innerSubjects: Record<string, Subject<string>> = {
    a: new Subject<string>(),
    b: new Subject<string>(),
    c: new Subject<string>(),
  };
  const source = new Subject<string>();
  const observable = pipe(
    source,
    expand((value) => innerSubjects[value] ?? empty),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next("a");
  innerSubjects.a.next("b");
  innerSubjects.b.next("c");
  innerSubjects.c.return();
  innerSubjects.b.return();
  innerSubjects.a.return();
  source.return();

  // Assert
  assertEquals(notifications, [
    ["next", "a"],
    ["next", "b"],
    ["next", "c"],
    ["return"],
  ]);
});

Deno.test("expand should handle concurrent inner subscriptions", () => {
  // Arrange
  const notifications: Array<ObserverNotification<string>> = [];
  const innerA = new Subject<string>();
  const innerB = new Subject<string>();
  const innerC = new Subject<string>();
  const innerD = new Subject<string>();
  const innerLookup: Record<string, Subject<string>> = {
    a: innerA,
    b: innerB,
    c: innerC,
    d: innerD,
  };
  const source = new Subject<string>();
  const observable = pipe(
    source,
    expand((value) => innerLookup[value] ?? empty),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next("a");
  source.next("b");
  innerA.next("c");
  innerB.next("d");
  innerC.return();
  innerD.return();
  innerA.return();
  innerB.return();
  source.return();

  // Assert
  assertEquals(notifications, [
    ["next", "a"],
    ["next", "b"],
    ["next", "c"],
    ["next", "d"],
    ["return"],
  ]);
});

Deno.test("expand should throw when inner observable throws", () => {
  // Arrange
  const error = new Error("inner error");
  const notifications: Array<ObserverNotification<number>> = [];
  const innerSubject = new Subject<number>();
  const source = new Subject<number>();
  const observable = pipe(
    source,
    expand(() => innerSubject),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next(1);
  innerSubject.next(2);
  innerSubject.throw(error);
  source.next(3);

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["throw", error],
  ]);
});

Deno.test("expand should throw when outer observable throws", () => {
  // Arrange
  const error = new Error("outer error");
  const notifications: Array<ObserverNotification<number>> = [];
  const innerSubject = new Subject<number>();
  const source = new Subject<number>();
  const observable = pipe(
    source,
    expand(() => innerSubject),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next(1);
  innerSubject.next(2);
  source.throw(error);
  innerSubject.next(3);

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["throw", error],
  ]);
});

Deno.test("expand should propagate first error when both inner and outer throw", () => {
  // Arrange
  const innerError = new Error("inner error");
  const outerError = new Error("outer error");
  const notifications: Array<ObserverNotification<number>> = [];
  const innerSubject = new Subject<number>();
  const source = new Subject<number>();
  source.subscribe(new Observer({ throw: noop }));
  const observable = pipe(
    source,
    expand(() => innerSubject),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next(1);
  innerSubject.next(2);
  innerSubject.throw(innerError);
  source.throw(outerError);

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["throw", innerError],
  ]);
});

Deno.test("expand should propagate error when project throws synchronously", () => {
  // Arrange
  const projectError = new Error("project threw");
  const notifications: Array<ObserverNotification<number>> = [];
  const source = new Subject<number>();
  const observable = pipe(
    source,
    expand((): never => {
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
  assertEquals(notifications, [["next", 1], ["throw", projectError]]);
});

Deno.test("expand should propagate from error when project returns non-observable", () => {
  // Arrange
  const notifications: Array<ObserverNotification<unknown>> = [];
  const source = new Subject<number>();
  const observable = pipe(
    source,
    // deno-lint-ignore no-explicit-any
    expand(() => "not an observable" as any),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next(1);

  // Assert
  assertEquals(notifications.length, 2);
  assertEquals(notifications[0], ["next", 1]);
  assertEquals(notifications[1][0], "throw");
  assertEquals(
    (notifications[1][1] as TypeError).message,
    "Parameter 1 is not of type 'Observable'",
  );
});

Deno.test("expand should return immediately when source is empty", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const observable = pipe(
    empty as Observable<number>,
    expand((value) => pipe([value * 2], ofIterable())),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("expand should handle unsubscription", () => {
  // Arrange
  let sourceAborted = false;
  let innerAborted = false;
  const controller = new AbortController();
  const source = new Observable<number>((observer) => {
    observer.signal.addEventListener("abort", () => (sourceAborted = true), {
      once: true,
    });
    observer.next(1);
  });
  const observable = pipe(
    source,
    expand(
      () =>
        new Observable<number>((observer) => {
          observer.signal.addEventListener(
            "abort",
            () => (innerAborted = true),
            { once: true },
          );
        }),
    ),
  );

  // Act
  observable.subscribe(new Observer({ signal: controller.signal }));
  controller.abort();

  // Assert
  assertEquals(sourceAborted, true);
  assertEquals(innerAborted, true);
});

Deno.test("expand should not return until all inner subscriptions return", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const inner1 = new Subject<number>();
  const inner2 = new Subject<number>();
  let innerCount = 0;
  const source = new Subject<number>();
  const observable = pipe(
    source,
    expand(() => {
      innerCount++;
      return innerCount === 1 ? inner1 : innerCount === 2 ? inner2 : empty;
    }),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  source.next(1);
  inner1.next(2);
  source.return();
  inner1.return();
  inner2.return();

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["return"],
  ]);
});

Deno.test("expand should handle deeply nested expansion", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = pipe([1], ofIterable<number>());
  const observable = pipe(
    source,
    expand((value) => (value < 5 ? pipe([value + 1], ofIterable()) : empty)),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["next", 4],
    ["next", 5],
    ["return"],
  ]);
});

Deno.test("expand should handle branching expansion (multiple values from inner)", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const source = pipe([1], ofIterable<number>());
  const observable = pipe(
    source,
    expand((value) => value < 3 ? pipe([value * 2, value * 3], ofIterable()) : empty),
    materialize(),
  );

  // Act
  observable.subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 4],
    ["next", 6],
    ["next", 3],
    ["return"],
  ]);
});

Deno.test("expand should have unique index counter per subscription", () => {
  // Arrange
  const indices1: number[] = [];
  const indices2: number[] = [];
  const source = pipe([1], ofIterable<number>());
  const observable = pipe(
    source,
    expand((value, index) => {
      if (indices1.length < 4 && indices2.length === 0) {
        indices1.push(index);
      } else {
        indices2.push(index);
      }
      return value < 4 ? pipe([value + 1], ofIterable()) : empty;
    }),
  );

  // Act
  observable.subscribe(new Observer());
  observable.subscribe(new Observer());

  // Assert
  assertEquals(indices1, [0, 1, 2, 3]);
  assertEquals(indices2, [0, 1, 2, 3]);
});

Deno.test("expand should reset index for each new subscription", () => {
  // Arrange
  const allIndices1: number[] = [];
  const allIndices2: number[] = [];
  const source = pipe([1], ofIterable<number>());
  const observable = pipe(
    source,
    expand((value, index) => {
      allIndices1.push(index);
      return value < 3 ? pipe([value + 1], ofIterable()) : empty;
    }),
  );
  const observable2 = pipe(
    source,
    expand((value, index) => {
      allIndices2.push(index);
      return value < 3 ? pipe([value + 1], ofIterable()) : empty;
    }),
  );

  // Act
  observable.subscribe(new Observer());
  observable2.subscribe(new Observer());

  // Assert
  assertEquals(allIndices1, [0, 1, 2]);
  assertEquals(allIndices2, [0, 1, 2]);
});

Deno.test("expand should have independent index counters for separate subscriptions to same observable", () => {
  // Arrange
  const subscription1Indices: number[] = [];
  const subscription2Indices: number[] = [];
  const source = pipe([1], ofIterable<number>());
  const wrapperObservable1 = pipe(
    source,
    expand((value, index) => {
      subscription1Indices.push(index);
      return value < 3 ? pipe([value + 1], ofIterable()) : empty;
    }),
  );
  const wrapperObservable2 = pipe(
    source,
    expand((value, index) => {
      subscription2Indices.push(index);
      return value < 3 ? pipe([value + 1], ofIterable()) : empty;
    }),
  );

  // Act
  wrapperObservable1.subscribe(new Observer());
  wrapperObservable2.subscribe(new Observer());

  // Assert
  assertEquals(subscription1Indices, [0, 1, 2]);
  assertEquals(subscription2Indices, [0, 1, 2]);
});

Deno.test("expand should share index counter across all recursion levels within single subscription", () => {
  // Arrange
  const indicesWithValues: Array<[number, number]> = [];
  const source = pipe([1, 10], ofIterable<number>());
  const observable = pipe(
    source,
    expand((value, index) => {
      indicesWithValues.push([value, index]);
      if (value === 1) return pipe([2], ofIterable());
      if (value === 10) return pipe([20], ofIterable());
      return empty;
    }),
  );

  // Act
  observable.subscribe(new Observer());

  // Assert
  const indices = indicesWithValues.map(([_, idx]) => idx);
  assertEquals(indices.length, 4);
  assertEquals(new Set(indices).size, 4);
  assertEquals(Math.min(...indices), 0);
  assertEquals(Math.max(...indices), 3);
});
