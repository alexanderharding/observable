import { isObservable, type Observable } from "@observable/core";
import { from } from "@observable/from";
import { pipe } from "@observable/pipe";
import { map } from "@observable/map";
import { filter } from "@observable/filter";
import { pairwise } from "@observable/pairwise";
import { flat } from "@observable/flat";
import { of } from "@observable/of";

/**
 * Flag indicating that no value has been emitted yet.
 * @internal Do NOT export.
 */
const noValue = Symbol("Flag indicating that no value has been emitted yet");

/**
 * Filters each {@linkcode Value|value} that is [distinct](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
 * from the previous {@linkcode Value|value}.
 * @example
 * ```ts
 * import { distinctUntilChanged } from "@observable/distinct-until-changed";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 1, 1, 2, 2, 3]), distinctUntilChanged()).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log(value),
 * });
 *
 * // Console output:
 * // 1
 * // 2
 * // 3
 * // return
 * ```
 */
export function distinctUntilChanged<Value>(): (source: Observable<Value>) => Observable<Value>;
/**
 * Filters each {@linkcode Value|value} that is distinct from the previous {@linkcode Value|value} according to the given {@linkcode comparator} function.
 * @example
 * ```ts
 * import { distinctUntilChanged } from "@observable/distinct-until-changed";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([{ id: 1 }, { id: 1 }, { id: 2 }]), distinctUntilChanged((a, b) => a.id === b.id)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 * ```
 * // Console output:
 * // "next" { id: 1 }
 * // "next" { id: 2 }
 * // "return"
 * ```
 */
export function distinctUntilChanged<Value>(
  comparator: (previous: Value, current: Value) => boolean,
): (source: Observable<Value>) => Observable<Value>;
/**
 * Filters each {@linkcode Value|value} that is distinct from the previous {@linkcode Value|value} according to the given {@linkcode comparator}
 * function or [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) if one is not provided.
 * @example
 * Default comparator
 * ```ts
 * import { distinctUntilChanged } from "@observable/distinct-until-changed";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 1, 1, 2, 2, 3]), distinctUntilChanged()).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log(value),
 * });
 *
 * // Console output:
 * // 1
 * // 2
 * // 3
 * // return
 * ```
 * @example
 * Custom comparator
 * ```ts
 * import { distinctUntilChanged } from "@observable/distinct-until-changed";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([{ id: 1 }, { id: 1 }, { id: 2 }]), distinctUntilChanged((a, b) => a.id === b.id)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 * ```
 * // Console output:
 * // "next" { id: 1 }
 * // "next" { id: 2 }
 * // "return"
 * ```
 */
export function distinctUntilChanged<Value>(
  comparator?: (previous: Value, current: Value) => boolean,
): (source: Observable<Value>) => Observable<Value>;
export function distinctUntilChanged<Value>(
  // Default to Object.is because its behavior is more predictable than
  // strict equality checks.
  comparator: (previous: Value, current: Value) => boolean = Object.is,
): (source: Observable<Value>) => Observable<Value> {
  if (typeof comparator !== "function") {
    throw new TypeError("Parameter 1 is not of type 'Function'");
  }
  return function distinctUntilChangedFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");
    source = from(source);
    return pipe(
      flat([of(noValue), source]),
      pairwise(),
      filter(isDistinct),
      map(([_, current]) => current),
    );
  };

  function isDistinct([previous, current]: Readonly<
    [previous: Value | typeof noValue, current: Value]
  >): boolean {
    return previous === noValue || !comparator(previous, current);
  }
}
