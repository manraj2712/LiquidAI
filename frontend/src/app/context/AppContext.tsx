"use client";
import { Message } from "@/types/message";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AppContextType {
  input: string;
  setInput: (input: string) => void;
  chatId: string;
  createNewChat: () => void;
  messages: Message[];
  addMessage: (message: Message) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [input, setInput] = useState<string>("");

  const [chatId, setChatId] = useState<string>("");

  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const createNewChatId = () => {
    const newChatId = `user-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    console.log("newChatId", newChatId);
    setChatId(newChatId);
    setMessages([]);
  };

  useEffect(() => {
    createNewChatId();
  }, []);

  return (
    <AppContext.Provider
      value={{
        input,
        setInput,
        chatId,
        createNewChat: createNewChatId,
        messages,
        addMessage,
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
