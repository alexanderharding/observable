import { isObservable, Observable } from "@observable/core";
import { from } from "@observable/from";

/**
 * {@linkcode project|Projects} each [`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw)n
 * value from the [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to a new
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
 * @example
 * ```ts
 * import { catchError } from "@observable/catch-error";
 * import { throwError } from "@observable/throw-error";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(
 *   throwError(new Error("error")),
 *   catchError(() => of("fallback")),
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
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof project !== "function") throw new TypeError("Parameter 1 is not of type 'Function'");
  return function catchErrorFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");
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
