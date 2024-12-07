"use client";
import { useAppContext } from "@/app/context/AppContext";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { contentType } from "@/constants/contentType";
import { getResponseForInput } from "@/services/ai/sendMessage";
import { generateMessageId } from "@/utils/id";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "./ui/button";

const Prompt = () => {
  const { input, setInput, createNewChat, addMessage, chatId } =
    useAppContext();
  const [newInput, setNewInput] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewInput(e.target.value);
  };

  const handleSubmit = async () => {
    setInput(newInput.toLowerCase().trim());
    setNewInput("");
    addMessage({
      id: generateMessageId(),
      content: newInput,
      contentType: contentType.text,
      from: "user",
    });
    const newMessage = await getResponseForInput({ chatId, message: newInput });
    addMessage(newMessage);
  };

  const handleNewChat = () => {
    setInput("");
    createNewChat();
  };
  const prompts = [
    { value: "addLiquidity", label: "Add Liquidity" },
    { value: "removeLiquidity", label: "Remove Liquidity" },
    { value: "migrateLiquidity", label: "Migrate Liquidity" },
  ];
  return (
    <>
      <div className="w-full flex items-center justify-center absolute bottom-0">
        <div className="flex items-center bg-gray-30 px-4 py-2 border-thin border-gray-600  w-4/5 mb-6 mt-2 rounded-full">
          <div className="relative flex-1">
            <div className="flex items-center gap-1">
              <Button
                className={`${
                  input.trim() === ""
                    ? "bg-gray-500 cursor-not-allowed"
                    : "range-button-active"
                }  p-2 rounded-full w-6 h-6 transition-all`}
                onClick={input.trim() === "" ? undefined : handleNewChat}
                disabled={input.trim() === ""}
              >
                <Image src="/add.svg" alt="add-icon" width={15} height={15} />
              </Button>

              <input
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                type="text"
                value={newInput}
                onChange={handleInputChange}
                placeholder="Ask Liquid..."
                className="w-full p-3 rounded-md bg-gray-30 text-white placeholder-gray-400 focus:outline-none transition-all z-20"
              />
            </div>
          </div>
          <div className="relative z-10 bg-gray-60 rounded-lg">
            <Select>
              <SelectTrigger className="w-full  text-white border-none rounded-md py-2 pl-10 pr-3 flex items-center hover:border-[#4A5568] transition-all">
                <Image
                  src="/select-icon.svg"
                  alt="select-icon"
                  width={20}
                  height={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                />
                <SelectValue
                  placeholder="Browse Prompts"
                  className="text-gray-300"
                />
              </SelectTrigger>

              <SelectContent className="bg-[#030A06] text-white rounded-lg shadow-lg mt-1 border-thin border-gray-20">
                <SelectGroup>
                  {prompts.map((prompt) => (
                    <SelectItem
                      key={prompt.value}
                      value={prompt.value}
                      className="px-4 py-2  hover:text-white focus:bg-gray-10 focus:text-white transition-all"
                    >
                      {prompt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={newInput.trim() === "" ? undefined : handleSubmit}
            disabled={newInput.trim() === ""}
            className={`ml-2 p-2 rounded-full text-white transition-all ${
              newInput.trim() === ""
                ? "bg-gray-10 cursor-not-allowed"
                : "range-button-active"
            }`}
          >
            <Image src="/sendIcon.svg" alt="send-icon" width={20} height={20} />
          </Button>
        </div>
      </div>
    </>
  );
};

export default Prompt;
