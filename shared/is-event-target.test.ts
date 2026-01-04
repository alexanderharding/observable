import { assertStrictEquals } from "@std/assert";
import { noop } from "./noop.ts";
import { pickOne } from "./pick-one.ts";
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
      dispatchEvent: () => pickOne([true, false]),
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
        addEventListener: pickOne([Math.random(), Math.random().toString(), []]),
        removeEventListener: noop,
        dispatchEvent: () => pickOne([true, false]),
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
        removeEventListener: pickOne([
          Math.random(),
          Math.random().toString(),
          [],
        ]),
        dispatchEvent: () => pickOne([true, false]),
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
        dispatchEvent: pickOne([Math.random(), Math.random().toString(), []]),
      };

    // Act
    const result = isEventTarget(value);

    // Assert
    assertStrictEquals(result, false);
  },
);
