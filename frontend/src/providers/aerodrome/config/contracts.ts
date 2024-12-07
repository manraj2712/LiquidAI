import { supportedChainIds } from "@/config/chain";
import { HexString } from "@/types/string";

export const aerodromeAddresses: Record<
  number,
  {
    v3PoolFactory: HexString;
    router: HexString;
    voter: HexString;
    nftManager: HexString;
    rewards: HexString;
    sugar: HexString;
    sickleFactory: HexString;
  }
> = {
  [supportedChainIds.base]: {
    router: "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43",
    v3PoolFactory: "0x5e7BB104d84c7CB9B682AaC2F3d509f5F406809A",
    voter: "0x16613524e02ad97eDfeF371bC883F2F5d6C480A5",
    nftManager: "0x827922686190790b37229fd06084350E74485b72",
    rewards: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
    sugar: "0xcDF4AA33Bafba3e5dc5B3ae54ab67324Ef956ABD",
    sickleFactory: "0x71D234A3e1dfC161cc1d081E6496e76627baAc31",
  },
};
