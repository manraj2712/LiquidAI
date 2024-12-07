import { supportedChainIds } from "@/config/chain";
import { ProviderPools } from "@/types/pools";
import { aerodromeDetails } from "./details";

export const aerodromePools: ProviderPools = {
  [supportedChainIds.base]: {
    "0xb2cc224c1c9feE385f8ad6a55b4d94E92359DC59": {
      address: "0xb2cc224c1c9feE385f8ad6a55b4d94E92359DC59",
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
      tickSpacing: 100,
      fee: 400,
      farm: "0xF33a96b5932D9E9B9A0eDA447AbD8C9d48d2e0c8",
      provider: aerodromeDetails.id,
    },
    "0x4e962BB3889Bf030368F56810A9c96B83CB3E778": {
      address: "0x4e962BB3889Bf030368F56810A9c96B83CB3E778",
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
      tickSpacing: 100,
      fee: 500,
      farm: "0x6399ed6725cC163D019aA64FF55b22149D7179A8 ",
      provider: aerodromeDetails.id,
    },
  },
};
