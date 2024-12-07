import { HexString } from "./string";

export type Chain = {
  chainId: number;
  name: string;
  logo: string;
  blockExplorerUrl: string;
  rpcUrls: string[];
  zap: HexString;
  router: HexString;
};

export type ChainsData = {
  [key: number]: Chain;
};
