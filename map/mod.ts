import { isObservable, Observable } from "@observable/core";
import { from } from "@observable/from";
import { ParameterTypeError } from "@observable/internal";

/**
 * {@linkcode project|Projects} each [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed
 * {@linkcode In|value} from the [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to a new {@linkcode Out|value}.
 * @example
 * ```ts
 * import { map } from "@observable/map";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), map((value) => value * 2)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 2
 * // "next" 4
 * // "next" 6
 * // "return"
 * ```
 */
export function map<In, Out>(
  project: (value: In, index: number) => Out,
): (source: Observable<In>) => Observable<Out> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof project !== "function") throw new ParameterTypeError(0, "Function");
  return function mapFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = from(source);
    return new Observable((observer) => {
      let index = 0;
      source.subscribe({
        signal: observer.signal,
        next: (value) => observer.next(project(value, index++)),
        return: () => observer.return(),
        throw: (value) => observer.throw(value),
      });
    });
  };
}
