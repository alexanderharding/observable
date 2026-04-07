import { type Observable, Subject } from "@observable/core";
import { defer } from "@observable/defer";
import { empty } from "@observable/empty";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { tap } from "@observable/tap";
import { map } from "@observable/map";
import { mergeMap } from "@observable/merge-map";
import { filter } from "@observable/filter";
import { takeUntil } from "@observable/take-until";
import { finalize } from "@observable/finalize";

/**
 * [`Next`](https://jsr.io/@observable/core/doc/~/Observer.next)s {@linkcode Values|values} from _all_ of the given
 * {@linkcode observables} in [index](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#array_indices)
 * order.
 * @example
 * Array of observables
 * ```ts
 * import { all } from "@observable/all";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const observable1 = forOf([1, 2, 3]);
 * const observable2 = forOf([4, 5, 6]);
 * const observable3 = forOf([7, 8, 9]);
 * const controller = new AbortController();
 *
 * all([observable1, observable2, observable3]).subscribe({
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
 * Array with an empty observable
 * ```ts
 * import { all } from "@observable/all";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 * import { empty } from "@observable/empty";
 *
 * const observable1 = forOf([1, 2, 3]);
 * const observable2 = forOf([7, 8, 9]);
 * const controller = new AbortController();
 *
 * all([observable1, empty, observable2]).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "return"
 * ```
 * @example
 * Empty observable array
 * ```ts
 * import { all } from "@observable/all";
 *
 * const controller = new AbortController();
 *
 * all([]).subscribe({
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
  observables: Readonly<{ [Key in keyof Values]: Observable<Values[Key]> }>,
): Observable<Values>;
/**
 * [`Next`](https://jsr.io/@observable/core/doc/~/Observer.next)s an [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
 * of {@linkcode Value|values} from _all_ of the given {@linkcode observables} in [iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol)
 * order.
 * @example
 * Iterable of observables
 * ```ts
 * import { all } from "@observable/all";
 * import { Subject } from "@observable/core";
 *
 * const subject1 = new Subject<number>();
 * const subject2 = subject1;
 * const subject3 = new Subject<number>();
 * const controller = new AbortController();
 *
 * all(new Set([subject1, subject2, subject3])).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 * subject2.next(1);
 * subject1.next(2);
 * subject3.next(3); // "next" [2, 3]
 * subject1.next(4); // "next" [4, 3]
 * subject2.next(5); // "next" [4, 5]
 * subject1.return();
 * subject3.return(); // "return"
 * subject2.return();
 * ```
 * @example
 * Iterable with an empty observable
 * ```ts
 * import { all } from "@observable/all";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 * import { empty } from "@observable/empty";
 *
 * const observable1 = forOf([1, 2, 3]);
 * const observable2 = forOf([7, 8, 9]);
 * const controller = new AbortController();
 *
 * all(new Set([observable1, empty, observable2])).subscribe({
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
export function all<Value>(
  observables: Iterable<Observable<Value>>,
): Observable<ReadonlyArray<Value>>;
export function all<Value>(
  observables: Iterable<Observable<Value>>,
): Observable<ReadonlyArray<Value>> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (!isIterable(observables)) throw new TypeError("Parameter 1 is not of type 'Iterable'");

  if (Array.isArray(observables) && !observables.length) return empty;

  // Use defer so we do not start iterating until subscription, we get a fresh iteration for each subscription,
  // and we get a fresh variable scope for each subscription.
  return defer(() => {
    /**
     * Tracking the number of first values that have been received.
     */
    let receivedFirstValueCount = 0;
    /**
     * The normalized {@linkcode observables} which has a known length for subsequent logic.
     */
    const observableArray: ReadonlyArray<Observable<Value>> = Array.isArray(observables)
      ? observables
      : Array.from(observables);
    /**
     * Tracking the expected number of first values that need to be received before the first snapshot is emitted.
     */
    const expectedFirstValueCount = observableArray.length;

    /**
     * Tracking a known list of buffered values, so we don't have to clone them while nexting to prevent reentrant behaviors.
     */
    let bufferSnapshot: ReadonlyArray<Value> | undefined;
    /**
     * Tracking the buffered values.
     */
    const buffer: Array<Value> = [];

    /**
     * The [notifier](https://jsr.io/@observable/core#notifier) that will tell the output
     * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to stop taking values.
     */
    const stop = new Subject<void>();

    return pipe(
      forOf(observableArray),
      mergeMap((observable, index) => {
        /**
         * Tracking if the observable is empty to be evaluated by subsequent logic.
         */
        let isEmpty = true;
        return pipe(
          observable,
          tap((value) => {
            if (isEmpty) receivedFirstValueCount++;
            isEmpty = false;

            // Check for value equality and update the buffer only if it's different.
            // Though this doesn't stop the snapshot from being emitted, it prevents the buffer from
            // being cloned unnecessarily.
            if (!Object.is(buffer[index], value)) {
              // Update the buffer.
              buffer[index] = value;
              // Reset the buffer snapshot since it's now stale.
              bufferSnapshot = undefined;
            }
          }),
          // If this `observable` is empty, tell the output Observable to stop taking values.
          finalize(() => isEmpty && stop.next()),
        );
      }),
      filter(() => receivedFirstValueCount === expectedFirstValueCount),
      // All first values have been received, we can cleanup the notifier.
      tap(() => stop.return()),
      map(() => bufferSnapshot ??= Object.freeze(buffer.slice())),
      takeUntil(stop),
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
