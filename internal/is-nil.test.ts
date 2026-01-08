import { assertStrictEquals } from "@std/assert";
import { isNil } from "./is-nil.ts";

Deno.test("isNil should return true if the value is null", () => {
  // Arrange
  const value = null;

  // Act
  const result = isNil(value);

  // Assert
  assertStrictEquals(result, true);
});

Deno.test("isNil should return true if the value is undefined", () => {
  // Arrange
  const value = undefined;

  // Act
  const result = isNil(value);

  // Assert
  assertStrictEquals(result, true);
});

Deno.test(
  "isNil should return false if the value is not null or undefined",
  () => {
    // Arrange
    const value = 0;

    // Act
    const result = isNil(value);

    // Assert
    assertStrictEquals(result, false);
  },
);
