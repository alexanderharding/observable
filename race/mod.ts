import { type Observable, Subject } from "@observable/core";
import { ParameterTypeError } from "@observable/internal";
import { defer } from "@observable/defer";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { tap } from "@observable/tap";
import { mergeMap } from "@observable/merge-map";
import { takeUntil } from "@observable/take-until";
import { filter } from "@observable/filter";
import { empty } from "@observable/empty";

/**
 * Mirrors the first [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to
 * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next) or
 * [`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw) a value.
 * @example
 * Array of sources
 * ```ts
 * import { race } from "@observable/race";
 * import { Subject } from "@observable/core";
 *
 * const controller = new AbortController();
 * const source1 = new Subject<number>();
 * const source2 = new Subject<number>();
 * const source3 = new Subject<number>();
 *
 * race([source1, source2, source3]).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * source2.next(1); // "next" 1
 * source1.next(2);
 * source3.next(3);
 * source1.return();
 * source2.next(4); // "next" 4
 * source3.next(5);
 * source2.return(); // "return"
 * ```
 * @example
 * Empty array
 * ```ts
 * import { race } from "@observable/race";
 *
 * const controller = new AbortController();
 * race([]).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output (synchronously):
 * // "return"
 * ```
 */
export function race<const Values extends ReadonlyArray<unknown>>(
  sources: Readonly<{ [Key in keyof Values]: Observable<Values[Key]> }>,
): Observable<Values[number]>;
/**
 * Mirrors the first [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to
 * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next) or
 * [`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw) a value.
 * @example
 * Iterable of sources
 * ```ts
 * import { race } from "@observable/race";
 * import { Subject } from "@observable/core";
 *
 * const controller = new AbortController();
 * const source1 = new Subject<number>();
 * const source2 = source1;
 * const source3 = new Subject<number>();
 *
 * race(new Set([source1, source2, source3])).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * source2.next(1); // "next" 1
 * source1.next(2);
 * source3.next(3);
 * source1.return();
 * source2.next(4); // "next" 4
 * source3.next(5);
 * source2.return(); // "return"
 * ```
 */
export function race<Value>(sources: Iterable<Observable<Value>>): Observable<Value>;
export function race<Value>(sources: Iterable<Observable<Value>>): Observable<Value> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (!isIterable(sources)) throw new ParameterTypeError(0, "Iterable");

  if (Array.isArray(sources) && !sources.length) return empty;

  return defer(() => {
    const finished = new Subject<number>();
    return pipe(
      forOf(sources),
      takeUntil(finished),
      mergeMap((source, index) =>
        pipe(
          source,
          tap(() => {
            finished.next(index);
            finished.return();
          }),
          takeUntil(pipe(finished, filter((winnerIndex) => winnerIndex !== index))),
        )
      ),
    );
  });
}

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode Iterable} interface.
 * @internal Do NOT export
 */
function isIterable(value: unknown): value is Iterable<unknown> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  return (
    (typeof value === "object" && value !== null) &&
    Symbol.iterator in value &&
    typeof value[Symbol.iterator] === "function"
  );
}
