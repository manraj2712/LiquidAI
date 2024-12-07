"use client";
import { supportedChainIds } from "@/config/chain";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider } from "wagmi";
import { getWagmiConfig } from "./wagmi";

export function Providers({
  children,
  wagmiCookie,
}: Readonly<{
  children: ReactNode;
  wagmiCookie: string | null;
}>) {
  const queryClient = new QueryClient();

  const wagmiConfig = getWagmiConfig();
  const initialWagmiState = cookieToInitialState(wagmiConfig, wagmiCookie);
  return (
    <WagmiProvider config={getWagmiConfig()} initialState={initialWagmiState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme()}
          initialChain={supportedChainIds.base}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
