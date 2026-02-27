import { isObservable, type Observable, Subject } from "@observable/core";
import { from } from "@observable/from";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { defer } from "@observable/defer";
import { pipe } from "@observable/pipe";
import { takeUntil } from "@observable/take-until";
import { mergeMap } from "@observable/merge-map";

/**
 * {@linkcode project|Projects} each [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)'s
 * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value to an
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which is merged in the output
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable), switching to latest
 * {@linkcode project|projected} [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) and
 * [`unsubscribing`](https://jsr.io/@observable/core/doc/~/Observer.signal) the previous one.
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
  if (typeof project !== "function") throw new ParameterTypeError(0, "Function");
  return function switchMapFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
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
