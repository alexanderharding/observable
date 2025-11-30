import { assertEquals } from "@std/assert";
import { isObservable } from "./is-observable.ts";
import { Observable } from "./observable.ts";

Deno.test(
  "isObservable should return true if the value is an instance of Observable",
  () => {
    // Arrange
    const observable = new Observable(() => {});

    // Act
    const result = isObservable(observable);

    // Assert
    assertEquals(result, true);
  },
);

Deno.test(
  "isObservable should return true if the value is a custom Observable",
  () => {
    // Arrange
    const observable: Observable = { subscribe: () => {} };

    // Act
    const result = isObservable(observable);

    // Assert
    assertEquals(result, true);
  },
);

Deno.test(
  "isObservable should return false if the value is not an empty object",
  () => {
    // Arrange
    const value = {};

    // Act
    const result = isObservable(value);

    // Assert
    assertEquals(result, false);
  },
);

Deno.test("isObservable should return false if the value is not null", () => {
  // Arrange
  const value = null;

  // Act
  const result = isObservable(value);

  // Assert
  assertEquals(result, false);
});

Deno.test("isObservable should return false if the value is undefined", () => {
  // Arrange
  const value = undefined;

  // Act
  const result = isObservable(value);

  // Assert
  assertEquals(result, false);
});

Deno.test(
  "isObservable should return false if 'subscribe' is not a function",
  () => {
    // Arrange
    const value = { subscribe: "not a function" };

    // Act
    const result = isObservable(value);

    // Assert
    assertEquals(result, false);
  },
);
