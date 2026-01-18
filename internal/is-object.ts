import { MinimumArgumentsRequiredError } from "./minimum-arguments-required-error.ts";

/**
 * Checks if a {@linkcode value} is an `object`.
 * @example
 * ```ts
 * import { isObject } from "@observable/internal";
 *
 * isObject({}); // true
 * isObject(null)); // false
 * ```
 */
export function isObject(value: unknown): value is object {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return typeof value === "object" && value !== null;
}
