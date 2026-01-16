import { assertStrictEquals } from "@std/assert";
import { noop } from "@observable/internal";
import { isObservable } from "./is-observable.ts";
import { Observable } from "./observable.ts";

Deno.test(
  "isObservable should return true if the value is an instance of Observable",
  () => {
    // Arrange
    const observable = new Observable(noop);

    // Act
    const result = isObservable(observable);

    // Assert
    assertStrictEquals(result, true);
  },
);

Deno.test(
  "isObservable should return true if the value is a custom Observable",
  () => {
    // Arrange
    const observable: Observable = { subscribe: noop };

    // Act
    const result = isObservable(observable);

    // Assert
    assertStrictEquals(result, true);
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
    assertStrictEquals(result, false);
  },
);

Deno.test("isObservable should return false if the value is not null", () => {
  // Arrange
  const value = null;

  // Act
  const result = isObservable(value);

  // Assert
  assertStrictEquals(result, false);
});

Deno.test("isObservable should return false if the value is undefined", () => {
  // Arrange
  const value = undefined;

  // Act
  const result = isObservable(value);

  // Assert
  assertStrictEquals(result, false);
});

Deno.test(
  "isObservable should return false if 'subscribe' is not a function",
  () => {
    // Arrange
    const value = { subscribe: "not a function" };

    // Act
    const result = isObservable(value);

    // Assert
    assertStrictEquals(result, false);
  },
);
