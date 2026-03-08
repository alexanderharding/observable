import { assertEquals, assertRejects, assertStrictEquals } from "@std/assert";
import { lastValueFrom } from "./mod.ts";
import { forOf } from "@observable/for-of";
import { throwError } from "@observable/throw-error";
import { empty } from "@observable/empty";
import { of } from "@observable/of";

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
  const observable = forOf([1, 2, 3]);

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

Deno.test("lastValueFrom should unwrap recursive (nested) PromiseLike from the source", async () => {
  // Arrange
  const value = Symbol("value");
  const observable = of(Promise.resolve(Promise.resolve(Promise.resolve(value))));

  // Act
  const result = await lastValueFrom(observable);

  // Assert
  assertStrictEquals(result, value);
});
