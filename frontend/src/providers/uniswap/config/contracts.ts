import { supportedChainIds } from "@/config/chain";
import { HexString } from "@/types/string";

export const uniswapContracts: {
  [chainId: number]: {
    nftManager: HexString;
  };
} = {
  [supportedChainIds.base]: {
    nftManager: "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1",
  },
};
