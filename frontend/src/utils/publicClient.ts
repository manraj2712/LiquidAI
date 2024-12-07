import { getWagmiChainById } from "@/app/wagmi";
import { chainsData } from "@/config/chain";
import { createPublicClient, fallback, http, PublicClient } from "viem";

export const getPublicClient = (chainId: number): PublicClient => {
  const rpcs = chainsData[chainId].rpcUrls;
  return createPublicClient({
    transport: fallback(
      rpcs.map((rpc) => http(rpc, { batch: { wait: 100 }, retryDelay: 400 }))
    ),
    chain: getWagmiChainById(chainId),
  });
};
