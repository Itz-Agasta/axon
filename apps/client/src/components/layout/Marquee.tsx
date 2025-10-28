"use client";

import React from "react";
import MarqueeItem from "./MarqueeItem";

const Marquee = () => {
  const upperMarquee = [
    "/images/openAI.svg",
    "/images/claude.svg",
    "/images/gemini.svg",
    "/images/grok.svg",
    "/images/llama.svg",
    "/images/deepseek.svg",
  ];

  const lowerMarquee = [
    "/images/openAI.svg",
    "/images/claude.svg",
    "/images/gemini.svg",
    "/images/grok.svg",
    "/images/llama.svg",
    "/images/deepseek.svg",
  ];

  return (
    <div className=" bg-black">
      <MarqueeItem images={upperMarquee} from={"0"} to={"-100%"} />
      <MarqueeItem images={lowerMarquee} from={"-100%"} to={"0"} />
    </div>
  );
};

export default Marquee;
