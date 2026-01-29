import { isAsyncIterable } from "./is-async-iterable.ts";
import { assertEquals, assertThrows } from "@std/assert";
import { MinimumArgumentsRequiredError } from "./minimum-arguments-required-error.ts";

Deno.test("isAsyncIterable should throw if called with no arguments", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => isAsyncIterable(...([] as unknown as Parameters<typeof isAsyncIterable>)),
    MinimumArgumentsRequiredError,
    "1 argument required but 0 present",
  );
});

Deno.test("isAsyncIterable should return false for undefined", () => {
  // Arrange
  const value = undefined;

  // Act
  const result = isAsyncIterable(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isAsyncIterable should return false for null", () => {
  // Arrange
  const value = null;

  // Act
  const result = isAsyncIterable(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isAsyncIterable should return false for a plain object", () => {
  // Arrange
  const value = {};

  // Act
  const result = isAsyncIterable(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isAsyncIterable should return false for a number", () => {
  // Arrange
  const value = 42;

  // Act
  const result = isAsyncIterable(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isAsyncIterable should return false for a string", () => {
  // Arrange
  const value = "hello";

  // Act
  const result = isAsyncIterable(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isAsyncIterable should return false for a synchronous iterable", () => {
  // Arrange
  const value = [1, 2, 3];

  // Act
  const result = isAsyncIterable(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isAsyncIterable should return true for a custom AsyncIterable object", () => {
  // Arrange
  const value: AsyncIterable<number> = {
    [Symbol.asyncIterator]() {
      return {
        next() {
          return Promise.resolve({ value: undefined, done: true });
        },
      };
    },
  };

  // Act
  const result = isAsyncIterable(value);

  // Assert
  assertEquals(result, true);
});

Deno.test(
  "isAsyncIterable should return false for object with Symbol.asyncIterator that's not a function",
  () => {
    // Arrange
    const value = {
      [Symbol.asyncIterator]: 123,
    };

    // Act
    const result = isAsyncIterable(value);

    // Assert
    assertEquals(result, false);
  },
);

Deno.test("isAsyncIterable should return true for an async generator", () => {
  // Arrange
  async function* asyncGen() {
    yield 1;
    yield 2;
    yield 3;
  }
  const value = asyncGen();

  // Act
  const result = isAsyncIterable(value);

  // Assert
  assertEquals(result, true);
});

Deno.test("isAsyncIterable should return false for a function", () => {
  // Arrange
  const value = () => {};

  // Act
  const result = isAsyncIterable(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isAsyncIterable should return false for a Promise", () => {
  // Arrange
  const value = Promise.resolve(42);

  // Act
  const result = isAsyncIterable(value);

  // Assert
  assertEquals(result, false);
});
