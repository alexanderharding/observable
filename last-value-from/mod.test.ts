import { assertEquals, assertRejects, assertStrictEquals } from "@std/assert";
import { pipe } from "@observable/pipe";
import { lastValueFrom } from "./mod.ts";
import { ofIterable } from "@observable/of-iterable";
import { throwError } from "@observable/throw-error";
import { empty } from "@observable/empty";

Deno.test("lastValueFrom should pump throw values right through the Promise", async () => {
  // Arrange
  const error = new Error("test");

  // Act
  try {
    await lastValueFrom(throwError(error));
  } catch (error) {
    // Assert
    assertStrictEquals(error, error);
  }
});

Deno.test("lastValueFrom should pump last next value through the Promise", async () => {
  // Arrange
  const observable = pipe([1, 2, 3], ofIterable());

  // Act
  const value = await lastValueFrom(observable);

  // Assert
  assertEquals(value, 3);
});

Deno.test("lastValueFrom should reject with TypeError when source is empty", async () => {
  // Arrange / Act / Assert
  await assertRejects(
    () => lastValueFrom(empty),
    TypeError,
    "Cannot convert empty Observable to Promise",
  );
});
