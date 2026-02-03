import type { Observer } from "./observer.ts";

/**
 * Object interface for an {@linkcode Observer} factory.
 */
export interface ObserverConstructor {
  /**
   * Creates and return an object that provides a standard way to [consume](https://jsr.io/@observable/core#consumer)
   * a sequence of values (either finite or infinite).
   * ```ts
   * import { Observer } from "@observable/core";
   *
   * const observer = new Observer<0>({
   *   next: (value) => console.log("next", value),
   *   return: () => console.log("return"),
   *   throw: (value) => console.log("throw", value),
   * });
   * const timeout = setTimeout(() => {
   *   observer.next(0);
   *   observer.return();
   *   // The following "next" and "throw" method calls are no-ops since we already returned
   *   // and are only here for demonstration purposes.
   *   observer.next(0);
   *   observer.throw(new Error("Should not be thrown"));
   * }, 100);
   * observer.signal.addEventListener("abort", () => clearTimeout(timeout), {
   *   once: true,
   * });
   *
   * // Console output (after 100ms):
   * // "next" 0
   * // "return"
   * ```
   */
  new <Value>(
    observer?: Partial<Observer<Value>> | Observer<Value>["next"] | null,
  ): Observer<Value>;
  readonly prototype: Observer;
}
