import { Observable } from "@observable/core";

/**
 * Immediately [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s the
 * [`Observer`](https://jsr.io/@observable/core/doc/~/Observer) on
 * [`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe) without
 * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ing a value.
 * @example
 * ```ts
 * import { empty } from "@observable/empty";
 *
 * const controller = new AbortController();
 *
 * empty.subscribe({
 * 	signal: controller.signal,
 * 	next: (value) => console.log("next", value),
 * 	return: () => console.log("return"),
 * 	throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "return"
 * ```
 */
export const empty: Observable<never> = new Observable((observer) => observer.return());
