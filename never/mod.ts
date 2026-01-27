import { Observable } from "@observable/core";
import { noop } from "@observable/internal";

/**
 * Does nothing on [`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).
 * @example
 * ```ts
 * import { never } from "@observable/never";
 *
 * const controller = new AbortController();
 *
 * never.subscribe({
 * 	signal: controller.signal,
 * 	next: (value) => console.log("next", value), // Never called
 * 	return: () => console.log("return"), // Never called
 * 	throw: (value) => console.log("throw", value), // Never called
 * });
 * ```
 */
export const never: Observable<never> = new Observable(noop);
