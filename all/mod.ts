import { type Observable, Observer, Subject } from "@observable/core";
import { MinimumArgumentsRequiredError, noop, ParameterTypeError } from "@observable/internal";
import { defer } from "@observable/defer";
import { empty } from "@observable/empty";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";
import { tap } from "@observable/tap";
import { map } from "@observable/map";
import { mergeMap } from "@observable/merge-map";
import { filter } from "@observable/filter";
import { takeUntil } from "@observable/take-until";

/**
 * Calculates [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values from the latest
 * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value of each [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable). If any of the [sources](https://jsr.io/@observable/core#source)
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return) without [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ing a value,
 * the returned [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) will also [`return`](https://jsr.io/@observable/core/doc/~/Observer.return).
 * @example
 * ```ts
 * import { all } from "@observable/all";
 * import { of } from "@observable/of";
 *
 * const controller = new AbortController();
 * all([of([1, 2, 3]), of([4, 5, 6]), of([7, 8, 9])]).subscribe({
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
 * import { of } from "@observable/of";
 * import { empty } from "@observable/empty";
 *
 * const controller = new AbortController();
 * all([of([1, 2, 3]), empty, of([7, 8, 9])]).subscribe({
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
      of(sources),
      mergeMap((source, index) => {
        let isEmpty = true;
        return pipe(
          source,
          tap(
            new Observer({
              next: processNextValue,
              return: processReturn,
              throw: noop,
            }),
          ),
        );

        function processNextValue(value: unknown): void {
          if (isEmpty) receivedFirstValueCount++;
          isEmpty = false;
          values[index] = value;
        }

        function processReturn(): void {
          if (isEmpty) emptySourceNotifier.next();
        }
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
