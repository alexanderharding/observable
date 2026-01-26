import { assertEquals, assertInstanceOf, assertThrows } from "@std/assert";
import { Observable, Observer, Subject } from "@observable/core";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";
import { throwError } from "@observable/throw-error";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import {
  Observable as RxJsObservable,
  of as rxJsOf,
  Subject as RxJsSubject,
  type Subscriber,
  throwError as rxJsThrowError,
} from "rxjs";
import { asObservable, asRxJsObservable } from "./mod.ts";

Deno.test("asObservable should convert RxJS Observable and emit values", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const rxjsObservable = rxJsOf(1, 2, 3);

  // Act
  pipe(rxjsObservable, asObservable(), materialize()).subscribe(
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

Deno.test("asObservable should pump errors through itself", () => {
  // Arrange
  const error = new Error("test error");
  const notifications: Array<ObserverNotification<number>> = [];
  const rxjsObservable = rxJsThrowError(() => error);

  // Act
  pipe(rxjsObservable, asObservable(), materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );

  // Assert
  assertEquals(notifications, [["throw", error]]);
});

Deno.test("asObservable should handle completion", () => {
  // Arrange
  const notifications: Array<ObserverNotification<never>> = [];
  const rxjsSubject = new RxJsSubject<never>();

  // Act
  pipe(rxjsSubject.asObservable(), asObservable(), materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  rxjsSubject.complete();

  // Assert
  assertEquals(notifications, [["return"]]);
});

Deno.test("asObservable should handle unsubscription via abort signal", () => {
  // Arrange
  let rxjsUnsubscribed = false;
  const controller = new AbortController();
  const rxjsObservable = new RxJsObservable<number>(() => () => rxjsUnsubscribed = true);

  // Act
  pipe(rxjsObservable, asObservable()).subscribe(
    new Observer({ signal: controller.signal }),
  );
  controller.abort();

  // Assert
  assertEquals(rxjsUnsubscribed, true);
});

Deno.test("asObservable should emit values before abort signal", () => {
  // Arrange
  const notifications: Array<ObserverNotification<number>> = [];
  const controller = new AbortController();
  const rxjsSubject = new RxJsSubject<number>();

  // Act
  pipe(rxjsSubject.asObservable(), asObservable(), materialize()).subscribe(
    new Observer({
      signal: controller.signal,
      next: (notification) => {
        notifications.push(notification);
        if (notification[0] === "next" && notification[1] === 2) {
          controller.abort();
        }
      },
    }),
  );
  rxjsSubject.next(1);
  rxjsSubject.next(2);
  rxjsSubject.next(3);

  // Assert
  assertEquals(notifications, [
    ["next", 1],
    ["next", 2],
  ]);
});

Deno.test(
  "asObservable should throw MinimumArgumentsRequiredError when called with no arguments",
  () => {
    // Arrange
    const operator = asObservable();

    // Act & Assert
    assertThrows(
      () => (operator as () => Observable<unknown>)(),
      MinimumArgumentsRequiredError,
    );
  },
);

Deno.test(
  "asObservable should throw ParameterTypeError when called with non-RxJS Observable",
  () => {
    // Arrange
    const operator = asObservable();
    const notAnRxjsObservable = { subscribe: () => {} };

    // Act & Assert
    assertThrows(
      () => operator(notAnRxjsObservable as RxJsObservable<unknown>),
      ParameterTypeError,
    );
  },
);

Deno.test(
  "asObservable should return an Observable instance",
  () => {
    // Arrange
    const rxjsObservable = rxJsOf(1, 2, 3);

    // Act
    const result = pipe(rxjsObservable, asObservable());

    // Assert
    assertInstanceOf(result, Observable);
  },
);

Deno.test(
  "asRxJsObservable should convert Observable and emit values",
  () => {
    // Arrange
    const values: Array<number> = [];
    let completed = false;
    const observable = of([1, 2, 3]);

    // Act
    pipe(observable, asRxJsObservable()).subscribe({
      next: (value) => values.push(value),
      complete: () => (completed = true),
    });

    // Assert
    assertEquals(values, [1, 2, 3]);
    assertEquals(completed, true);
  },
);

Deno.test("asRxJsObservable should pump errors through itself", () => {
  // Arrange
  const error = new Error("test error");
  let receivedError: unknown;
  const observable = throwError(error);

  // Act
  pipe(observable, asRxJsObservable()).subscribe({
    error: (e) => (receivedError = e),
  });

  // Assert
  assertEquals(receivedError, error);
});

Deno.test("asRxJsObservable should handle completion", () => {
  // Arrange
  let completed = false;
  const subject = new Subject<never>();

  // Act
  pipe(subject, asRxJsObservable()).subscribe({
    complete: () => (completed = true),
  });
  subject.return();

  // Assert
  assertEquals(completed, true);
});

Deno.test("asRxJsObservable should handle unsubscription", () => {
  // Arrange
  let sourceAborted = false;
  const source = new Observable<number>((observer) => {
    observer.signal.addEventListener("abort", () => (sourceAborted = true), {
      once: true,
    });
  });

  // Act
  pipe(source, asRxJsObservable()).subscribe().unsubscribe();

  // Assert
  assertEquals(sourceAborted, true);
});

Deno.test("asRxJsObservable should emit values before unsubscription", () => {
  // Arrange
  const values: Array<number> = [];
  const subject = new Subject<number>();

  // Act
  const subscription = pipe(subject, asRxJsObservable()).subscribe({
    next: (value) => {
      values.push(value);
      if (value === 2) subscription.unsubscribe();
    },
  });
  subject.next(1);
  subject.next(2);
  subject.next(3);

  // Assert
  assertEquals(values, [1, 2]);
});

Deno.test(
  "asRxJsObservable should throw MinimumArgumentsRequiredError when called with no arguments",
  () => {
    // Arrange
    const operator = asRxJsObservable();

    // Act & Assert
    assertThrows(
      () => (operator as () => RxJsObservable<unknown>)(),
      MinimumArgumentsRequiredError,
    );
  },
);

Deno.test(
  "asRxJsObservable should throw ParameterTypeError when called with non-Observable",
  () => {
    // Arrange
    const operator = asRxJsObservable();
    const notAnObservable = {};

    // Act & Assert
    assertThrows(
      () => operator(notAnObservable as Observable<unknown>),
      ParameterTypeError,
    );
  },
);

Deno.test(
  "asRxJsObservable should return an RxJS Observable instance",
  () => {
    // Arrange
    const observable = of([1, 2, 3]);

    // Act
    const result = pipe(observable, asRxJsObservable());

    // Assert
    assertInstanceOf(result, RxJsObservable);
  },
);

Deno.test(
  "asRxJsObservable should handle late subscriber unsubscription cleanup",
  () => {
    // Arrange
    let sourceAborted = false;
    const source = new Observable<number>((observer) => {
      observer.signal.addEventListener("abort", () => (sourceAborted = true), {
        once: true,
      });
      observer.next(1);
      observer.next(2);
      observer.return();
    });
    const rxjsObservable = pipe(source, asRxJsObservable());
    const values: Array<number> = [];
    let completed = false;

    // Act
    rxjsObservable.subscribe({
      next: (value) => values.push(value),
      complete: () => (completed = true),
    });

    // Assert
    assertEquals(values, [1, 2]);
    assertEquals(completed, true);
    assertEquals(sourceAborted, true);
  },
);

Deno.test(
  "round-trip: Observable -> RxJS Observable -> Observable should preserve values",
  () => {
    // Arrange
    const notifications: Array<ObserverNotification<number>> = [];
    const source = of([1, 2, 3]);

    // Act
    pipe(
      source,
      asRxJsObservable(),
      asObservable(),
      materialize(),
    ).subscribe(
      new Observer((notification) => notifications.push(notification)),
    );

    // Assert
    assertEquals(notifications, [
      ["next", 1],
      ["next", 2],
      ["next", 3],
      ["return"],
    ]);
  },
);

Deno.test(
  "round-trip: RxJS Observable -> Observable -> RxJS Observable should preserve values",
  () => {
    // Arrange
    const values: Array<number> = [];
    let completed = false;
    const source = rxJsOf(1, 2, 3);

    // Act
    pipe(source, asObservable(), asRxJsObservable()).subscribe({
      next: (value) => values.push(value),
      complete: () => (completed = true),
    });

    // Assert
    assertEquals(values, [1, 2, 3]);
    assertEquals(completed, true);
  },
);

Deno.test(
  "asRxJsObservable should abort source before calling complete to prevent reentrancy",
  () => {
    // Arrange
    const events: Array<string> = [];
    const source = new Observable<number>((observer) => {
      observer.signal.addEventListener("abort", () => events.push("abort"), { once: true });
      observer.next(1);
      observer.return();
    });
    const rxjsObservable = pipe(source, asRxJsObservable());

    // Act
    rxjsObservable.subscribe({
      complete: () => events.push("complete"),
    });

    // Assert
    assertEquals(events, ["abort", "complete"]);
  },
);

Deno.test(
  "asRxJsObservable should abort source before calling error to prevent reentrancy",
  () => {
    // Arrange
    const events: Array<string> = [];
    const error = new Error("test");
    const source = new Observable<number>((observer) => {
      observer.signal.addEventListener("abort", () => events.push("abort"), { once: true });
      observer.next(1);
      observer.throw(error);
    });
    const rxjsObservable = pipe(source, asRxJsObservable());

    // Act
    rxjsObservable.subscribe({
      error: () => events.push("error"),
    });

    // Assert
    assertEquals(events, ["abort", "error"]);
  },
);

Deno.test(
  "asObservable should mark subscriber as closed during complete callback",
  () => {
    // Arrange
    let subscriberClosedDuringComplete = false;
    let capturedSubscriber: Subscriber<number> | null = null;
    const rxjsObservable = new RxJsObservable<number>((subscriber) => {
      capturedSubscriber = subscriber as Subscriber<number>;
      subscriber.next(1);
      subscriber.complete();
    });
    const observable = pipe(rxjsObservable, asObservable());

    // Act
    observable.subscribe(
      new Observer({
        return: () => {
          subscriberClosedDuringComplete = capturedSubscriber?.closed ?? false;
        },
      }),
    );

    // Assert
    assertEquals(subscriberClosedDuringComplete, true);
  },
);

Deno.test(
  "asObservable should mark subscriber as closed during error callback",
  () => {
    // Arrange
    let subscriberClosedDuringError = false;
    let capturedSubscriber: Subscriber<number> | null = null;
    const error = new Error("test");
    const rxjsObservable = new RxJsObservable<number>((subscriber) => {
      capturedSubscriber = subscriber as Subscriber<number>;
      subscriber.next(1);
      subscriber.error(error);
    });
    const observable = pipe(rxjsObservable, asObservable());

    // Act
    observable.subscribe(
      new Observer({
        throw: () => {
          subscriberClosedDuringError = capturedSubscriber?.closed ?? false;
        },
      }),
    );

    // Assert
    assertEquals(subscriberClosedDuringError, true);
  },
);
