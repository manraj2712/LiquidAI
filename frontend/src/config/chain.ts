import { ChainsData } from "@/types/chain";

export const supportedChainIds = {
  base: 8453,
  polygon: 137,
} as const;

export const chainsData: ChainsData = {
  [supportedChainIds.base]: {
    chainId: supportedChainIds.base,
    blockExplorerUrl: "https://basescan.org",
    logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/base.svg",
    rpcUrls: [
      `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
      `https://base-mainnet.blastapi.io/${process.env.NEXT_PUBLIC_BLASTAPI_KEY}`,
    ],
    name: "Base",
    zap: "0xFf2934Ce99CAd2E36140ab9D4b1A1f85E0D7FFc8",
    router: "0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6",
  },
  [supportedChainIds.polygon]: {
    chainId: supportedChainIds.polygon,
    blockExplorerUrl: "https://polygonscan.com",
    logo: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/arbitrum.svg",
    rpcUrls: [
      `https://polygon-mainnet.blastapi.io/${process.env.NEXT_PUBLIC_BLASTAPI_KEY}`,
      `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
    ],
    name: "Polygon",
    zap: "0x71E5E91C032354BbD9Dc29eEaCd5A3D2893b5f9F",
    router: "0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6",
  },
};
