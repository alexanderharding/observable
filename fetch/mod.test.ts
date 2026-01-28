import { assertEquals, assertThrows } from "@std/assert";
import { Observer } from "@observable/core";
import { materialize, type ObserverNotification } from "@observable/materialize";
import { pipe } from "@observable/pipe";
import { fetch } from "./mod.ts";

Deno.test("fetch should emit the response and return", async () => {
  // Arrange
  const notifications: Array<ObserverNotification<Response>> = [];
  const mockResponse = new Response(JSON.stringify({ id: 1 }), { status: 200 });
  const fetchCalls: Array<Parameters<typeof globalThis.fetch>> = [];
  const originalFetch = globalThis.fetch;
  Object.defineProperty(globalThis, "fetch", {
    value: (...args: Parameters<typeof globalThis.fetch>) => {
      fetchCalls.push(args);
      return Promise.resolve(mockResponse);
    },
    configurable: true,
  });

  // Act
  pipe(fetch("https://example.com/api"), materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  await Promise.resolve();

  // Assert
  assertEquals(fetchCalls.length, 1);
  assertEquals(fetchCalls[0][0], "https://example.com/api");
  assertEquals(notifications, [["next", mockResponse], ["return"]]);

  Object.defineProperty(globalThis, "fetch", { value: originalFetch, configurable: true });
});

Deno.test("fetch should pass through request init options", async () => {
  // Arrange
  const notifications: Array<ObserverNotification<Response>> = [];
  const mockResponse = new Response(JSON.stringify({ id: 1 }), { status: 201 });
  const fetchCalls: Array<Parameters<typeof globalThis.fetch>> = [];
  const originalFetch = globalThis.fetch;
  Object.defineProperty(globalThis, "fetch", {
    value: (...args: Parameters<typeof globalThis.fetch>) => {
      fetchCalls.push(args);
      return Promise.resolve(mockResponse);
    },
    configurable: true,
  });
  const body = JSON.stringify({ name: "test" });
  const headers = { "Content-Type": "application/json" };

  // Act
  pipe(
    fetch("https://example.com/api", { method: "POST", body, headers }),
    materialize(),
  ).subscribe(new Observer((notification) => notifications.push(notification)));
  await Promise.resolve();

  // Assert
  assertEquals(fetchCalls.length, 1);
  const [url, init] = fetchCalls[0];
  assertEquals(url, "https://example.com/api");
  assertEquals((init as RequestInit).method, "POST");
  assertEquals((init as RequestInit).body, body);
  assertEquals((init as RequestInit).headers, headers);
  assertEquals(notifications, [["next", mockResponse], ["return"]]);

  Object.defineProperty(globalThis, "fetch", { value: originalFetch, configurable: true });
});

Deno.test("fetch should throw when the fetch request fails", async () => {
  // Arrange
  const notifications: Array<ObserverNotification<Response>> = [];
  const error = new Error("Network failure");
  const originalFetch = globalThis.fetch;
  Object.defineProperty(globalThis, "fetch", {
    value: () => Promise.reject(error),
    configurable: true,
  });

  // Act
  pipe(fetch("https://example.com/api"), materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  await Promise.resolve();

  // Assert
  assertEquals(notifications, [["throw", error]]);

  Object.defineProperty(globalThis, "fetch", { value: originalFetch, configurable: true });
});

Deno.test("fetch should abort the request on unsubscription", async () => {
  // Arrange
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<Response>> = [];
  const abortSignals: Array<AbortSignal> = [];
  const originalFetch = globalThis.fetch;
  Object.defineProperty(globalThis, "fetch", {
    value: (_url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.signal) {
        abortSignals.push(init.signal);
      }
      return new Promise(() => {
        // Never resolves
      });
    },
    configurable: true,
  });

  // Act
  pipe(fetch("https://example.com/api"), materialize()).subscribe(
    new Observer({
      signal: controller.signal,
      next: (notification) => notifications.push(notification),
    }),
  );
  controller.abort();
  await Promise.resolve();

  // Assert
  assertEquals(abortSignals.length, 1);
  assertEquals(abortSignals[0].aborted, true);
  assertEquals(notifications, []);

  Object.defineProperty(globalThis, "fetch", { value: originalFetch, configurable: true });
});

Deno.test("fetch should not emit when aborted before response", async () => {
  // Arrange
  const controller = new AbortController();
  const notifications: Array<ObserverNotification<Response>> = [];
  const originalFetch = globalThis.fetch;
  Object.defineProperty(globalThis, "fetch", {
    value: (_url: RequestInfo | URL, init?: RequestInit) => {
      return new Promise((_, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("The operation was aborted.", "AbortError"));
        });
      });
    },
    configurable: true,
  });

  // Act
  pipe(fetch("https://example.com/api"), materialize()).subscribe(
    new Observer({
      signal: controller.signal,
      next: (notification) => notifications.push(notification),
    }),
  );
  controller.abort();
  await Promise.resolve();

  // Assert
  assertEquals(notifications, []);

  Object.defineProperty(globalThis, "fetch", { value: originalFetch, configurable: true });
});

