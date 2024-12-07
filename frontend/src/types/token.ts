import { HexString } from "./string";

export type TokenInfo = {
  contract: string;
  name: string;
  chainId: number;
  symbol: string;
  balance?: string;
  logo: string;
  decimals: number;
  price: string | null;
  balanceInUsd?: string;
};

export type TokenReponse = Record<HexString, TokenInfo>;
