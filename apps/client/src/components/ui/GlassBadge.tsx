"use client";
import { motion } from "motion/react";
import { useMemo } from "react";

interface GlassBadgeProps {
  text: string;
  emoji?: string;
  className?: string;
  onClick?: () => void;
}

export const GlassBadge = ({
  text,
  emoji,
  className = "",
  onClick,
}: GlassBadgeProps) => {
  // Memoize floating particles to prevent recreation
  const floatingParticles = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        id: i,
        left: `${20 + i * 30}%`,
        top: `${10 + i * 20}%`,
        duration: 2 + i * 0.5,
        delay: i * 0.3,
      })),
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.2,
      }}
      className={`relative inline-flex items-center gap-2 cursor-pointer ${className}`}
    >
      {/* Main Glass Container */}
      <div className="relative group" onClick={onClick}>
        {/* Background Blur Layer */}
        <div className="absolute inset-0 rounded-full bg-white/5 backdrop-blur-xl border border-white/10" />

        {/* Liquid Glass Effect Layers */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-white/5 to-transparent opacity-60" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-tl from-blue-400/10 via-transparent to-white/10" />

        {/* Inner Glow */}
        <div className="absolute inset-[1px] rounded-full bg-gradient-to-br from-white/10 to-transparent" />

        {/* Content Container - Responsive padding */}
        <div className="relative px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex items-center gap-1 sm:gap-2">
          {emoji && (
            <motion.span
              className="text-sm sm:text-base md:text-lg"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            >
              {emoji}
            </motion.span>
          )}

          <span className="text-xs sm:text-sm md:text-base font-[semiBold] text-white/90 tracking-wide whitespace-nowrap">
            {text}
          </span>
        </div>

        {/* Hover Effects */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/5 via-white/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Outer Glow */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-400/20 via-white/10 to-blue-400/20 blur-sm opacity-0 group-hover:opacity-60 transition-opacity duration-500" />

        {/* Shimmer Effect */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
              delay: 1,
            }}
          />
        </div>
      </div>

      {/* Floating Particles - Hidden on mobile for performance */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        {floatingParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              y: [-10, -20, -10],
              opacity: [0.4, 0.8, 0.4],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: particle.delay,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
