import { BuildAddLiquidityProviderRequest } from "@/types/addLiquidity";
import { IProvider } from "@/types/iProvider";
import { ProviderPools } from "@/types/pools";
import { ProviderDetails } from "@/types/provider";
import {
  BuildRemoveLiquidityProviderRequest,
  RemoveLiquidityRequest,
} from "@/types/removeLiquidity";
import { HexString } from "@/types/string";
import { BuildTxnResponse } from "@/types/txn";
import { uniswapDetails } from "./config/details";
import { uniswapV3Pools } from "./config/pools";
import { getAddLiquidityData } from "./services/addLiquidity";
import { getbuildAddLiquidityData } from "./services/buildAddTxn";
import { getbuildRemoveLiquidityData } from "./services/buildRemoveTxn";
import {
  fetchUserPositions,
  findUserPositionsByPoolSymbol,
} from "./services/position";
import { getRemoveLiquidityData } from "./services/removeLiquidity";

export class UniswapProvider implements IProvider {
  details: ProviderDetails = uniswapDetails;
  pools: ProviderPools = uniswapV3Pools;
  getAddLiquidityDetails = ({
    account,
    pool,
    chainId,
  }: {
    account: HexString;
    pool: HexString;
    chainId: number;
  }) => {
    return getAddLiquidityData({ account, poolAddress: pool, chainId });
  };
  buildAddLiquidityTxn = (request: BuildAddLiquidityProviderRequest) => {
    return getbuildAddLiquidityData(request);
  };
  getPoolFromAddress = ({
    address,
    chainId,
  }: {
    address: HexString;
    chainId: number;
  }) => {
    const pool = uniswapV3Pools[chainId][address];
    if (!pool) {
      throw new Error("Pool not found");
    }
    return pool;
  };
  getUserPositions = ({
    account,
    chainId,
  }: {
    account: HexString;
    chainId: number;
  }) => {
    return fetchUserPositions({ address: account, chainId });
  };
  findPositionsByPoolSymbol = ({
    poolSymbol,
    chainId,
    account,
  }: {
    poolSymbol: string;
    chainId: number;
    account: HexString;
  }) => {
    return findUserPositionsByPoolSymbol({
      poolSymbol,
      chainId,
      account,
    });
  };
  removeLiquidity = ({
    pool,
    chainId,
    nftId,
    request,
  }: {
    pool: HexString;
    nftId: bigint;
    chainId: number;
    request: RemoveLiquidityRequest;
  }) => {
    return getRemoveLiquidityData({
      poolAddress: pool,
      chainId,
      nftId,
      request,
    });
  };

  buildRemoveLiquidityTxn = (
    request: BuildRemoveLiquidityProviderRequest
  ): Promise<BuildTxnResponse> => {
    return getbuildRemoveLiquidityData(request);
  };

  getPoolFromSymbol = ({
    symbol,
    chainId,
  }: {
    symbol: string;
    chainId: number;
  }) => {
    const poolAddress = Object.keys(uniswapV3Pools[chainId]).find((pool) => {
      const { token0, token1 } = uniswapV3Pools[chainId][pool as HexString];
      return `${token0.symbol}/${token1.symbol}` === symbol;
    }) as HexString | undefined;

    if (!poolAddress) {
      throw new Error("Pool not found");
    }

    const poolInfo = uniswapV3Pools[chainId][poolAddress as HexString];

    return {
      ...poolInfo,
      address: poolAddress,
    };
  };
  getAllPools = async (chainId: number) => {
    return this.pools[chainId] ? Object.values(this.pools[chainId]) : [];
  };
}
