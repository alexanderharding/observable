import { assertEquals, assertInstanceOf, assertRejects, assertStrictEquals } from "@std/assert";
import { pipe } from "@observable/pipe";
import { asPromise } from "./mod.ts";
import { of } from "@observable/of";
import { throwError } from "@observable/throw-error";
import { empty } from "@observable/empty";

Deno.test("asPromise should pump throw values right through the Promise", async () => {
  // Arrange
  const error = new Error("test");

  // Act
  try {
    await pipe(
      throwError(error),
      asPromise(),
    );
  } catch (error) {
    // Assert
    assertStrictEquals(error, error);
  }
});

Deno.test("asPromise should pump last next value through the Promise", async () => {
  // Arrange
  const source = of([1, 2, 3]);

  // Act
  const value = await pipe(
    source,
    asPromise(),
  );

  // Assert
  assertEquals(value, 3);
});

Deno.test("asPromise should reject with TypeError when source is empty", async () => {
  // Arrange / Act / Assert
  await assertRejects(
    () => pipe(empty, asPromise()),
    TypeError,
    "Cannot convert empty Observable to Promise",
  );
});
