import { isObservable, type Observable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { empty } from "@observable/empty";
import { pipe } from "@observable/pipe";
import { exhaustMap } from "@observable/exhaust-map";
import { flat } from "@observable/flat";
import { of } from "@observable/of";
import { timer } from "@observable/timer";
import { ignoreElements } from "@observable/ignore-elements";

/**
 * Throttles the emission of values from the source observable by the specified number of milliseconds.
 */
export function throttle<Value>(
  milliseconds: number,
): (source: Observable<Value>) => Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof milliseconds !== "number") {
    throw new ParameterTypeError(0, "Number");
  }
  return function throttleFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    if (milliseconds < 0 || Number.isNaN(milliseconds)) return empty;
    return pipe(
      source,
      exhaustMap((value) => flat([of([value]), pipe(timer(milliseconds), ignoreElements())])),
    );
  };
}
