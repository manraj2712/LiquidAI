import {
  AddLiquidityProviderDetails,
  BuildAddLiquidityProviderRequest,
} from "./addLiquidity";
import { PoolInfo, ProviderPools } from "./pools";
import { ProviderPositionDetails } from "./position";
import { ProviderDetails } from "./provider";
import {
  BuildRemoveLiquidityProviderRequest,
  RemoveLiquidityProviderDetails,
  RemoveLiquidityRequest,
} from "./removeLiquidity";
import { HexString } from "./string";
import { BuildTxnResponse } from "./txn";

export abstract class IProvider {
  abstract details: ProviderDetails;
  abstract pools: ProviderPools;
  abstract findPositionsByPoolSymbol: ({
    poolSymbol,
    chainId,
    account,
  }: {
    poolSymbol: string;
    chainId: number;
    account: HexString;
  }) => Promise<bigint[]>;

  abstract getAddLiquidityDetails: ({
    account,
    pool,
    chainId,
  }: {
    account: HexString;
    pool: HexString;
    chainId: number;
  }) => Promise<AddLiquidityProviderDetails>;

  abstract buildAddLiquidityTxn: (
    request: BuildAddLiquidityProviderRequest
  ) => Promise<BuildTxnResponse>;

  abstract removeLiquidity: ({
    pool,
    chainId,
    nftId,
  }: {
    pool: HexString;
    nftId: bigint;
    chainId: number;
    request: RemoveLiquidityRequest;
  }) => Promise<RemoveLiquidityProviderDetails>;

  abstract buildRemoveLiquidityTxn: (
    request: BuildRemoveLiquidityProviderRequest
  ) => Promise<BuildTxnResponse>;

  abstract getPoolFromSymbol: ({
    symbol,
    chainId,
  }: {
    symbol: string;
    chainId: number;
  }) => {
    token0: {
      symbol: string;
      address: HexString;
      decimals: number;
    };
    token1: {
      symbol: string;
      address: HexString;
      decimals: number;
    };
    address: HexString;
  };

  abstract getPoolFromAddress: ({
    address,
    chainId,
  }: {
    address: HexString;
    chainId: number;
  }) => {
    token0: {
      symbol: string;
      address: HexString;
      decimals: number;
    };
    token1: {
      symbol: string;
      address: HexString;
      decimals: number;
    };
    address: HexString;
  };

  abstract getUserPositions: ({
    account,
    chainId,
  }: {
    account: HexString;
    chainId: number;
  }) => Promise<ProviderPositionDetails[]>;

  abstract getAllPools: (chainId: number) => Promise<PoolInfo[]>;
}
