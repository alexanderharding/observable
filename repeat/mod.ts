import { isObservable, type Observable } from "@observable/core";
import { from } from "@observable/from";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { pipe } from "@observable/pipe";
import { flat } from "@observable/flat";
import { take } from "@observable/take";
import { mergeMap } from "@observable/merge-map";
import { ofIterable } from "@observable/of-iterable";

/**
 * Re-[`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe)s to the
 * [source](https://jsr.io/@observable/core#source) [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) each time it
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s, as long as the {@linkcode notifier}
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) then [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s a value.
 * Stops repeating if the {@linkcode notifier} [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s without [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ing a
 * value or it [`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw)s a value.
 * @example
 * ```ts
 * import { repeat } from "@observable/repeat";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 * import { empty } from "@observable/empty";
 * import { defer } from "@observable/defer";
 *
 * const source = pipe([1, 2, 3], ofIterable());
 * const controller = new AbortController();
 * const repeated = defer(() => {
 *   let count = 0;
 *   return pipe(
 *     source,
 *     repeat(defer(() => {
 *      console.log("notifier subscribed");
 *      return ++count === 2 ? empty : pipe([undefined], ofIterable());
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
  notifier: Observable = pipe([undefined], ofIterable()),
): (source: Observable<Value>) => Observable<Value> {
  if (!isObservable(notifier)) throw new ParameterTypeError(0, "Observable");
  notifier = from(notifier);
  return function repeatFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = from(source);
    return flat([
      source,
      pipe(notifier, take(1), mergeMap(() => pipe(source, repeat(notifier)))),
    ]);
  };
}
