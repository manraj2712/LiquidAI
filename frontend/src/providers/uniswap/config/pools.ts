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
  [supportedChainIds.polygon]: {
    "0x4018d9514a5da6ba6373e0d47B4BD72934B3b92E": {
      tickSpacing: 10,
      fee: 500,
      provider: uniswapDetails.id,
      address: "0x4018d9514a5da6ba6373e0d47B4BD72934B3b92E",
      token0: {
        decimals: 18,
        address: "0x11CD37bb86F65419713f30673A480EA33c826872",
        symbol: "WETH",
      },
      token1: {
        decimals: 6,
        address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        symbol: "USDC",
      },
    },

    "0x3F6CFB3e592F218F426F3457828779349FEa6389": {
      provider: uniswapDetails.id,
      fee: 100,
      tickSpacing: 3,
      address: "0x3F6CFB3e592F218F426F3457828779349FEa6389",
      token0: {
        decimals: 8,
        address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
        symbol: "WBTC",
      },
      token1: {
        decimals: 6,
        address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        symbol: "USDC",
      },
    },
    "0x31083a78E11B18e450fd139F9ABEa98CD53181B7": {
      provider: uniswapDetails.id,
      fee: 100,
      tickSpacing: 1,
      address: "0x31083a78E11B18e450fd139F9ABEa98CD53181B7",
      token0: {
        decimals: 6,
        address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        symbol: "USDC",
      },
      token1: {
        decimals: 6,
        address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        symbol: "USDT",
      },
    }
  },
};
