import { SwapRequest, SwapResponse } from "../../types/swap";
import { callApi } from "../../helpers/axios";

export const buildSwapTxn = async (
  request: SwapRequest
): Promise<SwapResponse | null> => {
  const { chainId, recipient, refundee, sender, data } = request;
  try {
    const response = await callApi({
      logCurl: true,
      url: "https://staging.dzap.io/v1/swap/buildTx/best-return",
      options: {
        method: "POST",
        data: {
          chainId,
          recipient,
          includeSwapCallData: true,
          disableEstimation: true,
          includeTxData: true,
          withOutRevert: false,
          integratorId: "dzap",
          allowedSources: ["uniswap", "sushiswap"],
          refundee,
          sender,
          data,
        },
      },
    });

    return {
      swapData: response.data.swapData,
      transactionRequest: response.data.transactionRequest,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};
