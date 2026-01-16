import { pipe } from "./mod.ts";
import { assertStrictEquals } from "@std/assert";

Deno.test("pipe should allow any kind of custom piping", () => {
  // Arrange

  // Act
  const result = pipe(2.165, Math.floor, String);

  // Assert
  assertStrictEquals(result, "2");
});
