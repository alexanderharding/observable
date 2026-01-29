import { isObservable, type Observable, Subject, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { defer } from "@observable/defer";
import { pipe } from "@observable/pipe";
import { takeUntil } from "@observable/take-until";
import { mergeMap } from "@observable/merge-map";

/**
 * {@linkcode project|Projects} each [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed
 * value from the [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to an inner
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable), [subscribing](https://jsr.io/@observable/core/doc/~/Observable.subscribe) only to the most
 * recently {@linkcode project|projected} inner [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * and canceling any previous inner [subscription](https://jsr.io/@observable/core#subscription).
 * @example
 * ```ts
 * import { BehaviorSubject } from "@observable/behavior-subject";
 * import { switchMap } from "@observable/switch-map";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * const page = new BehaviorSubject(1);
 * const controller = new AbortController();
 * pipe(page, switchMap((value) => fetchPage(value))).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * function fetchPage(page: number): Observable<string> {
 *   return pipe([`Page ${page}`], ofIterable());
 * }
 */
export function switchMap<In, Out>(
  project: (value: In, index: number) => Observable<Out>,
): (source: Observable<In>) => Observable<Out> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof project !== "function") {
    throw new ParameterTypeError(0, "Function");
  }
  return function switchMapFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = toObservable(source);
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
