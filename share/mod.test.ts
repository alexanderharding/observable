import { assertEquals, assertStrictEquals, assertThrows } from "@std/assert";
import { Observer, Subject } from "@observable/core";
import { pipe } from "@observable/pipe";
import { share } from "./mod.ts";
import { ofIterable } from "@observable/of-iterable";
import { throwError } from "@observable/throw-error";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { ReplaySubject } from "@observable/replay-subject";
import { defer } from "@observable/defer";
import { never } from "@observable/never";

Deno.test("share should not throw when called with no connector argument", () => {
  // Arrange / Act / Assert
  share(...([] as unknown as Parameters<typeof share>));
});

Deno.test("share should throw when connector is not a function", () => {
  // Arrange / Act / Assert
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => share(1 as any),
    TypeError,
    "Parameter 1 is not of type 'Function'",
  );
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => share(null as any),
    TypeError,
    "Parameter 1 is not of type 'Function'",
  );
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => share("test" as any),
    TypeError,
    "Parameter 1 is not of type 'Function'",
  );
});

Deno.test("share should throw when called with no source", () => {
  // Arrange
  const operator = share();

  // Act / Assert
  assertThrows(
    () => operator(...([] as unknown as Parameters<typeof operator>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("share should throw when source is not an Observable", () => {
  // Arrange
  const operator = share();

  // Act / Assert
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => operator(1 as any),
    TypeError,
    "Parameter 1 is not of type 'Observable'",
  );
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => operator(null as any),
    TypeError,
    "Parameter 1 is not of type 'Observable'",
  );
  assertThrows(
    // deno-lint-ignore no-explicit-any
    () => operator(undefined as any),
    TypeError,
    "Parameter 1 is not of type 'Observable'",
  );
});

Deno.test("share should multicast values to all observers", () => {
  // Arrange
  const source = new Subject<number>();
  const shared = pipe(source, share());
  const notifications1: Array<ObserverNotification<number>> = [];
  const notifications2: Array<ObserverNotification<number>> = [];

  // Act
  pipe(shared, materialize()).subscribe(
    new Observer((notification) => notifications1.push(notification)),
  );
  pipe(shared, materialize()).subscribe(
    new Observer((notification) => notifications2.push(notification)),
  );
  source.next(1);
  source.next(2);
  source.next(3);

  // Assert
  assertEquals(notifications1, [["next", 1], ["next", 2], ["next", 3]]);
  assertEquals(notifications2, [["next", 1], ["next", 2], ["next", 3]]);
});

Deno.test("share should only subscribe to source once for multiple observers", () => {
  // Arrange
  let subscribeCount = 0;
  const source = defer(() => {
    subscribeCount++;
    return never;
  });
  const shared = pipe(source, share());

  // Act
  shared.subscribe(new Observer());
  shared.subscribe(new Observer());
  shared.subscribe(new Observer());

  // Assert
  assertStrictEquals(subscribeCount, 1);
});

Deno.test("share should not subscribe to source until first observer", () => {
  // Arrange
  let subscribed = false;
  const source = defer(() => {
    subscribed = true;
    return pipe([1], ofIterable());
  });
  const shared = pipe(source, share());
  assertStrictEquals(subscribed, false);

  // Act
  shared.subscribe(new Observer());

  // Assert
  assertStrictEquals(subscribed, true);
});

Deno.test("share should reset when all observers unsubscribe", () => {
  // Arrange
  let subscribeCount = 0;
  const source = defer(() => {
    subscribeCount++;
    return never;
  });
  const shared = pipe(source, share());
  const controller1 = new AbortController();
  const controller2 = new AbortController();

  // Act
  shared.subscribe(new Observer({ signal: controller1.signal }));
  shared.subscribe(new Observer({ signal: controller2.signal }));
  assertStrictEquals(subscribeCount, 1);
  controller1.abort();
  assertStrictEquals(subscribeCount, 1);
  controller2.abort();
  shared.subscribe(new Observer());

  // Assert
  assertStrictEquals(subscribeCount, 2);
});

Deno.test("share should propagate throw to all observers", () => {
  // Arrange
  const throwNotifier = new Subject<never>();
  const error = new Error("test error");
  const shared = pipe(throwNotifier, share());
  const notifications1: Array<ObserverNotification<number>> = [];
  const notifications2: Array<ObserverNotification<number>> = [];

  // Act
  pipe(shared, materialize()).subscribe(
    new Observer((notification) => notifications1.push(notification)),
  );
  pipe(shared, materialize()).subscribe(
    new Observer((notification) => notifications2.push(notification)),
  );
  throwNotifier.throw(error);

  // Assert
  assertEquals(notifications1, [["throw", error]]);
  assertEquals(notifications2, [["throw", error]]);
});

Deno.test("share should propagate return to all observers", () => {
  // Arrange
  const returnNotifier = new Subject<never>();
  const shared = pipe(returnNotifier, share());
  const notifications1: Array<ObserverNotification<never>> = [];
  const notifications2: Array<ObserverNotification<never>> = [];

  // Act
  pipe(shared, materialize()).subscribe(
    new Observer((notification) => notifications1.push(notification)),
  );
  pipe(shared, materialize()).subscribe(
    new Observer((notification) => notifications2.push(notification)),
  );
  returnNotifier.return();

  // Assert
  assertEquals(notifications1, [["return"]]);
  assertEquals(notifications2, [["return"]]);
});

Deno.test("share should use custom connector", () => {
  // Arrange
  let connectorCalled = false;
  const customSubject = new Subject<number>();
  const connector = () => {
    connectorCalled = true;
    return customSubject;
  };
  const source = pipe([1, 2, 3], ofIterable());
  const shared = pipe(source, share(connector));

  // Act
  shared.subscribe(new Observer());

  // Assert
  assertStrictEquals(connectorCalled, true);
});

Deno.test("share with ReplaySubject should replay values to late observers", () => {
  // Arrange
  const source = new Subject<number>();
  const shared = pipe(source, share(() => new ReplaySubject<number>(2)));
  const notifications1: Array<ObserverNotification<number>> = [];
  const notifications2: Array<ObserverNotification<number>> = [];

  // Act
  pipe(shared, materialize()).subscribe(
    new Observer((notification) => notifications1.push(notification)),
  );
  source.next(1);
  source.next(2);
  source.next(3);
  pipe(shared, materialize()).subscribe(
    new Observer((notification) => notifications2.push(notification)),
  );
  source.next(4);

  // Assert
  assertEquals(notifications1, [["next", 1], ["next", 2], ["next", 3], ["next", 4]]);
  assertEquals(notifications2, [["next", 2], ["next", 3], ["next", 4]]);
});

Deno.test("share should reset connection when all unsubscribe", () => {
  // Arrange
  let subscribeCount = 0;
  const source = defer(() => {
    subscribeCount++;
    return never;
  });
  const shared = pipe(source, share());
  const controller1 = new AbortController();
  const controller2 = new AbortController();

  // Act
  shared.subscribe(new Observer({ signal: controller1.signal }));
  shared.subscribe(new Observer({ signal: controller2.signal }));
  assertStrictEquals(subscribeCount, 1);
  controller1.abort();
  controller2.abort();
  shared.subscribe(new Observer());

  // Assert
  assertStrictEquals(subscribeCount, 2);
});

Deno.test("share should handle synchronous source return", () => {
  // Arrange
  const source = pipe([1, 2, 3], ofIterable());
  const shared = pipe(source, share());
  const notifications: Array<ObserverNotification<number>> = [];

  // Act
  pipe(shared, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["next", 3],
    ["return"],
  ]);
});

Deno.test("share should handle synchronous source throw", () => {
  // Arrange
  const error = new Error("sync error");
  const source = throwError(error);
  const shared = pipe(source, share());
  const notifications: Array<ObserverNotification<never>> = [];

  // Act
  pipe(shared, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", error]]);
});

Deno.test("share should create new subject after reset via unsubscribe", () => {
  // Arrange
  let connectionCount = 0;
  const connector = () => {
    connectionCount++;
    return new Subject<number>();
  };
  const source = never;
  const shared = pipe(source, share(connector));
  const controller1 = new AbortController();

  // Act
  shared.subscribe(new Observer({ signal: controller1.signal }));
  assertStrictEquals(connectionCount, 1);
  controller1.abort();
  shared.subscribe(new Observer());

  // Assert
  assertStrictEquals(connectionCount, 2);
});

Deno.test("share should create new source subscription after source returns", () => {
  // Arrange
  let sourceSubscribeCount = 0;
  const source = defer(() => {
    sourceSubscribeCount++;
    return pipe([sourceSubscribeCount], ofIterable());
  });
  const shared = pipe(source, share());
  const notifications1: Array<ObserverNotification<number>> = [];
  const notifications2: Array<ObserverNotification<number>> = [];

  // Act
  pipe(shared, materialize()).subscribe(
    new Observer((notification) => notifications1.push(notification)),
  );
  assertStrictEquals(sourceSubscribeCount, 1);
  pipe(shared, materialize()).subscribe(
    new Observer((notification) => notifications2.push(notification)),
  );

  // Assert
  assertStrictEquals(sourceSubscribeCount, 2);
  assertEquals(notifications1, [["next", 1], ["return"]]);
  assertEquals(notifications2, [["next", 2], ["return"]]);
});

Deno.test("share should not create new subject for second observer", () => {
  // Arrange
  let connectionCount = 0;
  const connector = () => {
    connectionCount++;
    return new Subject<number>();
  };
  const source = never;
  const shared = pipe(source, share(connector));

  // Act
  shared.subscribe(new Observer());
  shared.subscribe(new Observer());
  shared.subscribe(new Observer());

  // Assert
  assertStrictEquals(connectionCount, 1);
});

Deno.test("share should handle late observer joining during emission", () => {
  // Arrange
  const source = new Subject<number>();
  const shared = pipe(source, share());
  const notifications1: Array<ObserverNotification<number>> = [];
  const notifications2: Array<ObserverNotification<number>> = [];

  // Act
  pipe(shared, materialize()).subscribe(
    new Observer((notification) => notifications1.push(notification)),
  );
  source.next(1);
  pipe(shared, materialize()).subscribe(
    new Observer((notification) => notifications2.push(notification)),
  );
  source.next(2);
  source.next(3);

  // Assert
  assertEquals(notifications1, [["next", 1], ["next", 2], ["next", 3]]);
  assertEquals(notifications2, [["next", 2], ["next", 3]]);
});

Deno.test("share should handle observer unsubscribing during emission", () => {
  // Arrange
  const source = new Subject<number>();
  const shared = pipe(source, share());
  const notifications1: Array<ObserverNotification<number>> = [];
  const notifications2: Array<ObserverNotification<number>> = [];
  const controller1 = new AbortController();

  // Act
  pipe(shared, materialize()).subscribe(
    new Observer({
      signal: controller1.signal,
      next: (notification) => {
        notifications1.push(notification);
        if (notification[0] === "next" && notification[1] === 2) controller1.abort();
      },
    }),
  );
  pipe(shared, materialize()).subscribe(
    new Observer((notification) => notifications2.push(notification)),
  );
  source.next(1);
  source.next(2);
  source.next(3);

  // Assert
  assertEquals(notifications1, [["next", 1], ["next", 2]]);
  assertEquals(notifications2, [["next", 1], ["next", 2], ["next", 3]]);
});

Deno.test("share should work with observable-like sources", () => {
  // Arrange
  const observableLike = {
    subscribe(observer: Observer<number>) {
      observer.next(1);
      observer.next(2);
      observer.return();
    },
  };
  const shared = pipe(observableLike, share());
  const notifications: Array<ObserverNotification<number>> = [];

  // Act
  pipe(shared, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
    ["return"],
  ]);
});

Deno.test("share should propagate asObservable error when connector returns non-observable", () => {
  // Arrange
  const source = new Subject<number>();
  const shared = pipe(
    source,
    share(() => "not a subject" as unknown as Subject<number>),
  );
  const notifications: Array<ObserverNotification<unknown>> = [];

  // Act
  pipe(shared, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications.length, 1);
  assertEquals(notifications[0][0], "throw");
  assertEquals(
    (notifications[0][1] as TypeError).message,
    "Parameter 1 is not of type 'Observable'",
  );
});

Deno.test("share should propagate error when connector throws synchronously", () => {
  // Arrange
  const connectorError = new Error("connector threw");
  const source = new Subject<number>();
  const shared = pipe(
    source,
    share((): never => {
      throw connectorError;
    }),
  );
  const notifications: Array<ObserverNotification<unknown>> = [];

  // Act
  pipe(shared, materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", connectorError]]);
});
