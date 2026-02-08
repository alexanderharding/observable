import { assertEquals, assertStrictEquals } from "@std/assert";
import { Observer } from "@observable/core";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { pipe } from "@observable/pipe";
import { keepAlive } from "./mod.ts";
import { ofIterable } from "@observable/of-iterable";
import { forEach } from "@observable/for-each";

Deno.test("keepAlive should ignore abort indefinitely", () => {
  // Arrange
  const controller = new AbortController();
  const tapNotifications: Array<ObserverNotification<number>> = [];
  const observerNotifications: Array<ObserverNotification<number>> = [];
  const source = pipe([1, 2, 3], ofIterable());

  // Act
  pipe(
    source,
    materialize(),
    forEach((notification) => tapNotifications.push(notification)),
    keepAlive(),
  ).subscribe(
    new Observer({
      signal: controller.signal,
      next: (notification) => {
        observerNotifications.push(notification);
        if (notification[1] === 2) controller.abort();
      },
    }),
  );

  // Assert
  assertStrictEquals(controller.signal.aborted, true);
  assertEquals(observerNotifications, [
    ["next", 1],
    ["next", 2],
  ]);
  assertEquals(tapNotifications, [["next", 1], ["next", 2], ["next", 3], ["return"]]);
});
