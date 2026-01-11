Platform-agnostic utilities for [@xan/observable-core](https://jsr.io/@xan/observable-core).

## Example

```ts
import { Observable } from "@xan/observable-core";
import { all, BehaviorSubject, map, of, pipe, switchMap } from "@xan/observable-common";

const customerId = new BehaviorSubject<string | null>("123456");
const jwt = new BehaviorSubject<string | null>(
  "9b201002-f157-49a3-b704-a26245a76715",
);
const isLoggedIn = pipe(
  all([customerId, jwt]),
  map(([customerId, jwt]) => !!customerId && !!jwt),
);
const customer = pipe(
  isLoggedIn,
  switchMap((isLoggedIn) => isLoggedIn ? getCustomer(customerId, jwt) : of(null)),
);

function getCustomer(
  id: string,
  jwt: string,
): Observable<Record<"name" | "email", string>> {
  return new Observable(async (observer) => {
    try {
      const response = await fetch(`https://api.example.com/customer/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      observer.next(await response.json());
    } catch (error) {
      observer.throw(error);
    }
  });
}

function logout(): void {
  customerId.next(null);
  jwt.next(null);
}
```
