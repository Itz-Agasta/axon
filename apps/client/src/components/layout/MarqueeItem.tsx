"use client";

import React from "react";
import { motion } from "motion/react";

interface MarqueeItemProps {
  images: string[];
  from: string;
  to: string;
}

const MarqueeItem = ({ images, from, to }: MarqueeItemProps) => {
  return (
    <div className="flex MyGradient bg-black">
      <motion.div
        initial={{ x: `${from}` }}
        animate={{ x: `${to}` }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="flex flex-shrink-0"
      >
        {images.map((image: string, index: number) => {
          return (
            <img
              className="h-24 w-32 sm:h-32 sm:w-40 md:h-36 md:w-48 lg:h-40 lg:w-56 pr-8 sm:pr-12 md:pr-16 lg:pr-20"
              src={image}
              key={index}
              alt={`Logo ${index}`}
            />
          );
        })}
      </motion.div>

      <motion.div
        initial={{ x: `${from}` }}
        animate={{ x: `${to}` }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="flex flex-shrink-0"
      >
        {images.map((image: string, index: number) => {
          return (
            <img
              className="h-24 w-32 sm:h-32 sm:w-40 md:h-36 md:w-48 lg:h-40 lg:w-56 pr-8 sm:pr-12 md:pr-16 lg:pr-20"
              src={image}
              key={index}
              alt={`Logo ${index}`}
            />
          );
        })}
      </motion.div>
    </div>
  );
};

export default MarqueeItem;
