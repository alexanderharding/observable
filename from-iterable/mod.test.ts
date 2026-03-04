import { assertEquals, assertRejects } from "@std/assert";
import { lastValueFrom } from "@observable/last-value-from";
import { fromIterable } from "./mod.ts";

Deno.test("fromIterable should emit values in order", async () => {
  // Arrange
  const source = fromIterable([1, 2, 3]);

  // Act
  const value = await lastValueFrom(source);

  // Assert
  assertEquals(value, 3);
});

Deno.test("fromIterable should return empty for empty array", async () => {
  // Arrange / Act / Assert
  await assertRejects(
    () => lastValueFrom(fromIterable([])),
    TypeError,
    "Cannot convert empty Observable to Promise",
  );
});
