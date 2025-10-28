"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function NavBar() {
  const navItems = [
    {
      name: "Features",
      link: "#features",
    },
    {
      name: "Pricing",
      link: "#pricing",
    },
    {
      name: "Contact",
      link: "#contact",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Smooth scroll function
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: string,
  ) => {
    e.preventDefault();

    if (link.startsWith("#")) {
      const targetId = link.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }

    // Close mobile menu if open
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="fixed w-full z-40">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems
            items={navItems}
            className="font-[semiBold]"
            onItemClick={(e, link) => handleNavClick(e, link)}
          />
          <div className="flex items-center gap-4">
            <NavbarButton
              variant="primary"
              onClick={() => router.push("/dashboard")}
            >
              Get Started Today
            </NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={(e) => handleNavClick(e, item.link)}
                className="relative text-neutral-600 dark:text-neutral-300 hover:text-white transition-colors"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              <NavbarButton
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push("/get-started");
                }}
                variant="primary"
                className="w-full"
              >
                Get Started Today
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
