import { isObservable, type Observable, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { defer } from "@observable/defer";
import { pipe } from "@observable/pipe";
import { map } from "@observable/map";
import { filter } from "@observable/filter";

const noValue = Symbol("Flag indicating that no value has been emitted yet");

/**
 * Emits pairs of consecutive values from the source observable.
 */
export function pairwise<Value>(): (
  source: Observable<Value>,
) => Observable<Readonly<[previous: Value, current: Value]>> {
  return function pairwiseFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = toObservable(source);
    return defer(() => {
      let previous: Value | typeof noValue = noValue;
      return pipe(
        source,
        filter((current) => {
          const isFirst = previous === noValue;
          if (isFirst) previous = current;
          return !isFirst;
        }),
        map((current) => {
          const pair = [previous, current] as const;
          previous = current;
          return pair;
        }),
      );
    });
  };
}
