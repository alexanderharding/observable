import { isObservable, type Observable } from "@observable/core";
import { from } from "@observable/from";
import { pipe } from "@observable/pipe";
import { mergeMap } from "@observable/merge-map";
import { merge } from "@observable/merge";
import { defer } from "@observable/defer";
import { of } from "@observable/of";

/**
 * Recursively {@linkcode project|projects} each {@linkcode Value|value} to an
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
 * @example
 * Double until 16
 * ```ts
 * import { expand } from "@observable/expand";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 * import { empty } from "@observable/empty";
 *
 * const controller = new AbortController();
 *
 * // Recursively double values until >= 16
 * pipe(
 *   of(2),
 *   expand((value) => value < 16 ? of(value * 2) : empty),
 * ).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 2
 * // "next" 4
 * // "next" 8
 * // "next" 16
 * // "return"
 * ```
 * @example
 * Tree traversal
 * ```ts
 * import { expand } from "@observable/expand";
 * import { of } from "@observable/of";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 * import { empty } from "@observable/empty";
 *
 * // Traverse a tree structure
 * interface Node {
 *   id: string;
 *   children: Node[];
 * }
 *
 * const tree: Node = {
 *   id: "root",
 *   children: [
 *     { id: "a", children: [{ id: "a1", children: [] }] },
 *     { id: "b", children: [] },
 *   ],
 * };
 *
 * const controller = new AbortController();
 *
 * pipe(
 *   of(tree),
 *   expand((node) =>
 *     node.children.length ? forOf(node.children) : empty
 *   ),
 * ).subscribe({
 *   signal: controller.signal,
 *   next: (node) => console.log("visited", node.id),
 *   return: () => console.log("done"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "visited" "root"
 * // "visited" "a"
 * // "visited" "a1"
 * // "visited" "b"
 * // "done"
 * ```
 */
export function expand<Value>(
  project: (value: Value, index: number) => Observable<Value>,
): (source: Observable<Value>) => Observable<Value> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof project !== "function") throw new TypeError("Parameter 1 is not of type 'Function'");
  return function expandFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");
    source = from(source);
    return defer(() => {
      let index = 0;
      return pipe(
        source,
        mergeMap((value) =>
          merge([
            of(value),
            pipe(defer(() => project(value, index++)), expand((value) => project(value, index++))),
          ])
        ),
      );
    });
  };
}
