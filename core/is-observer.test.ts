import { assertStrictEquals } from "@std/assert";
import { isObserver } from "./is-observer.ts";
import type { Observer } from "./observer.ts";
import { noop } from "@xan/observable-internal";

Deno.test("isObserver should return false if the value is null", () => {
  // Arrange
  const value = null;

  // Act
  const result = isObserver(value);

  // Assert
  assertStrictEquals(result, false);
});

Deno.test("isObserver should return false if the value is undefined", () => {
  // Arrange
  const value = undefined;

  // Act
  const result = isObserver(value);

  // Assert
  assertStrictEquals(result, false);
});

Deno.test("isObserver should return false if 'next' is not a function", () => {
  // Arrange
  const value: Omit<Observer, "next"> & { next: unknown } = {
    next: "not a function",
    return: noop,
    throw: noop,
    signal: new AbortController().signal,
  };

  // Act
  const result = isObserver(value);

  // Assert
  assertStrictEquals(result, false);
});

Deno.test(
  "isObserver should return false if 'return' is not a function",
  () => {
    // Arrange
    const value: Omit<Observer, "return"> & { return: unknown } = {
      next: noop,
      return: "not a function",
      throw: noop,
      signal: new AbortController().signal,
    };

    // Act
    const result = isObserver(value);

    // Assert
    assertStrictEquals(result, false);
  },
);

Deno.test("isObserver should return false if 'throw' is not a function", () => {
  // Arrange
  const value: Omit<Observer, "throw"> & { throw: unknown } = {
    next: noop,
    return: noop,
    throw: "not a function",
    signal: new AbortController().signal,
  };

  // Act
  const result = isObserver(value);

  // Assert
  assertStrictEquals(result, false);
});

Deno.test(
  "isObserver should return false if 'signal' is not an AbortSignal",
  () => {
    // Arrange
    const value: Omit<Observer, "signal"> & { signal: unknown } = {
      next: noop,
      return: noop,
      throw: noop,
      signal: "not an AbortSignal",
    };

    // Act
    const result = isObserver(value);

    // Assert
    assertStrictEquals(result, false);
  },
);

Deno.test("isObserver should return true if 'signal' is an AbortSignal", () => {
  // Arrange
  const value: Observer = {
    next: noop,
    return: noop,
    throw: noop,
    signal: {
      aborted: false,
      reason: null,
      onabort: noop,
      addEventListener: noop,
      removeEventListener: noop,
      dispatchEvent: () => true,
      throwIfAborted: noop,
    },
  };

  // Act
  const result = isObserver(value);

  // Assert
  assertStrictEquals(result, true);
});
