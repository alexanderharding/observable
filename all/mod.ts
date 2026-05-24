import { Observable } from "@observable/core";
import { empty } from "@observable/empty";
import { pipe } from "@observable/pipe";
import { finalize } from "@observable/finalize";

/**
 * An iterable that has a known `size` _before_ iteration begins.
 * @internal Do NOT export
 */
type BoundedIterable<Value> = Iterable<Value> & Readonly<Record<"size", number>>;

/**
 * [Pushes](https://jsr.io/@observable/core#push) the latest {@linkcode Values|values} from _all_ of the given
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
 * [Pushes](https://jsr.io/@observable/core#push) an [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
 * of the latest {@linkcode Value|values} from _all_ of the given {@linkcode observables} in
 * [iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol) order.
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
 *
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
  if (observables instanceof Set && !observables.size) return empty;

  // We could compose a few different operators to achieve the same result, but this is
  // a more direct implementation that is easier to understand and reason about.
  return new Observable((observer) => {
    /**
     * The bounded {@linkcode observables} which has a known `size` for subsequent logic.
     */
    const boundObservables = bound(observables);

    if (!boundObservables.size) return observer.return();

    /**
     * Tracking the number of first values that have been received.
     */
    let receivedFirstValueCount = 0;
    /**
     * Tracking the number of active inner subscriptions.
     */
    let activeInnerSubscriptions = boundObservables.size;

    /**
     * Tracking a known list of {@linkcode buffer|buffered} values, so we don't have to clone them while nexting to prevent reentrant behaviors.
     */
    let snapshot: ReadonlyArray<Value> | undefined;
    /**
     * Tracking the buffered values.
     */
    const buffer: Array<Value> = [];

    /**
     * Tracking the index of the current observable.
     */
    let index = 0;

    for (const observable of boundObservables) {
      /**
       * Tracking if the {@linkcode observable} has pushed its first value.
       */
      let receivedFirstValue = false;
      /**
       * Tracking a snapshot of the {@linkcode index} at the time of evaluation.
       */
      const indexSnapshot = index++;

      pipe(observable, finalize(() => --activeInnerSubscriptions)).subscribe({
        signal: observer.signal,
        next(value) {
          if (!receivedFirstValue || !Object.is(buffer[indexSnapshot], value)) {
            if (!receivedFirstValue) ++receivedFirstValueCount;

            receivedFirstValue = true;

            buffer[indexSnapshot] = value;
            snapshot = undefined;
          }

          if (receivedFirstValueCount === boundObservables.size) {
            observer.next(snapshot ??= Object.freeze(buffer.slice()));
          }
        },
        return() {
          if (!receivedFirstValue || !activeInnerSubscriptions) observer.return();
        },
        throw: (value) => observer.throw(value),
      });

      if (observer.signal.aborted) return;
    }
  });
}

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode Iterable} interface.
 * @internal Do NOT export
 */
function isIterable(value: unknown): value is Iterable<unknown> {
  return typeof value === "object" && value !== null && Symbol.iterator in value &&
    typeof value[Symbol.iterator] === "function";
}

/**
 * Converts the given {@linkcode value} to a _reliable_ {@linkcode BoundedIterable}.
 * @internal Do NOT export
 */
function bound<Value>(value: Iterable<Value>): BoundedIterable<Value> {
  if (value instanceof Set) return value;
  const array = Array.isArray(value) ? value : Array.from(value);
  return { [Symbol.iterator]: () => array[Symbol.iterator](), size: array.length };
}
