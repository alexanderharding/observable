import { isObservable, type Observable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { empty } from "@observable/empty";
import { pipe } from "@observable/pipe";
import { switchMap } from "@observable/switch-map";
import { timer } from "@observable/timer";
import { map } from "@observable/map";

/**
 * Debounces the emission of values from the source observable by the specified number of milliseconds.
 */
export function debounce<Value>(
  milliseconds: number,
): (source: Observable<Value>) => Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof milliseconds !== "number") {
    throw new ParameterTypeError(0, "Number");
  }
  return function debounceFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    if (
      milliseconds < 0 ||
      Number.isNaN(milliseconds) ||
      milliseconds === Infinity
    ) {
      return empty;
    }
    return pipe(
      source,
      switchMap((value) =>
        pipe(
          timer(milliseconds),
          map(() => value),
        )
      ),
    );
  };
}
