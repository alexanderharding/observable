import { assertStrictEquals } from "@std/assert";
import { noop } from "./noop.ts";
import { isEventTarget } from "./is-event-target.ts";

Deno.test(
  "isEventTarget should return true if the value is an EventTarget instance",
  () => {
    // Arrange
    const value = new EventTarget();

    // Act
    const result = isEventTarget(value);

    // Assert
    assertStrictEquals(result, true);
  },
);

Deno.test(
  "isEventTarget should return true if the value is an EventTarget literal",
  () => {
    // Arrange
    const value: EventTarget = {
      addEventListener: noop,
      removeEventListener: noop,
      dispatchEvent: () => false,
    };

    // Act
    const result = isEventTarget(value);

    // Assert
    assertStrictEquals(result, true);
  },
);

Deno.test(
  "isEventTarget should return false if the value is an EventTarget literal but addEventListener is not a function",
  () => {
    // Arrange
    const value:
      & Omit<EventTarget, "addEventListener">
      & Readonly<Record<"addEventListener", unknown>> = {
        addEventListener: [],
        removeEventListener: noop,
        dispatchEvent: () => true,
      };

    // Act
    const result = isEventTarget(value);

    // Assert
    assertStrictEquals(result, false);
  },
);

Deno.test(
  "isEventTarget should return false if the value is an EventTarget literal but removeEventListener is not a function",
  () => {
    // Arrange
    const value:
      & Omit<EventTarget, "removeEventListener">
      & Readonly<Record<"removeEventListener", unknown>> = {
        addEventListener: noop,
        removeEventListener: Math.random(),
        dispatchEvent: () => true,
      };

    // Act
    const result = isEventTarget(value);

    // Assert
    assertStrictEquals(result, false);
  },
);

Deno.test(
  "isEventTarget should return false if the value is an EventTarget literal but dispatchEvent is not a function",
  () => {
    // Arrange
    const value:
      & Omit<EventTarget, "dispatchEvent">
      & Readonly<Record<"dispatchEvent", unknown>> = {
        addEventListener: noop,
        removeEventListener: noop,
        dispatchEvent: [],
      };

    // Act
    const result = isEventTarget(value);

    // Assert
    assertStrictEquals(result, false);
  },
);
