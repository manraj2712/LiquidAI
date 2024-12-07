import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useAppContext } from "@/app/context/AppContext";
import { generateMessageId } from "@/utils/id";
import { contentType } from "@/constants/contentType";
import { getResponseForInput } from "@/services/ai/sendMessage";

const Intro = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { setInput, addMessage, chatId } = useAppContext();

  const handleSubmit = async (value: string) => {
    const formattedInput = value.toLowerCase().trim();
    setInput(formattedInput);

    addMessage({
      id: generateMessageId(),
      content: formattedInput,
      contentType: contentType.text,
      from: "user",
    });

    const newMessage = await getResponseForInput({
      chatId,
      message: formattedInput,
    });
    addMessage(newMessage);
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`absolute top-1/3 left-96 transform -translate-x-1/2 -translate-y-1/3 z-20 text-center w-full max-w-2xl sm:max-w-3xl ${
        isVisible ? "animate-slideDown" : "opacity-0"
      }`}
    >
      <h2 className="gradient-text text-6xl mb-6">Welcome to Liquid.ai</h2>
      <p className="text-white text-xl mb-6">
        Simply enter your input and let Liquid.ai work its magic! If you&apos;re
        not sure where to start, take a look at the Prompt Library for
        inspiration.
      </p>

      <div>
        <p className="text-white mb-4 text-left">Example:</p>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-4 w-full justify-center">
            <Button
              className="bg-gray-10 py-3 px-5 rounded-lg text-[#FDFDFD] w-1/2 text-center"
              onClick={() => handleSubmit("add liquidity")}
            >
              Add Liquidity
            </Button>
            <Button
              className="bg-gray-10 py-3 px-5 rounded-lg text-[#FDFDFD] w-1/2 text-center"
              onClick={() => handleSubmit("remove liquidity")}
            >
              Remove Liquidity
            </Button>
          </div>
          <Button
            className="bg-gray-10 py-3 px-5 rounded-lg text-[#FDFDFD] w-full text-center"
            onClick={() => handleSubmit("migrate liquidity")}
          >
            Migrate Liquidity
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Intro;
