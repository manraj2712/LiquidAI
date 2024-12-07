import { contentType } from "@/constants/contentType";
import { AddLiquidityRequest } from "./addLiquidity";

export type ContentType = (typeof contentType)[keyof typeof contentType];

export type Message = {
  id: string;
  from: "user" | "bot";
  contentType: ContentType;
  content:
    | TextContent
    | AddLiquidityRequest
    | RemoveLiquidityContent
    | MigrateLiquidityContent
    | PortfolioSelectorContent
    | RangeSelectorContent
    | ConnectWalletContent
    | TransactionDetailsContent
    | null;
};

export type TextContent = string;

export type RemoveLiquidityContent = {
  tokenA: string;
  tokenB: string;
  liquidity: string;
};

export type MigrateLiquidityContent = {
  tokenA: string;
  tokenB: string;
  liquidity: string;
  nftId: string;
};

export type PortfolioSelectorContent = {
  chainId: number;
};

export type RangeSelectorContent = {
  ranges: string[];
};

export type ConnectWalletContent = {
  chainId: number;
};

export type TransactionDetailsContent = {
  hash: string;
};
