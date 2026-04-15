import type { Observable } from "@observable/core";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { flatMap } from "@observable/flat-map";
import { empty } from "@observable/empty";

/**
 * [Pushes](https://jsr.io/@observable/core#push) _all_ values from each of the given {@linkcode observables} in
 * [index](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#array_indices) order.
 * @example
 * Array of observables
 * ```ts
 * import { flat } from "@observable/flat";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const observable1 = forOf([1, 2, 3]);
 * const observable2 = forOf([4, 5, 6]);
 * const observable3 = forOf([7, 8, 9]);
 *
 * const controller = new AbortController();
 *
 * flat([observable1, observable2, observable3]).subscribe({
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
 * // "next" 4
 * // "next" 5
 * // "next" 6
 * // "next" 7
 * // "next" 8
 * // "next" 9
 * // "return"
 * ```
 * @example
 * Empty array
 * ```ts
 * import { flat } from "@observable/flat";
 *
 * const controller = new AbortController();
 * flat([]).subscribe({
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
export function flat<const Values extends ReadonlyArray<unknown>>(
  observables: Readonly<{ [Key in keyof Values]: Observable<Values[Key]> }>,
): Observable<Values[number]>;
/**
 * [Pushes](https://jsr.io/@observable/core#push) _all_ values from each of the given {@linkcode observables} in
 * [iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol) order.
 * @example
 * ```ts
 * import { flat } from "@observable/flat";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const observable1 = forOf([1, 2, 3]);
 * const observable2 = observable1;
 * const observable3 = forOf([4, 5, 6]);
 *
 * flat(new Set([observable1, observable2, observable3])).subscribe({
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
 * // "next" 4
 * // "next" 5
 * // "next" 6
 * // "return"
 * ```
 */
export function flat<Value>(observables: Iterable<Observable<Value>>): Observable<Value>;
export function flat<Value>(observables: Iterable<Observable<Value>>): Observable<Value> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (!isIterable(observables)) throw new TypeError("Parameter 1 is not of type 'Iterable'");
  if (Array.isArray(observables) && !observables.length) return empty;
  return pipe(forOf(observables), flatMap((observable) => observable));
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
