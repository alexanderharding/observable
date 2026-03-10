import { isObservable, type Observable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { pipe } from "@observable/pipe";
import { filter } from "@observable/filter";
import { flat } from "@observable/flat";
import { take } from "@observable/take";
import { drop } from "@observable/drop";
import { defer } from "@observable/defer";
import { empty } from "@observable/empty";
import { tap } from "@observable/tap";
import { finalize } from "@observable/finalize";
import { ReplaySubject } from "@observable/replay-subject";

/**
 * [`Next`](https://jsr.io/@observable/core/doc/~/Observer.next)s only the value at the specified {@linkcode index} integer in a sequence of
 * values from the [source](https://jsr.io/@observable/core#source) [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
 * Negative {@linkcode index} integers count back from the last item in the sequence.
 * @example
 * ```ts
 * import { at } from "@observable/at";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * pipe(forOf([1, 2, 3]), at(1)).subscribe({
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 2
 * // "return"
 * ```
 * @example
 * ```ts
 * import { at } from "@observable/at";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * pipe(forOf([1, 2, 3]), at(-1)).subscribe({
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 3
 * // "return"
 * ```
 */
export function at<Value>(index: number): (source: Observable<Value>) => Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof index !== "number") throw new ParameterTypeError(0, "Number");
  return function atFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");

    if (Number.isNaN(index)) return empty;

    if (index === Infinity || index === -Infinity) return pipe(source, drop<never>(Infinity));

    if (index === 0) return pipe(source, take(1));

    if (index > 0) return pipe(source, filter((_, i) => i === index), take(1));

    const replayCount = -index;
    return defer(() => {
      let isBufferFull = false;
      const buffer = new ReplaySubject<Value>(replayCount);
      return pipe(
        flat([
          pipe(
            source,
            tap((_, index) => !isBufferFull && (isBufferFull = index + 1 === replayCount)),
            tap((value) => buffer.next(value)),
            drop<never>(Infinity),
          ),
          pipe(defer(() => (isBufferFull ? pipe(buffer, take(1)) : empty))),
        ]),
        finalize(() => buffer.return()),
      );
    });
  };
}
