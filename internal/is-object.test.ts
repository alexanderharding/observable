import { assertStrictEquals } from "@std/assert";
import { isObject } from "./is-object.ts";

Deno.test("isObject should return true if the value is an object", () => {
  // Arrange
  const value = {};

  // Act
  const result = isObject(value);

  // Assert
  assertStrictEquals(result, true);
});

Deno.test("isObject should return false if the value is null", () => {
  // Arrange
  const value = null;

  // Act
  const result = isObject(value);

  // Assert
  assertStrictEquals(result, false);
});

Deno.test("isObject should return false if the value is not an object", () => {
  // Arrange
  const value = "not an object";

  // Act
  const result = isObject(value);

  // Assert
  assertStrictEquals(result, false);
});
