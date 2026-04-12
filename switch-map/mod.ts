import { isObservable, type Observable, Subject } from "@observable/core";
import { from } from "@observable/from";
import { defer } from "@observable/defer";
import { pipe } from "@observable/pipe";
import { takeUntil } from "@observable/take-until";
import { mergeMap } from "@observable/merge-map";

/**
 * {@linkcode project|Projects} each {@linkcode In|value} to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * and [`unsubscribes`](https://jsr.io/@observable/core/doc/~/Observer.signal) from any previously
 * {@linkcode project|projected} [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
 * @example
 * ```ts
 * import { BehaviorSubject } from "@observable/behavior-subject";
 * import { switchMap } from "@observable/switch-map";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 * import type { Observable } from "@observable/core";
 *
 * const page = new BehaviorSubject(1);
 * const controller = new AbortController();
 * pipe(page, switchMap((value) => of(`Page ${page}`))).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" "Page 1"
 *
 * page.next(2);
 *
 * // Console output:
 * // "next" "Page 2"
 *
 * page.return();
 *
 * // Console output:
 * // "return"
 *
 * ```
 */
export function switchMap<In, Out>(
  project: (value: In, index: number) => Observable<Out>,
): (source: Observable<In>) => Observable<Out> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof project !== "function") throw new TypeError("Parameter 1 is not of type 'Function'");
  return function switchMapFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");
    source = from(source);
    return defer(() => {
      const switching = new Subject<void>();
      return pipe(
        source,
        mergeMap((value, index) => {
          switching.next();
          return pipe(project(value, index), takeUntil(switching));
        }),
      );
    });
  };
}
