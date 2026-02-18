import { type Observable, Subject } from "@observable/core";
import {
  isIterable,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@observable/internal";
import { defer } from "@observable/defer";
import { empty } from "@observable/empty";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";
import { tap } from "@observable/tap";
import { map } from "@observable/map";
import { mergeMap } from "@observable/merge-map";
import { filter } from "@observable/filter";
import { takeUntil } from "@observable/take-until";
import { finalize } from "@observable/finalize";

/**
 * [`Next`](https://jsr.io/@observable/core/doc/~/Observer.next)s an [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
 * of the latest {@linkcode Values|values} from _all_ of {@linkcode input}'s [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)s, in
 * [index](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#array_indices) order.
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
  input: Readonly<{ [Key in keyof Values]: Observable<Values[Key]> }>,
): Observable<Values>;
/**
 * [`Next`](https://jsr.io/@observable/core/doc/~/Observer.next)s an [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
 * of the latest {@linkcode Value|values} from _all_ of {@linkcode input}'s [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)s, in
 * [iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol) order.
 * @example
 * ```ts
 * import { all } from "@observable/all";
 * import { Subject } from "@observable/core";
 *
 * const source1 = new Subject<number>();
 * const source2 = source1;
 * const source3 = new Subject<number>();
 *
 * const controller = new AbortController();
 * all(new Set([source1, source2, source3])).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 * source2.next(1);
 * source1.next(2);
 * source3.next(3); // "next" [2, 3]
 * source1.next(4); // "next" [4, 3]
 * source2.next(5); // "next" [4, 5]
 * source1.return();
 * source3.return(); // "return"
 * source2.return();
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
export function all<Value>(
  input: Iterable<Observable<Value>>,
): Observable<ReadonlyArray<Value>>;
export function all<Value>(
  input: Iterable<Observable<Value>>,
): Observable<ReadonlyArray<Value>> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isIterable(input)) throw new ParameterTypeError(0, "Iterable");

  // Early return if the iterable is an empty array.
  if (Array.isArray(input) && !input.length) return empty;

  // Use defer so we do not start iterating until subscription, we get a fresh iteration for each subscription,
  // and we get a fresh variable scope for each subscription.
  return defer(() => {
    /**
     * Tracking the number of first values that have been received.
     */
    let receivedFirstValueCount = 0;
    /**
     * The normalized {@linkcode input} which has a known length for subsequent logic.
     */
    const inputArray: ReadonlyArray<Observable<Value>> = Array.isArray(input)
      ? input
      : Array.from(input);
    /**
     * Tracking the expected number of first values that need to be received before the first snapshot is emitted.
     */
    const expectedFirstValueCount = inputArray.length;

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
      inputArray,
      ofIterable(),
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
