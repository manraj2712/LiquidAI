import { UserPositionDetails, ProviderPositionDetails } from "@/types/position";
import { HexString } from "@/types/string";
import { getTokensDetails } from "../tokens/details";
import { IProvider } from "@/types/iProvider";
import { V3PoolUtils } from "@/utils/v3Pools";
import { formatUnits } from "viem";

export const fetchUserPositions = async (request: {
  chainId: number;
  account: HexString;
  providers: Record<string, IProvider>;
}): Promise<UserPositionDetails[]> => {
  const tokens: { [key: string]: string } = {};
  const providerLiquidity: (ProviderPositionDetails & {
    provider: string;
  })[] = [];
  const { providers } = request;
  await Promise.all(
    Object.values(providers).map(async (provider) => {
      const providerLiquidities = await provider.getUserPositions(request);
      return providerLiquidities.map((liquidity) => {
        tokens[liquidity.token0] = liquidity.token0;
        tokens[liquidity.token1] = liquidity.token1;
        providerLiquidity.push({
          ...liquidity,
          provider: provider.details.id,
        });
      });
    })
  );

  if (providerLiquidity.length === 0) {
    return [];
  }

  const tokenDetails = await getTokensDetails(
    Object.keys(tokens) as HexString[],
    request.chainId
  );

  const userPositionDetails: UserPositionDetails[] = providerLiquidity.map(
    (liquidity) => {
      const token0 = tokenDetails[liquidity.token0];
      const token1 = tokenDetails[liquidity.token1];
      const { amount0InWei, amount1InWei } =
        V3PoolUtils.getTokenAmountsForLiquidity({
          liquidity: liquidity.liquidity,
          currentTick: liquidity.currentTick,
          lowerTick: liquidity.lowerTick,
          sqrtPriceX96: liquidity.sqrtPriceX96,
          upperTick: liquidity.upperTick,
        });
      const amount0Usd =
        +formatUnits(BigInt(amount0InWei), token0.decimals) *
        +(token0.price ?? "0");
      const amount1Usd =
        +formatUnits(BigInt(amount1InWei), token1.decimals) *
        +(token1.price ?? "0");
      return {
        token0: {
          address: token0.contract as HexString,
          amount: amount0InWei,
          amountUsd: amount0Usd,
          decimals: token0.decimals,
          symbol: token0.symbol,
          logo: token0.logo,
        },
        token1: {
          address: token1.contract as HexString,
          amount: amount1InWei,
          amountUsd: amount1Usd,
          decimals: token1.decimals,
          symbol: token1.symbol,
          logo: token1.logo,
        },
        provider: liquidity.provider,
        inRange:
          liquidity.currentTick >= liquidity.lowerTick &&
          liquidity.currentTick <= liquidity.upperTick,
        poolSymbol: `${token0.symbol}/${token1.symbol}`,
        nftId: liquidity.nftId.toString(),
        poolAddress: liquidity.poolAddress,
      };
    }
  );
  return userPositionDetails;
};
