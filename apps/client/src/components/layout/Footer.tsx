"use client";
import { motion } from "motion/react";
import {
  IconBrandGithub,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconMail,
} from "@tabler/icons-react";
import Image from "next/image";
import logo from "../../../public/icons/context0_logo_cropped.jpeg";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Documentation", href: "#documentation" },
  ];

  const socialLinks = [
    { icon: IconBrandGithub, href: "#github", label: "GitHub" },
    { icon: IconBrandTwitter, href: "#twitter", label: "Twitter" },
    { icon: IconBrandLinkedin, href: "#linkedin", label: "LinkedIn" },
    { icon: IconMail, href: "mailto:admin@context0.com", label: "Email" },
  ];

  // Smooth scroll function for footer links
  const handleFooterLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();

    if (href.startsWith("#")) {
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  return (
    <footer className="relative bg-black border-t border-white/10 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-violet-900/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.1),transparent_50%)]" />

      {/* Glassmorphism Container */}
      <div className="relative backdrop-blur-xl bg-black/30 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-12 lg:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {/* Brand Section */}
              <div className="col-span-1 md:col-span-2 lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  {/* Logo */}
                  <div className="flex items-center space-x-3">
                    <Image
                      src={logo}
                      alt="context0 Logo"
                      width={48}
                      height={48}
                      className="rounded-lg"
                    />
                    <span className="text-2xl font-[Black] text-white tracking-wider">
                      Context0
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 font-[Regular] text-sm leading-relaxed max-w-md">
                    World&apos;s first decentralized protocol for Agentic Models
                    — a trustless, scalable framework that lets AI agents
                    access, store, and manage context securely across networks.
                  </p>

                  {/* Contact Info */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-gray-400 text-sm">
                      <IconMail className="w-4 h-4 text-violet-400" />
                      <span>admin@context0.tech</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Quick Links */}
              <div className="col-span-1 lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  <h3 className="text-white font-[semiBold] text-sm uppercase tracking-wider">
                    Quick Links
                  </h3>
                  <ul className="space-y-3">
                    {footerLinks.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link.href}
                          onClick={(e) => handleFooterLinkClick(e, link.href)}
                          className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-[Regular] cursor-pointer"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Newsletter Section */}
              <div className="col-span-1 lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  <h3 className="text-white font-[semiBold] text-sm uppercase tracking-wider">
                    Stay Updated
                  </h3>
                  <p className="text-gray-400 text-sm font-[Regular] mb-4">
                    Get the latest updates on Context0 development.
                  </p>

                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white backdrop-blur-sm font-[Regular] text-sm transition-all duration-200"
                    />
                    <button className="w-full px-6 py-3 bg-white hover:bg-gray-100 text-black rounded-lg transition-all duration-200 font-[semiBold] text-sm">
                      Subscribe
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="py-8 border-t border-white/10"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
              {/* Copyright */}
              <div className="text-gray-400 text-sm font-[Regular]">
                © {currentYear} Context0. All rights reserved.
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-6">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/5"
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
    </footer>
  );
};
