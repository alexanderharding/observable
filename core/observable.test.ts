import { assertEquals, assertInstanceOf, assertStrictEquals, assertThrows } from "@std/assert";
import { Observer } from "./observer.ts";
import { Observable } from "./observable.ts";
import { noop } from "@observable/internal";

Deno.test("Observable.toString should be '[object Observable]'", () => {
  // Arrange / Act / Assert
  assertStrictEquals(`${new Observable(noop)}`, "[object Observable]");
});

Deno.test("Observable.constructor should be frozen", () => {
  // Arrange / Act / Assert
  assertStrictEquals(Object.isFrozen(Observable), true);
});

Deno.test("Observable.constructor should be created as frozen", () => {
  // Arrange / Act / Assert
  assertStrictEquals(Object.isFrozen(new Observable(noop)), true);
});

Deno.test("Observable.prototype should be frozen", () => {
  // Arrange / Act / Assert
  assertStrictEquals(Object.isFrozen(Observable.prototype), true);
});

Deno.test(
  "Observable.constructor should throw when creating with no arguments",
  () => {
    // Arrange / Act / Assert
    assertThrows(
      () =>
        new Observable(
          ...([] as unknown as ConstructorParameters<typeof Observable>),
        ),
      TypeError,
      "1 argument required but 0 present",
    );
  },
);

Deno.test(
  "Observable.constructor should throw when creating with invalid subscribe function",
  () => {
    // Arrange / Act / Assert
    assertThrows(
      // This type-cast is necessary for this test case.
      // deno-lint-ignore no-explicit-any
      () => new Observable(1 as any),
      TypeError,
      "Parameter 1 is not of type 'Function'",
    );
    assertThrows(
      // This type-cast is necessary for this test case.
      // deno-lint-ignore no-explicit-any
      () => new Observable(null as any),
      TypeError,
      "Parameter 1 is not of type 'Function'",
    );
    assertThrows(
      () =>
        new Observable(
          undefined as unknown as ConstructorParameters<typeof Observable>[0],
        ),
      TypeError,
      "Parameter 1 is not of type 'Function'",
    );
  },
);

Deno.test(
  "Observable.constructor should not throw when creating with more than 1 argument",
  () => {
    // Arrange / Act / Assert
    new Observable(
      ...([noop, noop] as unknown as ConstructorParameters<typeof Observable>),
    );
  },
);

Deno.test(
  "Observable.subscribe should not execute when observer is aborted",
  () => {
    // Arrange
    const observer = new Observer();
    const subscribeCalls: Array<Parameters<Observable["subscribe"]>> = [];
    const subscribeFn = (observer: Observer) => subscribeCalls.push([observer]);
    const observable = new Observable(subscribeFn);
    observer.return();
    assertStrictEquals(observer.signal.aborted, true);

    // Act
    observable.subscribe(observer);

    // Assert
    assertEquals(subscribeCalls, []);
  },
);

Deno.test(
  "Observable.subscribe should throw when 'this' is not an Observable instance",
  () => {
    // Arrange
    assertThrows(
      () => new Observable(noop).subscribe.apply(null, [new Observer()]),
      TypeError,
      "'this' is not instanceof 'Observable'",
    );
  },
);

Deno.test(
  "Observable.subscribe should throw when observer is not an object",
  () => {
    // Arrange
    assertThrows(
      () => new Observable(noop).subscribe(1 as unknown as Observer),
      TypeError,
      "Parameter 1 is not of type 'Observer'",
    );
  },
);

Deno.test("Observable.subscribe should throw when observer is null", () => {
  // Arrange
  assertThrows(
    () => new Observable(noop).subscribe(null as unknown as Observer),
    TypeError,
    "Parameter 1 is not of type 'Observer'",
  );
});

Deno.test(
  "Observable.subscribe should throw when observer is undefined",
  () => {
    // Arrange
    assertThrows(
      () => new Observable(noop).subscribe(undefined as unknown as Observer),
      TypeError,
      "Parameter 1 is not of type 'Observer'",
    );
  },
);

Deno.test(
  "Observable.subscribe should throw when observer is a partial observer",
  () => {
    // Arrange
    assertThrows(
      () =>
        new Observable(noop).subscribe({
          next: noop,
        } as unknown as Observer),
      TypeError,
      "Parameter 1 is not of type 'Observer'",
    );
  },
);

Deno.test(
  "Observable.subscribe should create a new Observer instance correctly when subscribe is called with a non-Observer instance",
  () => {
    // Arrange
    const controller = new AbortController();
    const nextCalls: Array<Parameters<Observer["next"]>> = [];
    const throwCalls: Array<Parameters<Observer["throw"]>> = [];
    const returnCalls: Array<Parameters<Observer["return"]>> = [];
    const subscribeCalls: Array<Parameters<Observable["subscribe"]>> = [];
    const observable = new Observable<number>((observer) => subscribeCalls.push([observer]));

    // Act
    observable.subscribe(
      new Observer({
        next: (value) => nextCalls.push([value]),
        return: () => returnCalls.push([]),
        throw: (value) => throwCalls.push([value]),
        signal: controller.signal,
      }),
    );
    const subscriptionObserver = subscribeCalls[0][0];
    subscriptionObserver.next(1);
    subscriptionObserver.return();

    // Assert
    assertInstanceOf(subscriptionObserver, Observer);
    assertStrictEquals(subscriptionObserver.signal.aborted, true);
    assertStrictEquals(controller.signal.aborted, false);
    assertEquals(nextCalls, [[1]]);
    assertEquals(returnCalls, [[]]);
    assertEquals(throwCalls, []);
  },
);

Deno.test(
  "Observable.subscribe should not create a new Observer instance when subscribe is called with an existing Observer instance",
  () => {
    // Arrange
    const observer = new Observer();
    const subscribeCalls: Array<Parameters<Observable["subscribe"]>> = [];
    const subscribeFn: Observable["subscribe"] = (observer) => subscribeCalls.push([observer]);
    const observable = new Observable(subscribeFn);

    // Act
    observable.subscribe(observer);

    // Assert
    assertStrictEquals(subscribeCalls[0][0], observer);
  },
);

Deno.test(
  "Observable.subscribe should not throw when internal subscribe throws",
  () => {
    // Arrange
    const error = new Error("this should be handled");
    const subscribeCalls: Array<Parameters<Observable["subscribe"]>> = [];
    const subscribeFn: Observable["subscribe"] = (observer) => {
      subscribeCalls.push([observer]);
      throw error;
    };
    const throwCalls: Array<Parameters<Observer["throw"]>> = [];
    const observable = new Observable(subscribeFn);

    // Act / Assert
    observable.subscribe(
      new Observer({ throw: (value) => throwCalls.push([value]) }),
    );
    assertEquals(throwCalls, [[error]]);
  },
);

Deno.test(
  "Observable should call internal subscribe again on resubscribe",
  () => {
    // Arrange;
    const subscribeCalls: Array<Parameters<Observable["subscribe"]>> = [];
    const subscribeFn: Observable["subscribe"] = (observer) => subscribeCalls.push([observer]);
    const observable = new Observable(subscribeFn);

    // Act
    observable.subscribe(new Observer());
    observable.subscribe(new Observer());

    // Assert
    assertEquals(subscribeCalls.length, 2);
  },
);

Deno.test(
  "Subject should enforce the correct 'this' binding when calling instance methods",
  () => {
    assertThrows(
      () => Observable.prototype.subscribe(new Observer()),
      TypeError,
      "'this' is not instanceof 'Observable'",
    );
  },
);
