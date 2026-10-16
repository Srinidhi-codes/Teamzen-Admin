import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  Observable,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { refreshAuthToken } from "./api/client";
import { apolloCacheConfig, apolloDefaultOptions } from "./apolloCache";

const fromPromise = <T>(promise: Promise<T>): Observable<T> => {
  return new Observable<T>((observer: any) => {
    promise
      .then((value) => {
        observer.next(value);
        observer.complete();
      })
      .catch((err) => {
        observer.error(err);
      });
  });
};

const httpLink = createHttpLink({
  uri: "/api/graphql/",
  fetchOptions: {
    method: "POST",
  },
});

function getDynamicFrontendUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "";
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return origin.replace(":3001", ":3000");
    }
    if (envUrl && !envUrl.includes("localhost")) {
      return envUrl.replace(/\/+$/, "");
    }
    if (origin.includes("-admin")) {
      return origin.replace("-admin", "-client");
    }
    if (origin.includes("admin.")) {
      return origin.replace("admin.", "");
    }
    return origin;
  }
  return envUrl.replace(/\/+$/, "") || "http://localhost:3000";
}

const authLink = setContext((_, { headers }) => {
  let csrftoken = "";
  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp("(^| )csrftoken=([^;]+)"));
    if (match) {
      csrftoken = match[2];
    }
  }

  const dynamicFrontendUrl = getDynamicFrontendUrl();
  const adminOrigin = typeof window !== "undefined" ? window.location.origin : "";

  return {
    headers: {
      ...headers,
      "X-CSRFToken": csrftoken,
      ...(dynamicFrontendUrl ? { "X-Frontend-Url": dynamicFrontendUrl } : {}),
      ...(adminOrigin ? { "X-Admin-Origin": adminOrigin } : {}),
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }: any) => {
  // Only treat true auth/session failures as logout triggers.
  // Business permission errors ("Unauthorized") must NOT force token refresh/logout.
  const isUnauthorized =
    (graphQLErrors &&
      graphQLErrors.some(
        (e: any) =>
          e.message === "Unauthenticated" ||
          e.extensions?.code === "UNAUTHENTICATED" ||
          e.message.toLowerCase().includes("signature has expired") ||
          e.message.toLowerCase().includes("authentication credentials were not provided")
      )) ||
    (networkError &&
      "statusCode" in networkError &&
      networkError.statusCode === 401);

  if (isUnauthorized) {
    return new Observable((observer: any) => {
      refreshAuthToken()
        .then(() => {
          const subscriber = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          });

          return () => {
            if (subscriber.unsubscribe) subscriber.unsubscribe();
          };
        })
        .catch((error) => {
          import("@/lib/store/useStore").then(({ useStore }) => {
            useStore.getState().logoutUser();
          });

          if (typeof window !== "undefined") {
            const path = window.location.pathname;
            const isPublic =
              path === "/" ||
              path.startsWith("/login") ||
              path.startsWith("/register") ||
              path.startsWith("/forgot-password") ||
              path.startsWith("/reset-password");
            if (!isPublic) {
              window.location.href = "/login";
            }
          }

          observer.error(error);
        });
    });
  }
});

/** Refetch only queries that are currently active (mounted). */
export async function refetchActiveQueries(
  apolloClient: ApolloClient,
  operationNames: string[]
) {
  await apolloClient.refetchQueries({
    include: operationNames,
  });
}

export const client = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache(apolloCacheConfig),
  defaultOptions: apolloDefaultOptions,
});
