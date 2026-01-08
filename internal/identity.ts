import { MinimumArgumentsRequiredError } from "./minimum-arguments-required-error.ts";

/**
 * This function takes one parameter and just returns it.
 */
export function identity<Value>(value: Value): Value {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return value;
}
