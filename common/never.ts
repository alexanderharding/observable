import { Observable } from "@xan/observable-core";
import { noop } from "@xan/observable-internal";

/**
 * An [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) that does nothing on
 * [`subscribe`](https://jsr.io/@xan/observable-core/doc/~/Observable.subscribe).
 * @example
 * ```ts
 * import { never } from "@xan/observable-common";
 *
 * const controller = new AbortController();
 *
 * never.subscribe({
 * 	signal: controller.signal,
 * 	next: () => console.log("next"), // Never called
 * 	throw: () => console.log("throw"), // Never called
 * 	return: () => console.log("return"), // Never called
 * });
 * ```
 */
export const never: Observable<never> = new Observable(noop);
