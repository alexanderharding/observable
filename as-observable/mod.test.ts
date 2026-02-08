import { Observable, Observer } from "@observable/core";
import { assertEquals, assertInstanceOf, assertStrictEquals } from "@std/assert";
import { asObservable } from "./mod.ts";
import { pipe } from "@observable/pipe";

Deno.test(
  "asObservable should convert a custom observable to a proper observable",
  () => {
    // Arrange
    const observer = new Observer();
    const subscribeCalls: Array<Parameters<Observable<number>["subscribe"]>> = [];
    const custom: Observable<number> = {
      subscribe(observer) {
        assertInstanceOf(observer, Observer);
        subscribeCalls.push([observer]);
        observer.next(1);
        observer.next(2);
        observer.return();
      },
    };

    // Act
    const observable = pipe(custom, asObservable());
    observable.subscribe(observer);

    // Assert
    assertInstanceOf(observable, Observable);
    assertEquals(subscribeCalls, [[observer]]);
  },
);

Deno.test(
  "asObservable should return the same observer if it is already a proper observer",
  () => {
    // Arrange
    const expected = new Observable<number>((observer) => {
      observer.next(1);
      observer.next(2);
      observer.return();
    });

    // Act
    const actual = pipe(expected, asObservable());

    // Assert
    assertStrictEquals(actual, expected);
  },
);
