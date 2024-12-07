import { useAppContext } from "@/app/context/AppContext";
import { contentType } from "@/constants/contentType";
import { Message, TextContent } from "@/types/message";
import Image from "next/image";
import { useEffect, useRef } from "react";
import AddTransactionDetails from "./AddTransactionDetails";
import Migrate from "./MigrateLiquidity";
import MigrateTransactionDetails from "./MigrateTransactionDetails";
import PoolSelector from "./PoolSelector";
import PortfolioSelector from "./PortfolioSelector";
import { PositionSelector } from "./PositionSelector";
import RangeSelector from "./Range";
import RemoveTransactionDetails from "./RemoveTransactionDetails";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export const TextMessage = ({ message }: { message: string }) => (
  <p className="text-white bg-gray-40 px-4 py-2 rounded-lg border-thin border-gray-20">
    {message}
  </p>
);

const userMessage = (message: string) => {
  return (
    <div className="flex gap-4 items-center">
      <TextMessage message={message} />
      <Image src="/avatar.svg" alt="avatar.svg" width={30} height={30} />
    </div>
  );
};

const BotMessageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-4 w-full max-w-2xl">
    <Image src="/logo-black.svg" alt="logo-black" width={50} height={50} />
    {children}
  </div>
);

const botMessage = (message: Message) => {
  const contentMapping: Record<string, React.ReactNode> = {
    [contentType.portfolioSelector]: (
      <PortfolioSelector
        isZapIn={message.content === contentType.addLiquidity ? true : false}
      />
    ),
    [contentType.rangeSelector]: <RangeSelector />,
    [contentType.addLiquidity]: <AddTransactionDetails message={message} />,
    [contentType.removeLiquidity]: (
      <RemoveTransactionDetails message={message} />
    ),
    [contentType.migrateLiquidity]: (
      <MigrateTransactionDetails message={message} />
    ),
    [contentType.aiThinking]: (
      <div className="h-16 w-32">
        <DotLottieReact
          src="https://lottie.host/bf8353e4-3803-4601-8e10-7e10c051e9c3/LyigAWtdQz.lottie"
          loop
          autoplay
        />
      </div>
    ),
    [contentType.poolSelector]: <PoolSelector />,
    [contentType.chooseMigrationPath]: <Migrate />,
    [contentType.positionSelector]: <PositionSelector />,
    [contentType.text]: <TextMessage message={message.content as string} />,
    [contentType.dos]: (
      <TextMessage message="I am currently unable to process this request" />
    ),
  };

  const content = contentMapping[message.contentType] || (
    <p>Unable to perform the action currently</p>
  );

  return <BotMessageWrapper>{content}</BotMessageWrapper>;
};

const ChatMessagesScreen = () => {
  const { messages } = useAppContext();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className="flex flex-col gap-12 overflow-y-scroll h-custom z-8 w-full px-28 py-12 relative"
      ref={scrollRef}
    >
      {messages.map((message) => {
        return (
          <div
            key={message.id}
            className={`flex gap-4 ${
              message.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.from === "user"
              ? userMessage(message.content as TextContent)
              : botMessage(message)}
          </div>
        );
      })}
    </div>
  );
};

export default ChatMessagesScreen;
