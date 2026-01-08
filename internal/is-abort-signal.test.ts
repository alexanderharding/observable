import { assertStrictEquals } from "@std/assert";
import { isAbortSignal } from "./is-abort-signal.ts";
import { noop } from "./noop.ts";
import { pickOne } from "./pick-one.ts";

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
      aborted: pickOne([true, false]),
      reason: pickOne([null, undefined, 0, 1, "0", "1", {}, []]),
      onabort: pickOne([noop, null]),
      throwIfAborted: noop,
      addEventListener: noop,
      removeEventListener: noop,
      dispatchEvent: () => pickOne([true, false]),
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
        aborted: pickOne([[], null, undefined, 0, 1, "0", "1"]),
        reason: pickOne([null, undefined, 0, 1, "0", "1", {}, []]),
        onabort: pickOne([noop, null]),
        throwIfAborted: noop,
        addEventListener: noop,
        removeEventListener: noop,
        dispatchEvent: () => pickOne([true, false]),
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
        aborted: pickOne([true, false]),
        reason: pickOne([null, undefined, 0, 1, "0", "1", {}, []]),
        onabort: pickOne([Math.random(), Math.random().toString(), []]),
        throwIfAborted: noop,
        addEventListener: noop,
        removeEventListener: noop,
        dispatchEvent: () => pickOne([true, false]),
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
        aborted: pickOne([true, false]),
        reason: pickOne([null, undefined, 0, 1, "0", "1", {}, []]),
        onabort: pickOne([noop, null]),
        throwIfAborted: pickOne([Math.random(), Math.random().toString(), []]),
        addEventListener: noop,
        removeEventListener: noop,
        dispatchEvent: () => pickOne([true, false]),
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
        aborted: pickOne([true, false]),
        reason: pickOne([null, undefined, 0, 1, "0", "1", {}, []]),
        onabort: pickOne([noop, null]),
        throwIfAborted: noop,
        addEventListener: pickOne([Math.random(), Math.random().toString(), []]),
        removeEventListener: noop,
        dispatchEvent: () => pickOne([true, false]),
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
        aborted: pickOne([true, false]),
        reason: pickOne([null, undefined, 0, 1, "0", "1", {}, []]),
        onabort: pickOne([noop, null]),
        throwIfAborted: noop,
        addEventListener: noop,
        removeEventListener: pickOne([
          Math.random(),
          Math.random().toString(),
          [],
        ]),
        dispatchEvent: () => pickOne([true, false]),
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
        aborted: pickOne([true, false]),
        reason: pickOne([null, undefined, 0, 1, "0", "1", {}, []]),
        onabort: pickOne([noop, null]),
        throwIfAborted: noop,
        addEventListener: noop,
        removeEventListener: noop,
        dispatchEvent: pickOne([Math.random(), Math.random().toString(), []]),
      };

    // Act
    const result = isAbortSignal(value);

    // Assert
    assertStrictEquals(result, false);
  },
);
