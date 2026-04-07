import { isObservable, type Observable } from "@observable/core";
import { from } from "@observable/from";
import { pipe } from "@observable/pipe";
import { flat } from "@observable/flat";
import { take } from "@observable/take";
import { mergeMap } from "@observable/merge-map";
import { of } from "@observable/of";

/**
 * Re-[`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe)s on
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return) as long as the given {@linkcode notifier}
 * then [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s a value.
 * @example
 * ```ts
 * import { repeat } from "@observable/repeat";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 * import { empty } from "@observable/empty";
 * import { defer } from "@observable/defer";
 * import { forOf } from "@observable/for-of";
 *
 * const observable = forOf([1, 2, 3]);
 * const controller = new AbortController();
 * const repeated = defer(() => {
 *   let count = 0;
 *   return pipe(
 *     observable,
 *     repeat(defer(() => {
 *      console.log("notifier subscribed");
 *      return ++count === 2 ? empty : of(undefined);
 *     })),
 *   );
 * });
 *
 * repeated.subscribe({
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
 * // "notifier subscribed"
 * // "next" 1
 * // "next" 2
 * // "next" 3
 * // "notifier subscribed"
 * // "return"
 * ```
 */
export function repeat<Value>(
  notifier: Observable = of(void 0),
): (source: Observable<Value>) => Observable<Value> {
  if (!isObservable(notifier)) throw new TypeError("Parameter 1 is not of type 'Observable'");
  notifier = from(notifier);
  return function repeatFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");
    source = from(source);
    return flat([source, pipe(notifier, take(1), mergeMap(() => pipe(source, repeat(notifier))))]);
  };
}
