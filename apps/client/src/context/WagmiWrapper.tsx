"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, linea, lineaSepolia, sepolia } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";

const config = createConfig({
  ssr: true,
  chains: [mainnet, linea, lineaSepolia, sepolia],
  connectors: [metaMask()],
  transports: {
    [mainnet.id]: http(),
    [linea.id]: http(),
    [lineaSepolia.id]: http(),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function WagmiWrapper({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
