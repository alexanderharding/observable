import type { Observable } from "@xan/observable-core";
import { of } from "./of.ts";

/**
 * An [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) that calls [`return`](https://jsr.io/@xan/observable-core/doc/~/Observer.return)
 * immediately on [`subscribe`](https://jsr.io/@xan/observable-core/doc/~/Observable.subscribe).
 * @example
 * ```ts
 * import { empty } from "@xan/observable-common";
 *
 * const controller = new AbortController();
 *
 * empty.subscribe({
 * 	signal: controller.signal,
 * 	next: () => console.log("next"),
 * 	throw: () => console.log("throw"),
 * 	return: () => console.log("return"),
 * });
 *
 * // Console output:
 * // return
 * ```
 */
export const empty: Observable<never> = of([]);
