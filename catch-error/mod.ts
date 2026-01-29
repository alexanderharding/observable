import { isObservable, Observable, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * Catches errors from the [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) and returns a new
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) with the resolved value.
 * @example
 * ```ts
 * import { catchError } from "@observable/catch-error";
 * import { throwError } from "@observable/throw-error";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(
 *   throwError(new Error("error")),
 *   catchError(() => pipe(["fallback"], ofIterable())),
 * ).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" "fallback"
 * // "return"
 * ```
 */
export function catchError<Value, ResolvedValue>(
  resolver: (value: unknown) => Observable<ResolvedValue>,
): (source: Observable<Value>) => Observable<Value | ResolvedValue> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof resolver !== "function") {
    throw new ParameterTypeError(0, "Function");
  }
  return function catchErrorFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = toObservable(source);
    return new Observable((observer) =>
      source.subscribe({
        signal: observer.signal,
        next: (value) => observer.next(value),
        return: () => observer.return(),
        throw: (value) => toObservable(resolver(value)).subscribe(observer),
      })
    );
  };
}
