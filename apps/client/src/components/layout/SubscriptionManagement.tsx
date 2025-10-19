"use client";

import { Box, Lock, Settings } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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

interface SubscriptionManagementProps {
  currentPlan?: string;
}

export function SubscriptionManagement({
  currentPlan,
}: SubscriptionManagementProps) {
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
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-[bold] text-white mb-2">
          Manage Subscription
        </h1>
        <p className="text-neutral-400 font-[regular]">
          Choose the plan that best fits your needs and unlock more features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {plans.map((plan, index) => (
          <SubscriptionCard
            key={plan.title}
            area=""
            icon={getIcon(index)}
            title={plan.title}
            onClick={() =>
              router.push(`/payments?subscription=${plan.title.toLowerCase()}`)
            }
            description={
              <div>
                <div className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-blue-400">
                  {plan.price}
                  <span className="text-xs font-normal">/month</span>
                </div>
                <ul className="space-y-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="text-md font-[regular] text-white"
                    >
                      • {feature}
                    </li>
                  ))}
                </ul>
              </div>
            }
            currentPlan={
              currentPlan === plan.title.toLowerCase() ? true : false
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
  return (
    <li className={`min-h-[12rem] flex-1 list-none ${area}`.trim()}>
      <div className="relative h-full rounded-xl border border-gray-600/30 p-2">
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl" />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tl from-blue-400/5 via-transparent to-white/5" />

        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="border-0.75 relative flex h-full flex-col justify-center overflow-hidden rounded-lg p-3 sm:p-4 shadow-[0px_0px_27px_0px_#2D2D2D]">
          <div className="relative flex flex-1 flex-col justify-between">
            <div className="flex flex-row justify-between items-start mb-3">
              <div className="w-fit rounded-lg border border-gray-600 p-1.5 bg-white/5 backdrop-blur-sm">
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
            <div className="space-y-2 flex-1">
              <h3 className="font-sans text-2xl font-semibold text-balance text-white">
                {title}
              </h3>
              <div className="font-sans text-lg text-neutral-400">
                {description}
              </div>
            </div>
            <div className="mt-3">
              {currentPlan ? (
                <Button className="bg-blue-400 text-white w-full text-sm">
                  Current Plan
                </Button>
              ) : (
                <Button
                  className="bg-blue-400 hover:bg-blue-500 text-white w-full text-sm cursor-pointer"
                  onClick={onClick}
                >
                  Upgrade to {title}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
