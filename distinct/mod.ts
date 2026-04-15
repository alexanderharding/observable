import { isObservable, type Observable } from "@observable/core";
import { from } from "@observable/from";
import { defer } from "@observable/defer";
import { pipe } from "@observable/pipe";
import { tap } from "@observable/tap";
import { filter } from "@observable/filter";

/**
 * [Pushes](https://jsr.io/@observable/core#push) {@linkcode Value|values} that are
 * [distinct](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
 * from all previous {@linkcode Value|values}.
 * @example
 * ```ts
 * import { distinct } from "@observable/distinct";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(forOf([1, 2, 2, 3, 1, 3]), distinct()).subscribe({
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
 * // "return"
 * ```
 */
export function distinct<Value>(): (source: Observable<Value>) => Observable<Value> {
  return function distinctFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");
    source = from(source);
    return defer(() => {
      const values = new Set<Value>();
      return pipe(source, filter((value) => !values.has(value)), tap((value) => values.add(value)));
    });
  };
}
