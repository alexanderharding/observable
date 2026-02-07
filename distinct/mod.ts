import { isObservable, type Observable } from "@observable/core";
import { asObservable } from "@observable/as-observable";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { defer } from "@observable/defer";
import { pipe } from "@observable/pipe";
import { forEach } from "@observable/for-each";
import { filter } from "@observable/filter";

/**
 * Only [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s values from the
 * [source](https://jsr.io/@observable/core#source) [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * that are distinct from all previous values.
 * @example
 * ```ts
 * import { distinct } from "@observable/distinct";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe([1, 2, 2, 3, 1, 3], ofIterable(), distinct()).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 1
 * // "next" 2
 * // "next" 3
 * // return
 * ```
 */
export function distinct<Value>(): (
  source: Observable<Value>,
) => Observable<Value> {
  return function distinctFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = pipe(source, asObservable());
    return defer(() => {
      const values = new Set<Value>();
      return pipe(
        source,
        filter((value) => !values.has(value)),
        forEach((value) => values.add(value)),
      );
    });
  };
}
