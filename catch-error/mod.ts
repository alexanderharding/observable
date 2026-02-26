import { isObservable, Observable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { from } from "@observable/from";
import { pipe } from "@observable/pipe";

/**
 * {@linkcode project|Projects} each [`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw)n
 * value from the [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to a new
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
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
export function catchError<Value, ProjectedValue>(
  project: (error: unknown) => Observable<ProjectedValue>,
): (source: Observable<Value>) => Observable<Value | ProjectedValue> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof project !== "function") throw new ParameterTypeError(0, "Function");
  return function catchErrorFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = from(source);
    return new Observable((observer) =>
      source.subscribe({
        signal: observer.signal,
        next: (value) => observer.next(value),
        return: () => observer.return(),
        throw(value) {
          try {
            from(project(value)).subscribe(observer);
          } catch (error) {
            observer.throw(error);
          }
        },
      })
    );
  };
}
