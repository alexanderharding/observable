import { isIterable } from "./is-iterable.ts";
import { assertEquals, assertThrows } from "@std/assert";
import { MinimumArgumentsRequiredError } from "./minimum-arguments-required-error.ts";

Deno.test("isIterable should throw if called with no arguments", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => isIterable(...([] as unknown as Parameters<typeof isIterable>)),
    MinimumArgumentsRequiredError,
    "1 argument required but 0 present",
  );
});

Deno.test("isIterable should return false for undefined", () => {
  // Arrange
  const value = undefined;

  // Act
  const result = isIterable(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isIterable should return false for null", () => {
  // Arrange
  const value = null;

  // Act
  const result = isIterable(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isIterable should return false for a plain object", () => {
  // Arrange
  const value = {};

  // Act
  const result = isIterable(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isIterable should return true for an Array", () => {
  // Arrange
  const value = [1, 2, 3];

  // Act
  const result = isIterable(value);

  // Assert
  assertEquals(result, true);
});

Deno.test("isIterable should return true for a Set", () => {
  // Arrange
  const value = new Set();

  // Act
  const result = isIterable(value);

  // Assert
  assertEquals(result, true);
});

Deno.test("isIterable should return true for a Map", () => {
  // Arrange
  const value = new Map();

  // Act
  const result = isIterable(value);

  // Assert
  assertEquals(result, true);
});

Deno.test("isIterable should return true for a custom iterable object", () => {
  // Arrange
  const value = {
    [Symbol.iterator]: () => ({
      next: () => ({ value: undefined, done: true }),
    }),
  };

  // Act
  const result = isIterable(value);

  // Assert
  assertEquals(result, true);
});

Deno.test(
  "isIterable should return false for object with Symbol.iterator that's not a function",
  () => {
    // Arrange
    const value = {
      [Symbol.iterator]: 123,
    };

    // Act
    const result = isIterable(value);

    // Assert
    assertEquals(result, false);
  },
);
