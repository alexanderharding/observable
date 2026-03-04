import { assertEquals, assertStrictEquals } from "@std/assert";
import { lastValueFrom } from "@observable/last-value-from";
import { forOf } from "./mod.ts";
import { empty } from "@observable/empty";

Deno.test("forOf should emit values in order", async () => {
  // Arrange
  const source = forOf([1, 2, 3]);

  // Act
  const value = await lastValueFrom(source);

  // Assert
  assertEquals(value, 3);
});

Deno.test("forOf should return empty for empty array", () => {
  // Arrange / Act / Assert
  assertStrictEquals(forOf([]), empty);
});
