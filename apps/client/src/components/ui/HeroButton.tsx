"use client";
import React from "react";
import { HoverBorderGradient } from "./hover-border-gradient";
import Image from "next/image";
import context0 from "../../../public/icons/context0_logo_cropped.jpeg";

export function HeroButton({ onClick }: { onClick?: () => void }) {
  return (
    <div className="my-12 sm:my-16 md:my-20 flex justify-center text-center px-4">
      <HoverBorderGradient
        containerClassName="rounded-full"
        as="button"
        className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 cursor-pointer px-4 sm:px-6 py-3 sm:py-4"
        onClick={onClick}
      >
        <Image
          src={context0.src}
          alt="context0 Logo"
          width={32}
          height={32}
          className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full"
        />
        <span className="text-xs sm:text-sm md:text-base font-[semiBold]">
          Get Started Today
        </span>
      </HoverBorderGradient>
    </div>
  );
}
