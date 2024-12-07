import { supportedChainIds } from "@/config/chain";
import { ProviderPools } from "@/types/pools";
import { uniswapDetails } from "./details";

export const uniswapV3Pools: ProviderPools = {
  [supportedChainIds.base]: {
    "0xd0b53D9277642d899DF5C87A3966A349A798F224": {
      address: "0xd0b53D9277642d899DF5C87A3966A349A798F224",
      token0: {
        symbol: "WETH",
        address: "0x4200000000000000000000000000000000000006",
        decimals: 18,
      },
      token1: {
        symbol: "USDC",
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        decimals: 6,
      },
      tickSpacing: 10,
      fee: 500,
      provider: uniswapDetails.id,
    },
    "0xfBB6Eed8e7aa03B138556eeDaF5D271A5E1e43ef": {
      address: "0xfBB6Eed8e7aa03B138556eeDaF5D271A5E1e43ef",
      token0: {
        symbol: "USDC",
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        decimals: 6,
      },
      token1: {
        symbol: "cbBTC",
        address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
        decimals: 8,
      },
      tickSpacing: 10,
      fee: 500,
      provider: uniswapDetails.id,
    },
  },
};
