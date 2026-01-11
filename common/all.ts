import { type Observable, Observer, Subject } from "@xan/observable-core";
import { MinimumArgumentsRequiredError, noop, ParameterTypeError } from "@xan/observable-internal";
import { defer } from "./defer.ts";
import { empty } from "./empty.ts";
import { of } from "./of.ts";
import { pipe } from "./pipe.ts";
import { tap } from "./tap.ts";
import { map } from "./map.ts";
import { mergeMap } from "./merge-map.ts";
import { filter } from "./filter.ts";
import { takeUntil } from "./take-until.ts";

/**
 * Creates and returns an [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) whose
 * [`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next)ed values are calculated from the latest
 * [`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next)ed values of each of its {@linkcode sources}.
 * If any of the {@linkcode sources} are {@linkcode empty}, the returned [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable)
 * will also be {@linkcode empty}.
 */
export function all<const Values extends ReadonlyArray<unknown>>(
  sources: Readonly<{ [Key in keyof Values]: Observable<Values[Key]> }>,
): Observable<Values>;
export function all(
  // Long term, it would be nice to be able to accept an Iterable for performance and flexibility.
  // This new signature would have to work in conjunction with the mapped array signature above as this
  // encourages more explicit types for sources as a tuple.
  sources: ReadonlyArray<Observable>,
): Observable<ReadonlyArray<unknown>> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!Array.isArray(sources)) throw new ParameterTypeError(0, "Array");
  if (sources.length === 0) return empty;
  return defer(() => {
    let receivedFirstValueCount = 0;
    const { length: expectedFirstValueCount } = sources;
    const values: Array<unknown> = [];
    const emptySourceNotifier = new Subject<void>();
    return pipe(
      of(sources),
      mergeMap((source, index) => {
        let isEmpty = true;
        return pipe(
          source,
          tap(
            new Observer({
              next: processNextValue,
              return: processReturn,
              throw: noop,
            }),
          ),
        );

        function processNextValue(value: unknown): void {
          if (isEmpty) receivedFirstValueCount++;
          isEmpty = false;
          values[index] = value;
        }

        function processReturn(): void {
          if (isEmpty) emptySourceNotifier.next();
        }
      }),
      filter(() => receivedFirstValueCount === expectedFirstValueCount),
      map(() => values.slice()),
      takeUntil(emptySourceNotifier),
    );
  });
}
