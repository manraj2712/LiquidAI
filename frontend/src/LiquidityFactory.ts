import { AerodromeProvider } from "./providers/aerodrome";
import { aerodromeDetails } from "./providers/aerodrome/config/details";
import { UniswapProvider } from "./providers/uniswap";
import { uniswapDetails } from "./providers/uniswap/config/details";
import { generateAddV3LiquidityData } from "./services/addLiquidity/v3";
import { fetchUserPositions } from "./services/getUserLiquidity";
import { generateMigrateV3LiquidityData } from "./services/migrateLiquidity/v3";
import { generateRemoveV3LiquidityData } from "./services/removeLiquidity/v3";
import { getTokensDetails } from "./services/tokens/details";
import { AddLiquidityRequest } from "./types/addLiquidity";
import { MigrateLiquidityRequest } from "./types/migrateLiquidity";
import { PoolDetails } from "./types/pools";
import { UserPositionDetails } from "./types/position";
import { RemoveLiquidityRequest } from "./types/removeLiquidity";
import { HexString } from "./types/string";

export class LiquidityFactory {
  private providers = {
    [uniswapDetails.id]: new UniswapProvider(),
    [aerodromeDetails.id]: new AerodromeProvider(),
  };
  public addLiquidity = async (request: AddLiquidityRequest) => {
    // const provider = Object.values(this.providers).find((provider) =>
    //   provider.getPoolFromSymbol({
    //     symbol: request.poolSymbol,
    //     chainId: request.chainId,
    //   })
    // );
    // if (!provider) {
    //   throw new Error("Provider not found");
    // }
    const provider = Object.values(this.providers).find(
      (provider) => provider.details.id === request.provider
    );
    if (!provider) {
      throw new Error("Provider not found");
    }
    const zapData = await generateAddV3LiquidityData({
      request,
      provider,
      isFinalStep: false,
    });

    return zapData;
  };

  public removeLiquidity = async (request: RemoveLiquidityRequest) => {
    const provider = Object.values(this.providers).find(
      (provider) => provider.details.id === request.provider
    );
    if (!provider) {
      throw new Error("Provider not found");
    }

    const zapData = await generateRemoveV3LiquidityData({
      request,
      provider,
      isFinalStep: true,
    });

    return zapData;
  };

  public migrateLiquidity = async (request: MigrateLiquidityRequest) => {
    const srcProvider = this.providers[request.srcProvider];
    const destProvider = this.providers[request.destProvider];
    const zapData = await generateMigrateV3LiquidityData({
      request,
      srcProvider,
      destProvider,
    });
    return zapData;
  };

  public getUserPositions = async (request: {
    chainId: number;
    account: HexString;
  }): Promise<UserPositionDetails[]> => {
    return await fetchUserPositions({
      chainId: request.chainId,
      account: request.account,
      providers: this.providers,
    });
  };

  public getAllPools = async (chainId: number): Promise<PoolDetails[]> => {
    const response = await Promise.all(
      Object.values(this.providers).map((provider) =>
        provider.getAllPools(chainId)
      )
    );

    const pools = response.flat();

    const uniqueTokens: Set<HexString> = new Set();

    pools.forEach((pool) => {
      uniqueTokens.add(pool.token0.address);
      uniqueTokens.add(pool.token1.address);
    });
    const tokensDetails = await getTokensDetails(
      Array.from(uniqueTokens),
      chainId
    );

    const data: PoolDetails[] = pools.map((pool) => {
      const token0 = tokensDetails[pool.token0.address];
      const token1 = tokensDetails[pool.token1.address];
      return {
        fee: pool.fee,
        token0: { ...pool.token0, logo: token0.logo },
        token1: { ...pool.token1, logo: token1.logo },
        provider: pool.provider,
        poolAddress: pool.address,
      };
    });
    return data;
  };
}
