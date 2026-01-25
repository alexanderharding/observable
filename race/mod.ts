import { type Observable, Observer } from "@observable/core";
import {
  isIterable,
  MinimumArgumentsRequiredError,
  noop,
  ParameterTypeError,
} from "@observable/internal";
import { defer } from "@observable/defer";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";
import { tap } from "@observable/tap";
import { mergeMap } from "@observable/merge-map";
import { takeUntil } from "@observable/take-until";
import { filter } from "@observable/filter";
import { AsyncSubject } from "@observable/async-subject";

/**
 * Creates and returns an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that mirrors the first
 * [source](https://jsr.io/@observable/core#source) to [`next`](https://jsr.io/@observable/core/doc/~/Observer.next) or
 * [`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw) a value.
 * @example
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
 * source2.return();
 * source3.next(5);
 * source2.return(); // "return"
 * ```
 */
export function race<const Values extends ReadonlyArray<unknown>>(
  sources: Readonly<{ [Key in keyof Values]: Observable<Values[Key]> }>,
): Observable<Values[number]>;
export function race<Value>(
  sources: Iterable<Observable<Value>>,
): Observable<Value>;
export function race<Value>(
  // Accepting any iterable is a design choice for performance (iterables are lazily evaluated) and
  // flexibility (can accept any iterable, not just arrays).
  sources: Iterable<Observable<Value>>,
): Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isIterable(sources)) throw new ParameterTypeError(0, "Iterable");
  return defer(() => {
    const finished = new AsyncSubject<number>();
    return pipe(
      of(sources),
      takeUntil(finished),
      mergeMap((source, index) => {
        const observer = new Observer<Value>({ next: finish, throw: noop });
        const lost = pipe(finished, filter(isLoser));
        return pipe(source, tap(observer), takeUntil(lost));

        function finish(): void {
          finished.next(index);
          finished.return();
        }

        function isLoser(winnerIndex: number): boolean {
          return winnerIndex !== index;
        }
      }),
    );
  });
}
