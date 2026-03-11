import { isObservable, type Observable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { pipe } from "@observable/pipe";
import { filter } from "@observable/filter";
import { flat } from "@observable/flat";
import { take } from "@observable/take";
import { drop } from "@observable/drop";
import { defer } from "@observable/defer";
import { empty } from "@observable/empty";
import { of } from "@observable/of";
import { scan } from "@observable/scan";
import { map } from "@observable/map";
import { from } from "@observable/from";

/**
 * Flag indicating that the source has returned.
 * @internal Do NOT export.
 */
const sourceReturned = Symbol("Flag indicating that the source has returned");

interface State<Value> {
  readonly buffer: Array<Value>;
  readonly hasSourceReturned: boolean;
}

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

    source = from(source);

    const maxBufferLength = -index;
    return defer(() => {
      const initialState: State<Value> = { buffer: [], hasSourceReturned: false };
      return pipe(
        flat([source, of(sourceReturned)]),
        scan(({ buffer }, value) => {
          if (value !== sourceReturned) buffer.push(value);
          if (buffer.length > maxBufferLength) buffer.shift();
          return { buffer, hasSourceReturned: value === sourceReturned };
        }, initialState),
        filter(({ hasSourceReturned }) => hasSourceReturned),
        filter(({ buffer }) => buffer.length === maxBufferLength),
        map(({ buffer: [foundValue] }) => foundValue),
      );
    });
  };
}
