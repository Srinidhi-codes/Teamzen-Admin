"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { ToastProvider } from "@/components/common/ToastProvider";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "@/lib/apolloClient";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { useStore } from "@/lib/store/useStore";

const queryClient = new QueryClient();

function ThemeInitializer({ children }: { children: ReactNode }) {
  const accent = useStore((state) => state.accent);

  useEffect(() => {
    // Apply the accent color to the document root
    document.documentElement.setAttribute("data-accent", accent);
  }, [accent]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeInitializer>
            <Toaster />
            <ToastProvider>{children}</ToastProvider>
          </ThemeInitializer>
        </ThemeProvider>
      </QueryClientProvider>
    </ApolloProvider>
  );
}
