import { HexString } from "@/types/string";
import { callApi } from "../../helpers/axios";
import { TokenInfo } from "@/types/token";

export const getTokensDetails = async (
  tokens: HexString[],
  chainId: number
): Promise<Record<HexString, TokenInfo>> => {
  const url = `https://staging.dzap.io/v1/token/details?chainId=${chainId}&tokenAddresses=${tokens}&includePrice=true`;
  const details = await callApi({
    url,
    options: {
      method: "GET",
    },
    logCurl: true,
  });
  return details;
};
