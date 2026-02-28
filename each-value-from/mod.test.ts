import { assertEquals, assertRejects, assertStrictEquals } from "@std/assert";
import { Observable, type Observer, Subject } from "@observable/core";
import { pipe } from "@observable/pipe";
import { eachValueFrom } from "./mod.ts";
import { ofIterable } from "@observable/of-iterable";
import { throwError } from "@observable/throw-error";
import { empty } from "@observable/empty";
import { flat } from "@observable/flat";
import { never } from "@observable/never";
import { finalize } from "@observable/finalize";
import { timeout } from "@observable/timeout";
import { drop } from "@observable/drop";
import { map } from "@observable/map";
import { defer } from "@observable/defer";

Deno.test("eachValueFrom should throw when iterated with no source", () => {
  // Arrange / Act / Assert
  assertRejects(
    () => eachValueFrom(...([] as unknown as Parameters<typeof eachValueFrom>)).next(),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("eachValueFrom should throw when iterated with a non-Observable source", () => {
  // Arrange / Act / Assert
  assertRejects(
    // deno-lint-ignore no-explicit-any
    () => eachValueFrom(1 as any).next(),
    TypeError,
    "Parameter 1 is not of type 'Observable'",
  );
  assertRejects(
    // deno-lint-ignore no-explicit-any
    () => eachValueFrom(null as any).next(),
    TypeError,
    "Parameter 1 is not of type 'Observable'",
  );
  assertRejects(
    // deno-lint-ignore no-explicit-any
    () => eachValueFrom(undefined as any).next(),
    TypeError,
    "Parameter 1 is not of type 'Observable'",
  );
});

Deno.test("eachValueFrom should iterate all values from synchronous observable", async () => {
  // Arrange
  const source = pipe([1, 2, 3], ofIterable());
  const values: Array<number> = [];

  // Act
  for await (const value of eachValueFrom(source)) {
    values.push(value);
  }

  // Assert
  assertEquals(values, [1, 2, 3]);
});

Deno.test("eachValueFrom should handle empty observable", async () => {
  // Arrange
  const values: never[] = [];

  // Act
  for await (const value of eachValueFrom(empty)) {
    values.push(value);
  }

  // Assert
  assertEquals(values, []);
});

Deno.test("eachValueFrom should reject on observable throw", async () => {
  // Arrange
  const error = new Error("test error");

  // Act / Assert
  await assertRejects(
    async () => {
      for await (const _ of eachValueFrom(throwError(error))) {
        // Should not reach here
      }
    },
    Error,
    "test error",
  );
});

Deno.test("eachValueFrom should handle throw after some values", async () => {
  // Arrange
  const error = new Error("test error");
  const source = flat([pipe([1, 2], ofIterable()), throwError(error)]);
  const values: Array<number> = [];

  // Act / Assert
  await assertRejects(
    async () => {
      for await (const value of eachValueFrom(source)) {
        values.push(value);
      }
    },
    Error,
    "test error",
  );
  assertEquals(values, [1, 2]);
});

Deno.test("eachValueFrom should abort subscription on iterator return", async () => {
  // Arrange
  let subscriptionAborted = false;
  const source = pipe(
    flat([pipe([1, 2, 2], ofIterable()), never]),
    finalize(() => subscriptionAborted = true),
  );
  const values: Array<number> = [];

  // Act
  for await (const value of eachValueFrom(source)) {
    values.push(value);
    if (value === 2) break;
  }

  // Assert
  assertEquals(values, [1, 2]);
  assertStrictEquals(subscriptionAborted, true);
});

Deno.test("eachValueFrom should return done after observable returns", async () => {
  // Arrange
  const source = pipe([1, 2], ofIterable());
  const generator = eachValueFrom(source);

  // Act
  const result1 = await generator.next();
  const result2 = await generator.next();
  const result3 = await generator.next();
  const result4 = await generator.next();

  // Assert
  assertEquals(result1, { value: 1, done: false });
  assertEquals(result2, { value: 2, done: false });
  assertEquals(result3, { value: undefined, done: true });
  assertEquals(result4, { value: undefined, done: true });
});

Deno.test("eachValueFrom should handle async observable emissions", async () => {
  // Arrange
  const source = pipe(
    flat([
      ...Array.from({ length: 3 }, () => timeout(1)),
      pipe(timeout(1), drop<never>(Infinity)),
    ]),
    map((_, index) => index + 1),
  );
  const values: Array<number> = [];

  // Act
  for await (const value of eachValueFrom(source)) {
    values.push(value);
  }

  // Assert
  assertEquals(values, [1, 2, 3]);
});

Deno.test("eachValueFrom return method should abort subscription and return done", async () => {
  // Arrange
  let subscriptionAborted = false;
  const source = pipe(
    flat([pipe([1, 2], ofIterable()), never]),
    finalize(() => subscriptionAborted = true),
  );
  const generator = eachValueFrom(source);

  // Start the subscription by calling next (it will wait since source doesn't emit)
  generator.next();

  // Act
  const returnResult = await generator.return();

  // Assert
  assertEquals(returnResult, { value: undefined, done: true });
  assertStrictEquals(subscriptionAborted, true);
});

Deno.test("eachValueFrom throw method should abort subscription and reject", async () => {
  // Arrange
  let subscriptionAborted = false;
  const error = new Error("iterator throw");
  const source = pipe(
    flat([pipe([1], ofIterable()), never]),
    finalize(() => subscriptionAborted = true),
  );
  const generator = eachValueFrom(source);

  // Start the subscription
  generator.next();

  // Act / Assert
  await assertRejects(
    async () => await generator.throw(error),
    Error,
    "iterator throw",
  );
  assertStrictEquals(subscriptionAborted, true);
});

Deno.test("eachValueFrom should buffer values when emitted faster than consumed", async () => {
  // Arrange
  let capturedObserver: Observer<number> | undefined;
  const source = new Observable<number>((observer) => {
    capturedObserver = observer;
  });
  const generator = eachValueFrom(source);

  // Start iteration to activate subscription
  const nextPromise = generator.next();

  // Emit multiple values before consuming
  capturedObserver!.next(1);
  capturedObserver!.next(2);
  capturedObserver!.next(3);

  // Act - consume all values
  const result1 = await nextPromise;
  const result2 = await generator.next();
  const result3 = await generator.next();

  // Assert
  assertEquals(result1, { value: 1, done: false });
  assertEquals(result2, { value: 2, done: false });
  assertEquals(result3, { value: 3, done: false });
});

Deno.test("eachValueFrom should resolve waiting promises when values arrive", async () => {
  // Arrange
  let capturedObserver: Observer<number> | undefined;
  const source = new Observable<number>((observer) => {
    capturedObserver = observer;
  });
  const generator = eachValueFrom(source);

  // Request values before they're emitted
  const promise1 = generator.next();
  const promise2 = generator.next();

  // Act - emit values after requesting
  capturedObserver!.next(10);
  capturedObserver!.next(20);

  // Assert
  const result1 = await promise1;
  const result2 = await promise2;
  assertEquals(result1, { value: 10, done: false });
  assertEquals(result2, { value: 20, done: false });
});

Deno.test("eachValueFrom should resolve all pending promises on return", async () => {
  // Arrange
  let capturedObserver: Observer<number> | undefined;
  const source = new Observable<number>((observer) => {
    capturedObserver = observer;
  });
  const generator = eachValueFrom(source);

  // Request values before return
  const promise1 = generator.next();
  const promise2 = generator.next();

  // Act - observable returns
  capturedObserver!.return();

  // Assert
  const result1 = await promise1;
  const result2 = await promise2;
  assertEquals(result1, { value: undefined, done: true });
  assertEquals(result2, { value: undefined, done: true });
});

Deno.test("eachValueFrom should reject all pending promises on throw", async () => {
  // Arrange
  const error = new Error("observable error");
  const source = new Subject<number>();
  const generator = eachValueFrom(source);

  // Request values before throw
  const promise1 = generator.next();
  const promise2 = generator.next();

  // Act - observable throws
  source.throw(error);

  // Assert
  await assertRejects(async () => await promise1, Error, "observable error");
  await assertEquals(await promise2, { value: undefined, done: true });
});

Deno.test("eachValueFrom should only start subscription on first next call", async () => {
  // Arrange
  let subscribed = false;
  const source = defer(() => {
    subscribed = true;
    return pipe([1], ofIterable());
  });
  const generator = eachValueFrom(source);

  // Assert - not subscribed yet
  assertStrictEquals(subscribed, false);

  // Act
  await generator.next();

  // Assert - now subscribed
  assertStrictEquals(subscribed, true);
});

Deno.test("eachValueFrom should be done after throw", async () => {
  // Arrange
  const error = new Error("test");
  const source = throwError(error);
  const generator = eachValueFrom(source);

  // First next triggers the throw
  await assertRejects(async () => await generator.next(), Error, "test");

  // Subsequent next calls should also reject
  assertEquals(await generator.next(), { value: undefined, done: true });
});
