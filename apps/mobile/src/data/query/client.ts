import { QueryClient } from "@tanstack/react-query";

/**
 * One cache for the lifetime of the app. SQLite is the source of truth; the
 * database change bridge invalidates affected queries after writes.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: "always",
      retry: false,
      staleTime: Infinity,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      networkMode: "always",
      retry: false,
    },
  },
});
