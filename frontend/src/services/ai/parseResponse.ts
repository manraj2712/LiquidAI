import { contentType } from "@/constants/contentType";
import { AiResponse } from "@/types/aiResponse";
import { Message } from "@/types/message";
import { generateMessageId } from "@/utils/id";

const checkForKeyInMissingData = (key: string, missingData: string[]) => {
  return missingData
    .map((data) => data.toLowerCase())
    .includes(key.toLowerCase());
};

const generateMigrateLiquidityMessages = (
  response: AiResponse
): Message | null => {
  // 'srcPoolAddress', 'destPoolAddress', 'srcProvider', 'destProvider', 'chainId'
  if (
    response.missing_data &&
    (checkForKeyInMissingData("srcPoolAddress", response.missing_data) ||
      checkForKeyInMissingData("destPoolAddress", response.missing_data) ||
      checkForKeyInMissingData("srcProvider", response.missing_data) ||
      checkForKeyInMissingData("destProvider", response.missing_data))
  ) {
    return {
      content: null,
      contentType: contentType.chooseMigrationPath,
      from: "bot",
      id: generateMessageId(),
    };
  }

  if (response.payload) {
    if (
      response.API.toLowerCase().includes(
        "/" + contentType.migrateLiquidity.toLowerCase()
      )
    ) {
      return {
        contentType: contentType.migrateLiquidity,
        content: response.payload,
        from: "bot",
        id: generateMessageId(),
      };
    }
  }

  return null;
};

export const parseAiResponse = (
  response: AiResponse,
  chainId: number
): Message => {
  if (response.missing_data && response.missing_data.length) {
    if (
      checkForKeyInMissingData("poolAddress", response.missing_data) &&
      response.API.toLowerCase() ===
        "/" + contentType.addLiquidity.toLowerCase()
    ) {
      return {
        content: "Please tell the pool you want ",
        contentType: contentType.poolSelector,
        from: "bot",
        id: generateMessageId(),
      };
    } else if (
      checkForKeyInMissingData("poolAddress", response.missing_data) &&
      response.API.toLowerCase() ===
        "/" + contentType.removeLiquidity.toLowerCase()
    ) {
      return {
        content: "Please tell the pool you want to remove liquidity from",
        contentType: contentType.positionSelector,
        from: "bot",
        id: generateMessageId(),
      };
    } else if (checkForKeyInMissingData("provider", response.missing_data)) {
      return {
        content: "Please tell me the provider",
        contentType: contentType.text,
        from: "bot",
        id: generateMessageId(),
      };
    } else if (checkForKeyInMissingData("zapInToken", response.missing_data)) {
      return {
        contentType: contentType.portfolioSelector,
        from: "bot",
        id: generateMessageId(),
        content: {
          chainId,
        },
      };
    } else if (checkForKeyInMissingData("zapInAmount", response.missing_data)) {
      return {
        content: "Please enter the amount you want to add",
        contentType: contentType.text,
        from: "bot",
        id: generateMessageId(),
      };
    } else if (generateMigrateLiquidityMessages(response)) {
      return generateMigrateLiquidityMessages(response) as Message;
    } else if (
      checkForKeyInMissingData("zapOutToken", response.missing_data) &&
      (response.API.toLowerCase() ===
        "/" + contentType.removeLiquidity.toLowerCase() ||
        response.API.toLowerCase() ===
          "/" + contentType.migrateLiquidity.toLowerCase())
    ) {
      return {
        content: "Please tell the pool you want to migrate liquidity from",
        contentType: contentType.portfolioSelector,
        from: "bot",
        id: generateMessageId(),
      };
    }
  } else if (response.payload) {
    if (
      response.API.toLowerCase() ===
      "/" + contentType.addLiquidity.toLowerCase()
    ) {
      return {
        contentType: contentType.addLiquidity,
        content: response.payload,
        from: "bot",
        id: generateMessageId(),
      };
    } else if (
      response.API.toLowerCase() ===
      "/" + contentType.removeLiquidity.toLowerCase()
    ) {
      return {
        contentType: contentType.removeLiquidity,
        content: response.payload,
        from: "bot",
        id: generateMessageId(),
      };
    } else if (
      response.API.toLowerCase().includes(
        "/" + contentType.migrateLiquidity.toLowerCase()
      )
    ) {
      return {
        contentType: contentType.migrateLiquidity,
        content: response.payload,
        from: "bot",
        id: generateMessageId(),
      };
    }
  }
  return {
    content: response.description ?? "I am not sure how to respond to that",
    contentType: contentType.text,
    from: "bot",
    id: generateMessageId(),
  };
};
