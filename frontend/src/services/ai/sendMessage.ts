import { contentType } from "@/constants/contentType";
import { callApi } from "@/helpers/axios";
import { Message } from "@/types/message";
import { generateMessageId } from "@/utils/id";

export const getResponseForInput = async ({
  chatId,
  message,
  chainId,
  addMessage,
  removeMessage,
}: {
  chatId: string;
  message: string;
  chainId: number;
  addMessage: (message: Message) => void;
  removeMessage: (messageId: string) => void;
}): Promise<Message> => {
  const messageId = generateMessageId();
  try {
    addMessage({
      id: messageId,
      content: message,
      contentType: contentType.aiThinking,
      from: "bot",
    });
    const response = await callApi({
      url: "/api/chat",
      options: {
        method: "POST",
        data: {
          chatId,
          message,
          chainId,
        },
      },
    });
    return response as Message;
  } catch (error) {
    console.error("Error while fetching response for input", error);
    return {
      id: generateMessageId(),
      content: "I am unable to process your request right now",
      contentType: contentType.text,
      from: "bot",
    };
  } finally {
    removeMessage(messageId);
  }
};
