import { assertEquals, assertRejects, assertStrictEquals, assertThrows } from "@std/assert";
import { Observable, Observer } from "@observable/core";
import { pipe } from "@observable/pipe";
import { asAsyncIterable } from "./mod.ts";
import { of } from "@observable/of";
import { throwError } from "@observable/throw-error";
import { empty } from "@observable/empty";

Deno.test("asAsyncIterable should throw when called with no source", () => {
  // Arrange
  const operator = asAsyncIterable();

  // Act / Assert
  assertThrows(
    () => operator(...([] as unknown as Parameters<typeof operator>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("asAsyncIterable should throw when source is not an Observable", () => {
  // Arrange
  const operator = asAsyncIterable();

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

Deno.test("asAsyncIterable should iterate all values from synchronous observable", async () => {
  // Arrange
  const source = of([1, 2, 3]);
  const iterable = pipe(source, asAsyncIterable());
  const values: number[] = [];

  // Act
  for await (const value of iterable) {
    values.push(value);
  }

  // Assert
  assertEquals(values, [1, 2, 3]);
});

Deno.test("asAsyncIterable should handle empty observable", async () => {
  // Arrange
  const iterable = pipe(empty, asAsyncIterable());
  const values: never[] = [];

  // Act
  for await (const value of iterable) {
    values.push(value);
  }

  // Assert
  assertEquals(values, []);
});

Deno.test("asAsyncIterable should reject on observable throw", async () => {
  // Arrange
  const error = new Error("test error");
  const iterable = pipe(throwError(error), asAsyncIterable());

  // Act / Assert
  await assertRejects(
    async () => {
      for await (const _ of iterable) {
        // Should not reach here
      }
    },
    Error,
    "test error",
  );
});

Deno.test("asAsyncIterable should handle throw after some values", async () => {
  // Arrange
  const error = new Error("test error");
  const source = new Observable<number>((observer) => {
    observer.next(1);
    observer.next(2);
    observer.throw(error);
  });
  const iterable = pipe(source, asAsyncIterable());
  const values: number[] = [];

  // Act / Assert
  await assertRejects(
    async () => {
      for await (const value of iterable) {
        values.push(value);
      }
    },
    Error,
    "test error",
  );
  assertEquals(values, [1, 2]);
});

Deno.test("asAsyncIterable should abort subscription on iterator return", async () => {
  // Arrange
  let subscriptionAborted = false;
  const source = new Observable<number>((observer) => {
    observer.signal.addEventListener("abort", () => {
      subscriptionAborted = true;
    }, { once: true });
    observer.next(1);
    observer.next(2);
    observer.next(3);
  });
  const iterable = pipe(source, asAsyncIterable());
  const values: number[] = [];

  // Act
  for await (const value of iterable) {
    values.push(value);
    if (value === 2) break;
  }

  // Assert
  assertEquals(values, [1, 2]);
  assertStrictEquals(subscriptionAborted, true);
});

Deno.test("asAsyncIterable should return done after observable returns", async () => {
  // Arrange
  const source = of([1, 2]);
  const iterable = pipe(source, asAsyncIterable());
  const iterator = iterable[Symbol.asyncIterator]();

  // Act
  const result1 = await iterator.next();
  const result2 = await iterator.next();
  const result3 = await iterator.next();
  const result4 = await iterator.next();

  // Assert
  assertEquals(result1, { value: 1, done: false });
  assertEquals(result2, { value: 2, done: false });
  assertEquals(result3, { value: undefined, done: true });
  assertEquals(result4, { value: undefined, done: true });
});

Deno.test("asAsyncIterable should handle async observable emissions", async () => {
  // Arrange
  const source = new Observable<number>((observer) => {
    setTimeout(() => observer.next(1), 10);
    setTimeout(() => observer.next(2), 20);
    setTimeout(() => observer.next(3), 30);
    setTimeout(() => observer.return(), 40);
  });
  const iterable = pipe(source, asAsyncIterable());
  const values: number[] = [];

  // Act
  for await (const value of iterable) {
    values.push(value);
  }

  // Assert
  assertEquals(values, [1, 2, 3]);
});

Deno.test("asAsyncIterable return method should abort subscription and return done", async () => {
  // Arrange
  let subscriptionAborted = false;
  const source = new Observable<number>((observer) => {
    observer.signal.addEventListener("abort", () => {
      subscriptionAborted = true;
    }, { once: true });
  });
  const iterable = pipe(source, asAsyncIterable());
  const iterator = iterable[Symbol.asyncIterator]();

  // Start the subscription by calling next (it will wait since source doesn't emit)
  iterator.next();

  // Act
  const returnResult = await iterator.return!();

  // Assert
  assertEquals(returnResult, { value: undefined, done: true });
  assertStrictEquals(subscriptionAborted, true);
});

Deno.test("asAsyncIterable throw method should abort subscription and reject", async () => {
  // Arrange
  let subscriptionAborted = false;
  const error = new Error("iterator throw");
  const source = new Observable<number>((observer) => {
    observer.signal.addEventListener("abort", () => {
      subscriptionAborted = true;
    }, { once: true });
  });
  const iterable = pipe(source, asAsyncIterable());
  const iterator = iterable[Symbol.asyncIterator]();

  // Start the subscription
  iterator.next();

  // Act / Assert
  await assertRejects(
    async () => await iterator.throw!(error),
    Error,
    "iterator throw",
  );
  assertStrictEquals(subscriptionAborted, true);
});

Deno.test("asAsyncIterable should buffer values when emitted faster than consumed", async () => {
  // Arrange
  let capturedObserver: Observer<number> | undefined;
  const source = new Observable<number>((observer) => {
    capturedObserver = observer;
  });
  const iterable = pipe(source, asAsyncIterable());
  const iterator = iterable[Symbol.asyncIterator]();

  // Start iteration to activate subscription
  const nextPromise = iterator.next();

  // Emit multiple values before consuming
  capturedObserver!.next(1);
  capturedObserver!.next(2);
  capturedObserver!.next(3);

  // Act - consume all values
  const result1 = await nextPromise;
  const result2 = await iterator.next();
  const result3 = await iterator.next();

  // Assert
  assertEquals(result1, { value: 1, done: false });
  assertEquals(result2, { value: 2, done: false });
  assertEquals(result3, { value: 3, done: false });
});

Deno.test("asAsyncIterable should resolve waiting promises when values arrive", async () => {
  // Arrange
  let capturedObserver: Observer<number> | undefined;
  const source = new Observable<number>((observer) => {
    capturedObserver = observer;
  });
  const iterable = pipe(source, asAsyncIterable());
  const iterator = iterable[Symbol.asyncIterator]();

  // Request values before they're emitted
  const promise1 = iterator.next();
  const promise2 = iterator.next();

  // Act - emit values after requesting
  capturedObserver!.next(10);
  capturedObserver!.next(20);

  // Assert
  const result1 = await promise1;
  const result2 = await promise2;
  assertEquals(result1, { value: 10, done: false });
  assertEquals(result2, { value: 20, done: false });
});

Deno.test("asAsyncIterable should resolve all pending promises on return", async () => {
  // Arrange
  let capturedObserver: Observer<number> | undefined;
  const source = new Observable<number>((observer) => {
    capturedObserver = observer;
  });
  const iterable = pipe(source, asAsyncIterable());
  const iterator = iterable[Symbol.asyncIterator]();

  // Request values before return
  const promise1 = iterator.next();
  const promise2 = iterator.next();

  // Act - observable returns
  capturedObserver!.return();

  // Assert
  const result1 = await promise1;
  const result2 = await promise2;
  assertEquals(result1, { value: undefined, done: true });
  assertEquals(result2, { value: undefined, done: true });
});

Deno.test("asAsyncIterable should reject all pending promises on throw", async () => {
  // Arrange
  const error = new Error("observable error");
  let capturedObserver: Observer<number> | undefined;
  const source = new Observable<number>((observer) => {
    capturedObserver = observer;
  });
  const iterable = pipe(source, asAsyncIterable());
  const iterator = iterable[Symbol.asyncIterator]();

  // Request values before throw
  const promise1 = iterator.next();
  const promise2 = iterator.next();

  // Act - observable throws
  capturedObserver!.throw(error);

  // Assert
  await assertRejects(async () => await promise1, Error, "observable error");
  await assertRejects(async () => await promise2, Error, "observable error");
});

Deno.test("asAsyncIterable should only start subscription on first next call", async () => {
  // Arrange
  let subscribed = false;
  const source = new Observable<number>((observer) => {
    subscribed = true;
    observer.next(1);
    observer.return();
  });
  const iterable = pipe(source, asAsyncIterable());
  const iterator = iterable[Symbol.asyncIterator]();

  // Assert - not subscribed yet
  assertStrictEquals(subscribed, false);

  // Act
  await iterator.next();

  // Assert - now subscribed
  assertStrictEquals(subscribed, true);
});

Deno.test("asAsyncIterable should reject subsequent next calls after throw", async () => {
  // Arrange
  const error = new Error("test");
  const source = throwError(error);
  const iterable = pipe(source, asAsyncIterable());
  const iterator = iterable[Symbol.asyncIterator]();

  // First next triggers the throw
  await assertRejects(async () => await iterator.next(), Error, "test");

  // Subsequent next calls should also reject
  await assertRejects(async () => await iterator.next(), Error, "test");
});
