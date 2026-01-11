Platform-agnostic utilities for [@xan/observable-core](https://jsr.io/@xan/observable-core).

## Example

```ts
import { Observable, type Observer } from "@xan/observable-core";
import {
  all,
  asObservable,
  BehaviorSubject,
  defer,
  drop,
  filter,
  map,
  of,
  pipe,
  switchMap,
  takeUntil,
  throwError,
} from "@xan/observable-common";

type Customer = Readonly<Record<"name" | "email", string>>;
type AuthState = Readonly<Record<"id" | "jwt", string>>;

class CustomerService implements Observable<Customer> {
  readonly #authState = new BehaviorSubject<AuthState | null>(null);
  readonly authenticated = pipe(this.#authState, map(Boolean));

  readonly #events = new Subject<"logged-in" | "logged-out" | "logging-out">();
  readonly events = pipe(this.#events, asObservable());

  readonly #customer = pipe(
    this.authenticated,
    switchMap((authenticated) => {
      if (authenticated) return throwError(new Error("Not authenticated"));
      return pipe(this.#authState, switchMap(this.#get));
    }),
    takeUntil(this.events.filter((event) => event === "logging-out")),
  );

  login(email: string, password: string): Observable<void> {
    return pipe(
      defer(() => {
        this.logout();
        return this.#login(email, password);
      }),
      map((state) => {
        this.#authState.next(state);
        this.#events.next("logged-in");
      }),
    );
  }

  logout(): boolean {
    const { value: state } = this.#authState;
    if (state === null) return false;
    this.#events.next("logging-out");
    this.#authState.next(null);
    this.#events.next("logged-out");
    return true;
  }

  subscribe(observer: Observer<Customer>): void {
    return this.#customer;
  }

  #get(this: void, state: AuthState): Observable<Customer> {
    return new Observable(async (observer) => {
      try {
        const response = await fetch(
          `https://api.example.com/customer/${state.id}`,
          { headers: { Authorization: `Bearer ${state.jwt}` } },
        );
        observer.next(await response.json());
        observer.return();
      } catch (error) {
        observer.throw(error);
      }
    });
  }

  #login(this: void, email: string, password: string): Observable<AuthState> {
    return new Observable(async (observer) => {
      try {
        const response = await fetch(`https://api.example.com/login`, {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        observer.next(await response.json());
        observer.return();
      } catch (error) {
        observer.throw(error);
      }
    });
  }
}
```

# Glossary And Semantics

[@xan/observable-core](https://jsr.io/@xan/observable-core#glossary-and-semantics)
