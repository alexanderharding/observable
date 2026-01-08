import { assertStrictEquals } from "@std/assert";
import { identity } from "./identity.ts";

Deno.test("identity should return the value", () => {
  // Arrange
  const value = "test";

  // Act
  const result = identity(value);

  // Assert
  assertStrictEquals(result, value);
});