Deno.test("fetch should not abort the response after it is received", async () => {
  // Arrange
  const controller = new AbortController();
  const mockResponse = new Response(JSON.stringify({ id: 1 }), { status: 200 });
  const abortSignals: Array<AbortSignal> = [];
  const originalFetch = globalThis.fetch;
  Object.defineProperty(globalThis, "fetch", {
    value: (_url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.signal) {
        abortSignals.push(init.signal);
      }
      return Promise.resolve(mockResponse);
    },
    configurable: true,
  });
  let receivedResponse: Response | undefined;

  // Act
  fetch("https://example.com/api").subscribe(
    new Observer({
      signal: controller.signal,
      next: (response) => {
        receivedResponse = response;
      },
    }),
  );
  await Promise.resolve();
  controller.abort();

  // Assert
  assertEquals(receivedResponse, mockResponse);
  assertEquals(abortSignals.length, 1);
  // After response is received, the abort signal should not be aborted
  // even if we abort the subscription
  assertEquals(abortSignals[0].aborted, false);

  Object.defineProperty(globalThis, "fetch", { value: originalFetch, configurable: true });
});

Deno.test("fetch should accept a URL object as input", async () => {
  // Arrange
  const notifications: Array<ObserverNotification<Response>> = [];
  const mockResponse = new Response("", { status: 200 });
  const fetchCalls: Array<Parameters<typeof globalThis.fetch>> = [];
  const originalFetch = globalThis.fetch;
  Object.defineProperty(globalThis, "fetch", {
    value: (...args: Parameters<typeof globalThis.fetch>) => {
      fetchCalls.push(args);
      return Promise.resolve(mockResponse);
    },
    configurable: true,
  });
  const url = new URL("https://example.com/api");

  // Act
  pipe(fetch(url), materialize()).subscribe(
    new Observer((notification) => notifications.push(notification)),
  );
  await Promise.resolve();

  // Assert
  assertEquals(fetchCalls.length, 1);
  assertEquals(fetchCalls[0][0], url);
  assertEquals(notifications, [["next", mockResponse], ["return"]]);

  Object.defineProperty(globalThis, "fetch", { value: originalFetch, configurable: true });
});

Deno.test("fetch should throw an error if no arguments are provided", () => {
  // Arrange / Act / Assert
  assertThrows(
    () => fetch(...([] as unknown as Parameters<typeof fetch>)),
    TypeError,
    "1 argument required but 0 present",
  );
});

Deno.test("fetch should not start the request when already aborted", async () => {
  // Arrange
  const controller = new AbortController();
  controller.abort();
  const notifications: Array<ObserverNotification<Response>> = [];
  const fetchCalls: Array<Parameters<typeof globalThis.fetch>> = [];
  const originalFetch = globalThis.fetch;
  Object.defineProperty(globalThis, "fetch", {
    value: (...args: Parameters<typeof globalThis.fetch>) => {
      fetchCalls.push(args);
      const init = args[1]! as RequestInit;
      if (init?.signal?.aborted) {
        return Promise.reject(new DOMException("The operation was aborted.", "AbortError"));
      }
      return Promise.resolve(new Response("", { status: 200 }));
    },
    configurable: true,
  });

  // Act
  pipe(fetch("https://example.com/api"), materialize()).subscribe(
    new Observer({
      signal: controller.signal,
      next: (notification) => notifications.push(notification),
    }),
  );
  await Promise.resolve();

  // Assert
  assertEquals(notifications, []);

  Object.defineProperty(globalThis, "fetch", { value: originalFetch, configurable: true });
});
