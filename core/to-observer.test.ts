import { Observer } from "@xan/observable-core";
import { assertEquals, assertInstanceOf, assertStrictEquals } from "@std/assert";
import { toObserver } from "./to-observer.ts";

Deno.test(
  "toObserver should convert a custom observer to a proper observer",
  () => {
    // Arrange
    const nextCalls: Array<Parameters<Observer<number>["next"]>> = [];
    const returnCalls: Array<Parameters<Observer<number>["return"]>> = [];
    const throwCalls: Array<Parameters<Observer<number>["throw"]>> = [];
    const custom: Observer<number> = {
      signal: new AbortController().signal,
      next(...args) {
        nextCalls.push(args);
      },
      return(...args) {
        returnCalls.push(args);
      },
      throw(...args) {
        throwCalls.push(args);
      },
    };

    // Act
    const observer = toObserver(custom);
    observer.next(1);
    observer.next(2);
    observer.return();
    observer.throw(new Error("test"));

    // Assert
    assertStrictEquals(observer.signal.aborted, true);
    assertInstanceOf(observer, Observer);
    assertEquals(nextCalls, [[1], [2]]);
    assertEquals(returnCalls, [[]]);
    assertEquals(throwCalls, []);
  },
);

Deno.test(
  "toObserver should return the same observer if it is already a proper observer",
  () => {
    // Arrange
    const expected = new Observer<number>();

    // Act
    const actual = toObserver(expected);

    // Assert
    assertStrictEquals(actual, expected);
  },
);
