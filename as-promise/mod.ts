import { isObservable, type Observable, Observer } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { AsyncSubject } from "@observable/async-subject";

/**
 * Converts an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to a {@linkcode Promise}.
 * @example
 * ```ts
 * import { asPromise } from "@observable/as-promise";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 *  console.log(await pipe(of([1, 2, 3]), asPromise()));
 *
 * // Console output:
 * // 3
 * ```
 */
export function asPromise<Value>(): (
  source: Observable<Value>,
) => Promise<Value> {
  return function asPromiseFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    const { resolve, reject, promise } = Promise.withResolvers<Value>();
    const subject = new AsyncSubject<Value>();
    subject.subscribe(new Observer({ next: resolve, throw: reject }));
    source.subscribe(subject);
    return promise;
  };
}
