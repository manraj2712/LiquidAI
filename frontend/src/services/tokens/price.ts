import { HexString } from "@/types/string";
import { callApi } from "../../helpers/axios";

export const getTokensPrices = async (
  tokens: HexString[],
  chainId: number
): Promise<Record<HexString, string>> => {
  let url = `https://staging.dzap.io/v1/token/price?chainId=${chainId}`;
  tokens.forEach((token) => {
    url += `&tokenAddresses=${token}`;
  });
  const prices = await callApi({
    url,
    options: {
      method: "GET",
    },
  });
  return prices.data;
};
