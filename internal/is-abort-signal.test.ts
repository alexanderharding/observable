import { assertStrictEquals } from "@std/assert";
import { isAbortSignal } from "./is-abort-signal.ts";
import { noop } from "./noop.ts";

Deno.test(
  "isAbortSignal should return true if the value is an AbortSignal instance",
  () => {
    // Arrange
    const value = new AbortController().signal;

    // Act
    const result = isAbortSignal(value);

    // Assert
    assertStrictEquals(result, true);
  },
);

Deno.test(
  "isAbortSignal should return true if the value is an AbortSignal literal",
  () => {
    // Arrange
    const value: AbortSignal = {
      aborted: true,
      reason: null,
      onabort: null,
      throwIfAborted: noop,
      addEventListener: noop,
      removeEventListener: noop,
      dispatchEvent: () => true,
    };

    // Act
    const result = isAbortSignal(value);

    // Assert
    assertStrictEquals(result, true);
  },
);

Deno.test(
  "isAbortSignal should return false if the value is an AbortSignal literal but aborted is not a boolean",
  () => {
    // Arrange
    const value:
      & Omit<AbortSignal, "aborted">
      & Readonly<Record<"aborted", unknown>> = {
        aborted: [],
        reason: null,
        onabort: null,
        throwIfAborted: noop,
        addEventListener: noop,
        removeEventListener: noop,
        dispatchEvent: () => true,
      };

    // Act
    const result = isAbortSignal(value);

    // Assert
    assertStrictEquals(result, false);
  },
);

Deno.test(
  "isAbortSignal should return false if the value is an AbortSignal literal but onabort is not a function or null",
  () => {
    // Arrange
    const value:
      & Omit<AbortSignal, "onabort">
      & Readonly<Record<"onabort", unknown>> = {
        aborted: true,
        reason: null,
        onabort: null,
        throwIfAborted: noop,
        addEventListener: noop,
        removeEventListener: noop,
        dispatchEvent: () => true,
      };

    // Act
    const result = isAbortSignal(value);

    // Assert
    assertStrictEquals(result, false);
  },
);

Deno.test(
  "isAbortSignal should return false if the value is an AbortSignal literal but throwIfAborted is not a function",
  () => {
    // Arrange
    const value:
      & Omit<AbortSignal, "throwIfAborted">
      & Readonly<Record<"throwIfAborted", unknown>> = {
        aborted: true,
        reason: null,
        onabort: null,
        throwIfAborted: noop,
        addEventListener: noop,
        removeEventListener: noop,
        dispatchEvent: () => true,
      };

    // Act
    const result = isAbortSignal(value);

    // Assert
    assertStrictEquals(result, false);
  },
);

Deno.test(
  "isAbortSignal should return false if the value is an AbortSignal literal but addEventListener is not a function",
  () => {
    // Arrange
    const value:
      & Omit<AbortSignal, "addEventListener">
      & Readonly<Record<"addEventListener", unknown>> = {
        aborted: true,
        reason: null,
        onabort: null,
        throwIfAborted: noop,
        addEventListener: noop,
        removeEventListener: noop,
        dispatchEvent: () => true,
      };

    // Act
    const result = isAbortSignal(value);

    // Assert
    assertStrictEquals(result, false);
  },
);

Deno.test(
  "isAbortSignal should return false if the value is an AbortSignal literal but removeEventListener is not a function",
  () => {
    // Arrange
    const value:
      & Omit<AbortSignal, "removeEventListener">
      & Readonly<Record<"removeEventListener", unknown>> = {
        aborted: true,
        reason: null,
        onabort: null,
        throwIfAborted: noop,
        addEventListener: noop,
        removeEventListener: noop,
        dispatchEvent: () => true,
      };

    // Act
    const result = isAbortSignal(value);

    // Assert
    assertStrictEquals(result, false);
  },
);

Deno.test(
  "isAbortSignal should return false if the value is an AbortSignal literal but dispatchEvent is not a function",
  () => {
    // Arrange
    const value:
      & Omit<AbortSignal, "dispatchEvent">
      & Readonly<Record<"dispatchEvent", unknown>> = {
        aborted: true,
        reason: null,
        onabort: null,
        throwIfAborted: noop,
        addEventListener: noop,
        removeEventListener: noop,
        dispatchEvent: [],
      };

    // Act
    const result = isAbortSignal(value);

    // Assert
    assertStrictEquals(result, false);
  },
);
