import { BuildAddLiquidityProviderRequest } from "@/types/addLiquidity";
import { IProvider } from "@/types/iProvider";
import { ProviderPools } from "@/types/pools";
import { ProviderDetails } from "@/types/provider";
import { BuildRemoveLiquidityProviderRequest } from "@/types/removeLiquidity";
import { HexString } from "@/types/string";
import { BuildTxnResponse } from "@/types/txn";
import { aerodromeDetails } from "./config/details";
import { aerodromePools } from "./config/pools";
import { getAddLiquidityData } from "./services/addLiquidity";
import { getbuildAddLiquidityData } from "./services/buildAddTxn";
import { getbuildRemoveLiquidityData } from "./services/buildRemoveTxn";
import {
  fetchUserPositions,
  findUserPositionsByPoolSymbol,
} from "./services/position";
import { getRemoveLiquidityData } from "./services/removeLiquidity";

export class AerodromeProvider implements IProvider {
  details: ProviderDetails = aerodromeDetails;
  pools: ProviderPools = aerodromePools;
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
  getUserPositions = ({
    account,
    chainId,
  }: {
    account: HexString;
    chainId: number;
  }) => {
    return fetchUserPositions({ address: account, chainId });
  };
  removeLiquidity = ({
    pool,
    chainId,
    nftId,
  }: {
    pool: HexString;
    nftId: bigint;
    chainId: number;
  }) => {
    return getRemoveLiquidityData({ poolAddress: pool, chainId, nftId });
  };
  getPoolFromAddress = ({
    address,
    chainId,
  }: {
    address: HexString;
    chainId: number;
  }) => {
    const pool = aerodromePools[chainId][address];
    if (!pool) {
      throw new Error("Pool not found");
    }
    return pool;
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
    const poolAddress = Object.keys(aerodromePools[chainId]).find((pool) => {
      const { token0, token1 } = aerodromePools[chainId][pool as HexString];
      return `${token0.symbol}/${token1.symbol}` === symbol;
    }) as HexString | undefined;

    if (!poolAddress) {
      throw new Error("Pool not found");
    }

    const poolInfo = aerodromePools[chainId][poolAddress];

    return {
      ...poolInfo,
      address: poolAddress,
    };
  };

  getAllPools = async (chainId: number) => {
    return aerodromePools[chainId]
      ? Object.values(aerodromePools[chainId])
      : [];
  };
}
