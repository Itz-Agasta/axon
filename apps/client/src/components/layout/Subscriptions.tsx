"use client";

import { Box, Lock, Settings } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Badge } from "@/components/ui/badge";
import DynamicButton from "@/components/ui/DynamicButton";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";

const plans = [
  {
    title: "Basic",
    featureTitle: "Perfect for individuals",
    features: [
      "Store up to 1,000 memories",
      "Create and manage 5 AI agents",
      "Get email-based support",
      "Ideal for students, hobbyists, or early testers",
    ],
    price: "$5",
    recommended: false,
  },
  {
    title: "Pro",
    featureTitle: "Built for power users and growing teams",
    features: [
      "Store up to 10,000 memories",
      "Unlimited AI agents",
      "Priority support",
      "Great for startups, researchers, and productivity hackers",
    ],
    price: "$15",
    recommended: true,
  },
  {
    title: "Enterprise",
    featureTitle: "Tailored for businesses and organizations",
    features: [
      "Unlimited memory capacity",
      "Team collaboration tools",
      "Dedicated support",
      "Built for scale, reliability, and premium experience",
    ],
    price: "$50",
    recommended: false,
  },
];

export function Subscriptions({ currentPlan }: { currentPlan?: string }) {
  const getIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Box className="h-4 w-4 text-neutral-400" />;
      case 1:
        return <Settings className="h-4 w-4 text-neutral-400" />;
      case 2:
        return <Lock className="h-4 w-4 text-neutral-400" />;
      default:
        return <Box className="h-4 w-4 text-neutral-400" />;
    }
  };
  const router = useRouter();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-[semiBold] text-white mb-3 sm:mb-4">
          Choose the right plan that suits your needs
        </h1>
        <h2 className="text-base sm:text-lg md:text-xl font-[Regular] text-neutral-400">
          Decentralized memory protocol for agentic LLMs. Scalable. Secure.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <SubscriptionCard
            key={plan.title}
            area=""
            icon={getIcon(index)}
            title={plan.title}
            onClick={() =>
              router.push(
                `/payment?subscription=${plan.title.toLocaleLowerCase()}`,
              )
            }
            description={
              <div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-blue-400">
                  {plan.price}
                  <span className="text-xs sm:text-sm font-normal">/month</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-xs sm:text-sm">
                      • {feature}
                    </li>
                  ))}
                </ul>
              </div>
            }
            currentPlan={
              currentPlan === plan.title.toLocaleLowerCase() ? true : false
            }
            recommended={plan.recommended}
          />
        ))}
      </div>
    </div>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  currentPlan?: boolean;
  recommended?: boolean;
  onClick?: () => void;
}

const SubscriptionCard = ({
  area,
  icon,
  title,
  description,
  currentPlan,
  recommended,
  onClick,
}: GridItemProps) => {
  const pathname = usePathname();
  return (
    <li className={`min-h-[14rem] flex-1 list-none ${area}`.trim()}>
      <div className="relative h-full rounded-2xl border border-gray-600/30 p-2 md:rounded-3xl md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="border-0.75 relative flex h-full flex-col justify-center overflow-hidden rounded-xl p-4 sm:p-6 shadow-[0px_0px_27px_0px_#2D2D2D]">
          <div className="relative flex flex-1 flex-col justify-between">
            <div className="flex flex-row justify-between items-start mb-4">
              <div className="w-fit rounded-lg border border-gray-600 p-2">
                {icon}
              </div>
              {recommended && (
                <Badge
                  variant="secondary"
                  className="bg-blue-500 text-white dark:bg-blue-600 text-xs"
                >
                  Popular
                </Badge>
              )}
            </div>
            <div className="space-y-3 flex-1">
              <h3 className="font-sans text-lg sm:text-xl md:text-2xl font-semibold text-balance text-white">
                {title}
              </h3>
              <div className="font-sans text-sm md:text-base text-neutral-400">
                {description}
              </div>
            </div>
            {pathname === "/" || pathname === "" ? null : (
              <div className="mt-4">
                {currentPlan ? (
                  <Button
                    variant="default"
                    className="bg-blue-500 text-white w-full p-2 text-sm"
                  >
                    Current Plan
                  </Button>
                ) : (
                  <DynamicButton
                    title={"Proceed to Checkout"}
                    emoji={"🤟"}
                    onClick={onClick}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};
