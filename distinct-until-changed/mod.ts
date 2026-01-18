import { isObservable, type Observable, Observer, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, noop, ParameterTypeError } from "@observable/internal";
import { defer } from "@observable/defer";
import { pipe } from "@observable/pipe";
import { tap } from "@observable/tap";
import { filter } from "@observable/filter";

/**
 * Flag indicating that no value has been emitted yet.
 * @internal Do NOT export.
 */
const noValue = Symbol("Flag indicating that no value has been emitted yet");

/**
 * Only [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s values from the [source](https://jsr.io/@observable/core#source)
 * that are distinct from the previous value according to a specified {@linkcode comparator}
 * or `Object.is` if one is not provided.
 * @example
 * ```ts
 * import { distinctUntilChanged } from "@observable/distinct-until-changed";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(of([1, 1, 1, 2, 2, 3]), distinctUntilChanged()).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log(value),
 * });
 *
 * // Console output:
 * // 1
 * // 2
 * // 3
 * // return
 * ```
 */
export function distinctUntilChanged<Value>(
  // Default to Object.is because it's behavior is more predictable than
  // strict equality checks.
  comparator: (previous: Value, current: Value) => boolean = Object.is,
): (source: Observable<Value>) => Observable<Value> {
  if (typeof comparator !== "function") {
    throw new ParameterTypeError(0, "Function");
  }
  return function distinctUntilChangedFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = toObservable(source);
    return defer(() => {
      let previous: Value | typeof noValue = noValue;
      return pipe(
        source,
        filter(isDistinct),
        tap(new Observer({ next: processNextValue, throw: noop })),
      );

      function isDistinct(current: Value): boolean {
        return previous === noValue || !comparator(previous, current);
      }

      function processNextValue(current: Value): void {
        previous = current;
      }
    });
  };
}
