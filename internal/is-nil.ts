import { MinimumArgumentsRequiredError } from "./minimum-arguments-required-error.ts";

/**
 * Checks if a {@linkcode value} is `null` or `undefined`.
 * @example
 * ```ts
 * import { isNil } from "@observable/internal";
 *
 * isNil(undefined); // true
 * isNil(null); // true
 * isNil(0); // false
 * isNil(""); // false
 * isNil(false); // false
 * isNil(true); // false
 * isNil(NaN); // false
 * isNil(Infinity); // false
 * isNil(-Infinity); // false
 * isNil(Symbol()); // false
 * isNil(Symbol("foo")); // false
 * ```
 */
export function isNil(value: unknown): value is null | undefined {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return value === null || typeof value === "undefined";
}
