import { MinimumArgumentsRequiredError } from "./minimum-arguments-required-error.ts";

export function identity<Value>(value: Value): Value {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return value;
}
