import { assertEquals, assertRejects, assertStrictEquals } from "@std/assert";
import { pipe } from "@observable/pipe";
import { asPromise } from "@observable/as-promise";
import { sequence } from "./mod.ts";
import { throwError } from "@observable/throw-error";
import { empty } from "@observable/empty";

Deno.test("sequence should emit values in order", async () => {
  // Arrange
  const source = sequence([1, 2, 3]);

  // Act
  const value = await pipe(source, asPromise());

  // Assert
  assertEquals(value, 3);
});

Deno.test("sequence should return empty for empty array", async () => {
  // Arrange / Act / Assert
  await assertRejects(
    () => pipe(sequence([]), asPromise()),
    TypeError,
    "Cannot convert empty Observable to Promise",
  );
});
