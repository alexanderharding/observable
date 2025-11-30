import { Observable } from "./observable.ts";

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode Observable} interface.
 */
export function isObservable(value: unknown): value is Observable {
  if (arguments.length === 0) {
    throw new TypeError("1 argument required but 0 present");
  }
  return (
    value instanceof Observable ||
    (typeof value === "object" &&
      value !== null &&
      "subscribe" in value &&
      typeof value.subscribe === "function")
  );
}
