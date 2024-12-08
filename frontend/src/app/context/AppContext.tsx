"use client";
import { supportedChainIds } from "@/config/chain";
import { getResponseForInput } from "@/services/ai/sendMessage";
import { Message } from "@/types/message";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";

interface AppContextType {
  input: string;
  setInput: (input: string) => void;
  chatId: string;
  createNewChat: () => void;
  messages: Message[];
  addMessage: (message: Message) => void;
  removeMessage: (messageId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [input, setInput] = useState<string>("");

  const [chatId, setChatId] = useState<string>("");

  const { chainId } = useAccount();

  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const removeMessage = (messageId: string) => {
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message.id !== messageId)
    );
  };

  const createNewChatId = () => {
    const newChatId = `user-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    console.log("newChatId", newChatId);
    setChatId(newChatId);
    setMessages([]);
    return newChatId;
  };

  useEffect(() => {
    const newChatId = createNewChatId();
    if (
      chainId && [
        (Object.values(supportedChainIds) as number[]).includes(chainId),
      ]
    ) {
      getResponseForInput({
        chainId,
        chatId: newChatId,
        message: `set the default chain id for this chat as ${chainId}`,
        addMessage,
        removeMessage,
        showLoader: false,
      });
    }
  }, [chainId]);

  return (
    <AppContext.Provider
      value={{
        input,
        setInput,
        chatId,
        createNewChat: createNewChatId,
        messages,
        addMessage,
        removeMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
