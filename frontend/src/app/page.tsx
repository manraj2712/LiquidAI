"use client";
import ChatMessagesScreen from "@/components/ChatMessages";
import Header from "@/components/Header";
import Intro from "@/components/Intro";
import Prompt from "@/components/Prompt";
import "@rainbow-me/rainbowkit/styles.css";
import Image from "next/image";
import { useAppContext } from "./context/AppContext";

export default function Home() {
  const { messages } = useAppContext();

  return (
    <>
      <div className=" bg-gray-30 h-screen">
        <Header />
        <div className="bg-gray-30 overflow-hidden">
          <Image
            alt="bg-vector"
            width={1600}
            src="/bg-vector.svg"
            layout="intrinsic"
            height={500}
            className="absolute bottom-0 left-0 right-0 z-0 w-full"
          />
          <Image
            alt="ellipsis-left"
            src="/ellipsis-left.svg"
            layout="intrinsic"
            width={300}
            height={500}
            className="absolute left-0 top-60 z-1"
          />
          <Image
            alt="ellipsis-right"
            src="/ellipsis-right.svg"
            layout="intrinsic"
            width={300}
            height={500}
            className="absolute right-0 top-0 z-1"
          />
          {!messages.length && <Intro />}
          {messages.length > 0 && <ChatMessagesScreen />}
          <Prompt />
        </div>
      </div>
    </>
  );
}
