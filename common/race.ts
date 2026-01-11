import { type Observable, Observer } from "@xan/observable-core";
import {
  isIterable,
  MinimumArgumentsRequiredError,
  noop,
  ParameterTypeError,
} from "@xan/observable-internal";
import { defer } from "./defer.ts";
import { of } from "./of.ts";
import { pipe } from "./pipe.ts";
import { tap } from "./tap.ts";
import { mergeMap } from "./merge-map.ts";
import { takeUntil } from "./take-until.ts";
import { filter } from "./filter.ts";
import { AsyncSubject } from "./async-subject.ts";

/**
 * Creates and returns an [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) that mirrors the first {@linkcode sources|source}
 * [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) to [`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next) or
 * [`throw`](https://jsr.io/@xan/observable-core/doc/~/Observer.throw) a value.
 */
export function race<Value>(
  // Accepting an Iterable is a design choice for performance (iterables are lazily evaluated) and
  // flexibility (can accept any iterable, not just arrays).
  sources: Iterable<Observable<Value>>,
): Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isIterable(sources)) throw new ParameterTypeError(0, "Iterable");
  return defer(() => {
    const finished = new AsyncSubject<number>();
    return pipe(
      of(sources),
      takeUntil(finished),
      mergeMap((source, index) => {
        const observer = new Observer<Value>({ next: finish, throw: noop });
        const lost = pipe(finished, filter(isLoser));
        return pipe(source, tap(observer), takeUntil(lost));

        function finish(): void {
          finished.next(index);
          finished.return();
        }

        function isLoser(winnerIndex: number): boolean {
          return winnerIndex !== index;
        }
      }),
    );
  });
}
