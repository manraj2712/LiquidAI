import { supportedChainIds } from "@/config/chain";
import type { Transport } from "viem";
import { type Chain as ViemChains } from "viem";
import * as viemChains from "viem/chains";
import { cookieStorage, createConfig, createStorage, http } from "wagmi";

export const allWagmiChains = {
  ...viemChains,
};

const wagmiChainsById: Record<number, ViemChains> = Object.values(
  allWagmiChains
).reduce((acc, chainData) => {
  return chainData.id
    ? {
        ...acc,
        [chainData.id]: chainData,
      }
    : acc;
}, {});

export const getAllWagmiChains = () => {
  return Object.values(supportedChainIds).map(
    (chainId) => wagmiChainsById[chainId]
  );
};

export const getWagmiChainById = (chainId: number) => {
  return wagmiChainsById[chainId];
};

export const getWagmiConfig = () => {
  return createConfig({
    chains: getAllWagmiChains() as [ViemChains],
    storage: createStorage({
      storage: cookieStorage,
    }),
    syncConnectedChain: true,
    transports: Object.values(supportedChainIds).reduce((acc, chainId) => {
      return {
        ...acc,
        [chainId]: http(),
      };
    }, {} as Record<number, Transport>),
    ssr: true,
  });
};
