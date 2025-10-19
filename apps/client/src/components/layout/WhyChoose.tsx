"use client";
import { motion } from "motion/react";
import {
  IconShield,
  IconNetwork,
  IconBrain,
  IconCode,
  IconDatabase,
  IconLock,
} from "@tabler/icons-react";

export const WhyChooseContext0 = () => {
  const features = [
    {
      icon: <IconShield className="w-6 h-6 text-blue-400" />,
      title: "Decentralized Security",
      description:
        "Your data is secured across a distributed network, eliminating single points of failure and ensuring maximum protection.",
    },
    {
      icon: <IconBrain className="w-6 h-6 text-blue-400" />,
      title: "AI-Native Architecture",
      description:
        "Built specifically for AI agents with optimized memory structures and context management for superior performance.",
    },
    {
      icon: <IconNetwork className="w-6 h-6 text-green-400" />,
      title: "Universal Compatibility",
      description:
        "Works seamlessly with all major AI models and frameworks, providing a unified memory layer across platforms.",
    },
    {
      icon: <IconDatabase className="w-6 h-6 text-orange-400" />,
      title: "Persistent Memory",
      description:
        "Never lose context again. Your AI agents maintain continuous memory across sessions and interactions.",
    },
    {
      icon: <IconLock className="w-6 h-6 text-red-400" />,
      title: "Privacy First",
      description:
        "You own your data completely. No corporate databases, no data mining, just pure decentralized ownership.",
    },
    {
      icon: <IconCode className="w-6 h-6 text-cyan-400" />,
      title: "Developer Friendly",
      description:
        "Simple APIs and comprehensive documentation make integration effortless for developers and researchers.",
    },
  ];

  return (
    <section
      id="why-choose"
      className="relative py-16 sm:py-20 md:py-24 bg-black overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_50%)]" />

      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[Black] text-white mb-4 tracking-wider">
            WHY CHOOSE
          </h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-[Black] text-blue-400 mb-6 tracking-wider">
            Context0?
          </h3>
          <p className="text-lg sm:text-xl text-gray-300 font-[Regular] max-w-3xl mx-auto leading-relaxed">
            Experience the future of AI memory management with our revolutionary
            decentralized protocol
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Glassmorphism Card */}
              <div className="relative h-full p-6 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-gray-500/20 transition-all duration-300 group-hover:scale-105 group-hover:border-white/20">
                {/* Content */}
                <div className="relative z-10 space-y-4">
                  {/* Icon Container */}
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h4 className="text-lg sm:text-xl font-[semiBold] text-white group-hover:text-gray-200 transition-colors duration-300">
                    {feature.title}
                  </h4>

                  {/* Description */}
                  <p className="text-gray-400 font-[Regular] text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-500/5 via-gray-400/5 to-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12 lg:mt-16"
        >
          <div className="relative inline-block">
            {/* Glassmorphism Container */}
            <div className="relative px-6 py-4 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10">
              <p className="text-lg sm:text-xl text-white font-[semiBold] mb-2">
                Ready to revolutionize your AI&apos;s memory?
              </p>
              <p className="text-gray-400 font-[Regular]">
                Join thousands of developers building the future of
                decentralized AI
              </p>
            </div>

            {/* Background Glow */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 via-blue-400/10 to-blue-500/10 blur-xl opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
    </section>
  );
};
