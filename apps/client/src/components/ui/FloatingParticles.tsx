"use client";
import { motion } from "motion/react";
import { useEffect, useState, useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
}

interface FloatingParticlesProps {
  count?: number;
  className?: string;
  position?: "top-left" | "top-right" | "full";
}

export const FloatingParticles = ({
  count = 25,
  className = "",
  position = "full",
}: FloatingParticlesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Color palette for particles - memoized to prevent recreation
  const colors = useMemo(
    () => [
      "rgba(59, 130, 246, 0.4)", // Blue
      "rgba(147, 197, 253, 0.3)", // Light Blue
      "rgba(255, 255, 255, 0.2)", // White
      "rgba(139, 92, 246, 0.3)", // Purple
      "rgba(34, 197, 94, 0.3)", // Green
      "rgba(251, 191, 36, 0.3)", // Yellow
    ],
    [],
  );

  useEffect(() => {
    // Set dimensions on mount and resize
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    // Generate particles based on position
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => {
      let x, y;

      switch (position) {
        case "top-left":
          x = Math.random() * (dimensions.width * 0.4); // Left 40% of screen
          y = Math.random() * (dimensions.height * 0.5); // Top 50% of screen
          break;
        case "top-right":
          x = dimensions.width * 0.6 + Math.random() * (dimensions.width * 0.4); // Right 40% of screen
          y = Math.random() * (dimensions.height * 0.5); // Top 50% of screen
          break;
        default:
          x = Math.random() * dimensions.width;
          y = Math.random() * dimensions.height;
      }

      return {
        id: i,
        x,
        y,
        size: Math.random() * 6 + 2, // 2-8px
        opacity: Math.random() * 0.7 + 0.2, // 0.2-0.9
        duration: Math.random() * 25 + 15, // 15-40 seconds
        delay: Math.random() * 8, // 0-8 seconds delay
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    setParticles(newParticles);
  }, [count, dimensions.width, dimensions.height, position, colors]);

  if (particles.length === 0) return null;

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 100 }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
            zIndex: 100,
          }}
          initial={{
            x: particle.x,
            y: particle.y,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: [
              particle.x,
              particle.x + (Math.random() - 0.5) * 150,
              particle.x + (Math.random() - 0.5) * 200,
              particle.x,
            ],
            y: [
              particle.y,
              particle.y + (Math.random() - 0.5) * 100,
              particle.y + (Math.random() - 0.5) * 150,
              particle.y,
            ],
            opacity: [0, particle.opacity, particle.opacity, 0],
            scale: [0, 1, 1.3, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Specialized component for hero section with corner positioning
export const HeroFloatingParticles = () => {
  // Memoize static arrays to prevent recreation
  const detailParticlesLeft = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: `detail-left-${i}`,
        left: `${Math.random() * 35}%`,
        top: `${Math.random() * 40}%`,
        duration: Math.random() * 6 + 4,
        delay: Math.random() * 3,
      })),
    [],
  );

  const detailParticlesRight = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: `detail-right-${i}`,
        left: `${65 + Math.random() * 35}%`,
        top: `${Math.random() * 40}%`,
        duration: Math.random() * 6 + 4,
        delay: Math.random() * 3,
      })),
    [],
  );

  const orbsLeft = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: `orb-left-${i}`,
        width: Math.random() * 25 + 15,
        height: Math.random() * 25 + 15,
        left: `${Math.random() * 30}%`,
        top: `${Math.random() * 35}%`,
        duration: Math.random() * 18 + 12,
        delay: Math.random() * 4,
      })),
    [],
  );

  const orbsRight = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: `orb-right-${i}`,
        width: Math.random() * 25 + 15,
        height: Math.random() * 25 + 15,
        left: `${70 + Math.random() * 30}%`,
        top: `${Math.random() * 35}%`,
        duration: Math.random() * 18 + 12,
        delay: Math.random() * 4,
      })),
    [],
  );

  const starsLeft = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        id: `star-left-${i}`,
        left: `${Math.random() * 20}%`,
        top: `${Math.random() * 25}%`,
        delay: Math.random() * 12 + 6,
      })),
    [],
  );

  const starsRight = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        id: `star-right-${i}`,
        left: `${80 + Math.random() * 20}%`,
        top: `${Math.random() * 25}%`,
        delay: Math.random() * 12 + 6,
      })),
    [],
  );

  const constellationLines = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        id: `line-corner-${i}`,
        x1: `${Math.random() * 25}%`,
        y1: `${Math.random() * 30}%`,
        x2: `${75 + Math.random() * 25}%`,
        y2: `${Math.random() * 30}%`,
        duration: Math.random() * 10 + 6,
        delay: Math.random() * 8,
      })),
    [],
  );

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 100 }}
    >
      {/* Top Left Corner Particles */}
      <FloatingParticles count={20} position="top-left" className="z-[100]" />

      {/* Top Right Corner Particles */}
      <FloatingParticles count={20} position="top-right" className="z-[100]" />

      {/* Enhanced detail particles for corners */}
      <div className="absolute inset-0" style={{ zIndex: 100 }}>
        {/* Top Left Detail Particles */}
        {detailParticlesLeft.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
              backgroundColor: `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.2})`,
              zIndex: 100,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.9, 0.3],
              scale: [0.5, 1.8, 0.5],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Top Right Detail Particles */}
        {detailParticlesRight.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
              backgroundColor: `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.2})`,
              zIndex: 100,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.9, 0.3],
              scale: [0.5, 1.8, 0.5],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Enhanced glowing orbs for corners */}
      <div className="absolute inset-0" style={{ zIndex: 100 }}>
        {/* Top Left Glowing Orbs */}
        {orbsLeft.map((orb) => (
          <motion.div
            key={orb.id}
            className="absolute rounded-full blur-sm"
            style={{
              width: orb.width,
              height: orb.height,
              left: orb.left,
              top: orb.top,
              backgroundColor: `rgba(59, 130, 246, ${Math.random() * 0.3 + 0.1})`,
              zIndex: 100,
            }}
            animate={{
              x: [0, Math.random() * 80 - 40],
              y: [0, Math.random() * 60 - 30],
              scale: [1, 1.8, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              delay: orb.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Top Right Glowing Orbs */}
        {orbsRight.map((orb) => (
          <motion.div
            key={orb.id}
            className="absolute rounded-full blur-sm"
            style={{
              width: orb.width,
              height: orb.height,
              left: orb.left,
              top: orb.top,
              backgroundColor: `rgba(59, 130, 246, ${Math.random() * 0.3 + 0.1})`,
              zIndex: 100,
            }}
            animate={{
              x: [0, Math.random() * 80 - 40],
              y: [0, Math.random() * 60 - 30],
              scale: [1, 1.8, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              delay: orb.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Shooting stars from corners */}
      <div className="absolute inset-0" style={{ zIndex: 100 }}>
        {/* From Top Left */}
        {starsLeft.map((star) => (
          <motion.div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: star.left,
              top: star.top,
              zIndex: 100,
            }}
            animate={{
              x: [0, 150],
              y: [0, 75],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeOut",
            }}
          />
        ))}

        {/* From Top Right */}
        {starsRight.map((star) => (
          <motion.div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: star.left,
              top: star.top,
              zIndex: 100,
            }}
            animate={{
              x: [0, -150],
              y: [0, 75],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Constellation lines connecting corners */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 100 }}>
        {constellationLines.map((line) => (
          <motion.line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="0.8"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: line.duration,
              repeat: Infinity,
              delay: line.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
};
