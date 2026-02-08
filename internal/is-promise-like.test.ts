import { isPromiseLike } from "./is-promise-like.ts";
import { assertEquals, assertThrows } from "@std/assert";
import { MinimumArgumentsRequiredError } from "./minimum-arguments-required-error.ts";

Deno.test("isPromiseLike should throw if called with no arguments", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => isPromiseLike(...([] as unknown as Parameters<typeof isPromiseLike>)),
    MinimumArgumentsRequiredError,
    "1 argument required but 0 present",
  );
});

Deno.test("isPromiseLike should return false for undefined", () => {
  // Arrange
  const value = undefined;

  // Act
  const result = isPromiseLike(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isPromiseLike should return false for null", () => {
  // Arrange
  const value = null;

  // Act
  const result = isPromiseLike(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isPromiseLike should return false for a plain object", () => {
  // Arrange
  const value = {};

  // Act
  const result = isPromiseLike(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isPromiseLike should return false for a number", () => {
  // Arrange
  const value = 42;

  // Act
  const result = isPromiseLike(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isPromiseLike should return false for a string", () => {
  // Arrange
  const value = "hello";

  // Act
  const result = isPromiseLike(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isPromiseLike should return true for a native Promise", () => {
  // Arrange
  const value = Promise.resolve(42);

  // Act
  const result = isPromiseLike(value);

  // Assert
  assertEquals(result, true);
});

Deno.test("isPromiseLike should return true for a custom PromiseLike object", () => {
  // Arrange
  const value = {
    then(
      onfulfilled?: ((value: number) => unknown) | null,
      _onrejected?: ((reason: unknown) => unknown) | null,
    ) {
      onfulfilled?.(42);
      return value;
    },
  };

  // Act
  const result = isPromiseLike(value);

  // Assert
  assertEquals(result, true);
});

Deno.test("isPromiseLike should return false for object with 'then' that's not a function", () => {
  // Arrange
  const value = {
    then: 123,
  };

  // Act
  const result = isPromiseLike(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isPromiseLike should return false for a function", () => {
  // Arrange
  const value = () => {};

  // Act
  const result = isPromiseLike(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isPromiseLike should return false for an array", () => {
  // Arrange
  const value = [1, 2, 3];

  // Act
  const result = isPromiseLike(value);

  // Assert
  assertEquals(result, false);
});
