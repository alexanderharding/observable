import { Observable } from "@observable/core";

/**
 * An [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that calls [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)
 * immediately on [`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).
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
