"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { ToastProvider } from "@/components/common/ToastProvider";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "@/lib/apolloClient";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "next-themes";
import { useStore } from "@/lib/store/useStore";

const queryClient = new QueryClient();

function ThemeInitializer({ children }: { children: ReactNode }) {
  const accent = useStore((state) => state.accent);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
  }, [accent]);

  const { theme } = useTheme();

  useEffect(() => {
    if (theme === "system") {
      const update = () => {
        const hour = new Date().getHours();
        const isDay = hour >= 6 && hour < 18;
        const target = isDay ? "light" : "dark";
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(target);
        document.documentElement.style.colorScheme = target;
      };
      update();
      const interval = setInterval(update);
      return () => clearInterval(interval);
    }
  }, [theme]);

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
