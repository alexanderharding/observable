import {
  isObservable,
  type Observable,
  Observer,
  Subject,
  toObservable,
} from "@xan/observable-core";
import { MinimumArgumentsRequiredError, noop, ParameterTypeError } from "@xan/observable-internal";
import { defer } from "./defer.ts";
import { pipe } from "./pipe.ts";
import { takeUntil } from "./take-until.ts";
import { tap } from "./tap.ts";
import { mergeMap } from "./merge-map.ts";

/**
 * {@linkcode project|Projects} each source value to an [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) which is
 * merged in the output [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable), emitting values only from the most
 * recently {@linkcode project|projected} [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable).
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
        tap(new Observer({ next: () => switching.next(), throw: noop })),
        mergeMap((value, index) => pipe(project(value, index), takeUntil(switching))),
      );
    });
  };
}
