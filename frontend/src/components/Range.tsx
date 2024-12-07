"use client";
import { useState, useRef, useEffect } from "react";
type Range = "narrow" | "wide" | "infinite";
export default function RangeSelector() {
  const [selectedRange, setSelectedRange] = useState<Range>("infinite");
  const [pillStyle, setPillStyle] = useState({});
  const [clickedRange, setClickedRange] = useState<Range | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const ranges: Range[] = ["narrow", "wide", "infinite"];
  useEffect(() => {
    const activeButton = buttonRefs.current[ranges.indexOf(selectedRange)];
    if (activeButton) {
      setPillStyle({
        width: `${activeButton.offsetWidth}px`,
        height: `${activeButton.offsetHeight}px`,
        left: `${activeButton.offsetLeft}px`,
        top: 8,
        transition: "all 0.3s ease-in-out",
      });
    }
  }, [selectedRange]);
  const handleButtonClick = (range: Range) => {
    setClickedRange(range);
    setSelectedRange(range);
    setTimeout(() => {
      setClickedRange(null);
    }, 300);
  };
  return (
    <div className="flex items-start justify-center flex-col">
      <h2 className="text-lg font-medium text-white mb-4 text-left bg-gray-40 px-4 py-2 rounded-md">
        Select the range:
      </h2>
      <div className="relative flex gap-2 bg-gray-40 rounded-lg p-2">
        <div
          className="absolute range-button-active rounded-lg"
          style={pillStyle}
        />
        {ranges.map((range, index) => (
          <button
            key={range}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            onClick={() => handleButtonClick(range)}
            className={`
              relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform
              ${selectedRange === range ? "text-white" : "text-gray-400"}
              m-0
              ${clickedRange === range ? "scale-110" : ""}
              border-gray-700 border-thin
            `}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
