import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// ⚠️ MUST use a relative /api/... URL, NOT NEXT_PUBLIC_GRAPHQL_URL directly.
//
// Why: The Render backend is on a different domain from Vercel. The httpOnly
// access_token cookie cannot be sent cross-origin by the browser. The proxy
// at app/api/[...path]/route.ts reads the cookie server-side (Node.js has
// access to httpOnly cookies) and injects "Authorization: Bearer <token>"
// before forwarding to Django — this is the only way auth works across domains.
const httpLink = createHttpLink({
  uri: "/api/graphql/",
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
