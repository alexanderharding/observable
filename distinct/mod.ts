import { isObservable, type Observable, Observer, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, noop, ParameterTypeError } from "@observable/internal";
import { defer } from "@observable/defer";
import { pipe } from "@observable/pipe";
import { tap } from "@observable/tap";
import { filter } from "@observable/filter";

/**
 * Only [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s values from the [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that are distinct from the previous
 * value according to a specified {@linkcode comparator}. Defaults to comparing with `Object.is`.
 * @example
 * ```ts
 * import { distinct } from "@observable/distinct";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(of([1, 2, 2, 3, 1, 3]), distinct()).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log(value),
 * });
 *
 * // console output:
 * // 1
 * // 2
 * // 3
 * // return
 * ```
 * @example
 * ```ts
 * import { distinct } from "@observable/distinct";
 * import { Observer } from "@observable/core";
 * import { pipe } from "@observable/pipe";
 * import { defer } from "@observable/defer";
 * import { noop } from "@observable/internal";
 * import { of } from "@observable/of";
 * import { filter } from "@observable/filter";
 * import { tap } from "@observable/tap";
 *
 * const controller = new AbortController();
 * const source = of([{ id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }, { id: 1 }, { id: 3 }]);
 * const observable = defer(() => {
 *   const values = new Set<number>();
 *   return pipe(
 *     source,
 *     filter((value) => !values.has(value.id)),
 *     tap(new Observer({ next: (value) => values.add(value.id), throw: noop })),
 *   );
 * });
 *
 * observable.subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log(value),
 * });
 *
 * // console output:
 * // { id: 1 }
 * // { id: 2 }
 * // { id: 3 }
 * // return
 * ```
 */
export function distinct<Value>(): (
  source: Observable<Value>,
) => Observable<Value> {
  return function distinctFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = toObservable(source);
    return defer(() => {
      const values = new Set<Value>();
      return pipe(
        source,
        filter((value) => !values.has(value)),
        tap(new Observer({ next: (value) => values.add(value), throw: noop })),
      );
    });
  };
}
