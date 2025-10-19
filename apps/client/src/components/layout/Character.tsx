"use client";
import { useRef } from "react";
import { useScroll, motion, useTransform, MotionValue } from "motion/react";
import smile from "../../../public/emojis/smile.png";
import smirk_cat from "../../../public/emojis/smirk_cat.png";
import sunglasses from "../../../public/emojis/sunglasses.png";
import brain from "../../../public/emojis/brain.png";

interface ParagraphProps {
  value: string;
  style: string;
  highlightWords?: string[];
}

const emojiMap: Record<string, string> = {
  ":smile:": smile.src,
  ":smirk_cat:": smirk_cat.src,
  ":sunglasses:": sunglasses.src,
  ":brain:": brain.src,
};

export default function Paragraph({
  value,
  style,
  highlightWords = ["first", "universal", "agentic", "context"],
}: ParagraphProps) {
  const element = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: element,
    offset: ["start 0.6", "end 0.35"],
  });

  const tokens = value.split(/(\s+|:[a-zA-Z0-9_]+:)/g).filter(Boolean);

  return (
    <p
      className={`${style} flex flex-wrap justify-center relative`}
      ref={element}
    >
      {tokens.map((token, i) => {
        const isEmoji = token in emojiMap;
        const isHighlighted = highlightWords.includes(token);
        const start = i / tokens.length;
        const end = start + 1 / tokens.length;

        return isEmoji ? (
          <Emoji
            key={i}
            src={emojiMap[token]}
            alt={token}
            range={[start, end]}
            progress={scrollYProgress}
          />
        ) : (
          <Word
            key={i}
            range={[start, end]}
            progress={scrollYProgress}
            isHighlighted={isHighlighted}
          >
            {token}
          </Word>
        );
      })}
    </p>
  );
}

interface EmojiProps {
  src: string;
  alt: string;
  range: [number, number];
  progress: MotionValue<number>;
}

const Emoji = ({ src, alt, range, progress }: EmojiProps) => {
  const opacity = useTransform(progress, range, [0, 1]);

  return (
    <span className="inline-block w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mt-4 sm:mt-6 md:mt-7">
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full"
        style={{ opacity }}
      />
    </span>
  );
};

interface WordProps {
  children: string;
  range: [number, number];
  progress: MotionValue<number>;
  isHighlighted?: boolean;
}

const Word = ({ children, range, progress, isHighlighted }: WordProps) => {
  const characters = children.split("");
  const amount = range[1] - range[0];
  const step = amount / characters.length;

  return (
    <span className="mr-1 sm:mr-2 mt-2 sm:mt-3 md:mt-4">
      {characters.map((char, i) => {
        const start = range[0] + i * step;
        const end = range[0] + (i + 1) * step;
        return (
          <Character
            key={i}
            range={[start, end]}
            progress={progress}
            isHighlighted={isHighlighted}
          >
            {char}
          </Character>
        );
      })}
    </span>
  );
};

interface CharacterProps {
  children: string;
  range: [number, number];
  progress: MotionValue<number>;
  isHighlighted?: boolean;
}

const Character = ({
  children,
  range,
  progress,
  isHighlighted,
}: CharacterProps) => {
  const opacity = useTransform(progress, range, [0, 1]);
  const colorClass = isHighlighted ? "text-blue-400" : "text-white";

  return (
    <span className="relative">
      <span className={`absolute opacity-10 ${colorClass}`}>{children}</span>
      <motion.span className={`relative ${colorClass}`} style={{ opacity }}>
        {children}
      </motion.span>
    </span>
  );
};
