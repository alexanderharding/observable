import { MinimumArgumentsRequiredError } from "./minimum-arguments-required-error.ts";
import { ParameterTypeError } from "./parameter-type-error.ts";

/**
 * Picking a random {@linkcode values|value}.
 */
export function pickOne<const Values extends ReadonlyArray<unknown>>(
  values: Values,
): Values[number] {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!Array.isArray(values)) throw new ParameterTypeError(0, "Array");
  const selection = Math.random() * values.length;
  return values.find((_, index) => selection < index + 1);
}
