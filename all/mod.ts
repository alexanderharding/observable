import { type Observable, Subject } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { defer } from "@observable/defer";
import { empty } from "@observable/empty";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";
import { forEach } from "@observable/for-each";
import { map } from "@observable/map";
import { mergeMap } from "@observable/merge-map";
import { filter } from "@observable/filter";
import { takeUntil } from "@observable/take-until";
import { finalize } from "@observable/finalize";

/**
 * Calculates [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values from the latest
 * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value of each [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable). If any of the [sources](https://jsr.io/@observable/core#source)
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return) without [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ing a value,
 * the returned [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) will also [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)
 * without [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ing a value.
 * @example
 * ```ts
 * import { all } from "@observable/all";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * const source1 = pipe([1, 2, 3], ofIterable());
 * const source2 = pipe([4, 5, 6], ofIterable());
 * const source3 = pipe([7, 8, 9], ofIterable());
 *
 * const controller = new AbortController();
 * all([source1, source2, source3]).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" [3, 6, 7]
 * // "next" [3, 6, 8]
 * // "next" [3, 6, 9]
 * // "return"
 * ```
 * @example
 * ```ts
 * import { all } from "@observable/all";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 * import { empty } from "@observable/empty";
 *
 * const source1 = pipe([1, 2, 3], ofIterable());
 * const source2 = pipe([7, 8, 9], ofIterable());
 *
 * const controller = new AbortController();
 * all([source1, empty, source2]).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "return"
 * ```
 */
export function all<const Values extends ReadonlyArray<unknown>>(
  sources: Readonly<{ [Key in keyof Values]: Observable<Values[Key]> }>,
): Observable<Values>;
export function all(
  // Long term, it would be nice to be able to accept an Iterable for performance and flexibility.
  // This new signature would have to work in conjunction with the mapped array signature above as this
  // encourages more explicit types for sources as a tuple.
  sources: ReadonlyArray<Observable>,
): Observable<ReadonlyArray<unknown>> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isArray(sources)) throw new ParameterTypeError(0, "Array");
  if (sources.length === 0) return empty;
  return defer(() => {
    let receivedFirstValueCount = 0;
    const { length: expectedFirstValueCount } = sources;
    const values: Array<unknown> = [];
    const emptySourceNotifier = new Subject<void>();
    return pipe(
      sources,
      ofIterable<Observable>(),
      mergeMap((source, index) => {
        let isEmpty = true;
        return pipe(
          source,
          forEach((value) => {
            if (isEmpty) receivedFirstValueCount++;
            isEmpty = false;
            values[index] = value;
          }),
          finalize(() => isEmpty && emptySourceNotifier.next()),
        );
      }),
      filter(() => receivedFirstValueCount === expectedFirstValueCount),
      map(() => values.slice()),
      takeUntil(emptySourceNotifier),
    );
  });
}

/**
 * Like `Array.isArray`, but with better type inference.
 * @internal Do NOT export.
 */
function isArray(value: unknown): value is Array<unknown> {
  return Array.isArray(value);
}
