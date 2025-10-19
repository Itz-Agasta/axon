"use client";

import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import WalletIcon from "@/components/ui/WalletIcon";
import { ConnectButton } from "@/components/ui/ConnectButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getEthPrice,
  convertUsdToEth,
  formatEthAmount,
} from "@/lib/getCryptoPrice";
import { useRouter } from "next/navigation";
import { hitPaymentWebhook } from "@/lib/api";
import { useAppwrite } from "@/context/AppwriteContext";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 5,
    features: ["1 User", "10GB Storage", "Basic Support", "Core Features"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 10,
    features: [
      "5 Users",
      "100GB Storage",
      "Priority Support",
      "Advanced Features",
      "Analytics",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 50,
    features: [
      "Unlimited Users",
      "1TB Storage",
      "24/7 Support",
      "All Features",
      "Custom Integrations",
      "SLA",
    ],
  },
];

export function Web3Payment() {
  const { isConnected, address } = useAccount();
  const searchParams = useSearchParams();
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [countdown, setCountdown] = useState(60); // 60 seconds countdown
  const router = useRouter();

  const { user } = useAppwrite();

  const RECIPIENT_ADDRESS = process.env.NEXT_PUBLIC_SERVICE_WALLET_ADDRESS;

  // Get subscription from URL params
  useEffect(() => {
    const planId = searchParams.get("subscription");
    if (planId) {
      const plan = subscriptionPlans.find((p) => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
      }
    } else {
      // Default to Basic plan if no subscription specified
      setSelectedPlan(subscriptionPlans[0]);
    }
  }, [searchParams]);

  const fetchPrice = async () => {
    setIsLoadingPrice(true);
    const price = await getEthPrice();
    setEthPrice(price);
    setIsLoadingPrice(false);
  };

  async function OnPaymentComplete() {
    console.log("Payment complete!");

    if (!sendTxData) {
      console.error("No transaction data available");
      return;
    }

    if (!isTxSuccess) {
      console.error("Transaction not successful");
      return;
    }
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    try {
      await hitPaymentWebhook(sendTxData, selectedPlan?.id || "", 1000);
      console.log("Payment webhook hit successfully");
    } catch (err) {
      console.error("Error hitting payment webhook:", err);
      return;
    }
    router.push("/dashboard?success=true");
  }

  useEffect(() => {
    let countdown = 60;

    const interval = setInterval(async () => {
      await fetchPrice(); // fetch price every 60s
      countdown = 60;
      setCountdown(countdown); // reset to 60 after fetch
    }, 60000); // 60 seconds

    // Decrease countdown every 1s
    const countdownInterval = setInterval(() => {
      if (countdown > 0) {
        countdown -= 1;
        setCountdown(countdown);
      }
    }, 1000);

    // Initial fetch + reset timer
    fetchPrice().then(() => setCountdown(60));

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, []);

  // Payment
  const {
    data: sendTxData,
    sendTransaction,
    isPending: isPaying,
    error: payError,
  } = useSendTransaction();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash: sendTxData,
      query: {
        enabled: !!sendTxData,
      },
    });

  const handlePayment = () => {
    if (!selectedPlan || !ethPrice || !RECIPIENT_ADDRESS) return;

    const ethAmount = convertUsdToEth(selectedPlan.price, ethPrice);
    sendTransaction({
      to: `0x${RECIPIENT_ADDRESS}`,
      value: parseEther(ethAmount.toString()),
    });
  };

  useEffect(() => {
    if (isTxSuccess && sendTxData) {
      OnPaymentComplete();
    }
  }, [isTxSuccess, sendTxData]);

  const ethAmount =
    selectedPlan && ethPrice
      ? convertUsdToEth(selectedPlan.price, ethPrice)
      : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Payment Section */}
      {selectedPlan && (
        <Card className="p-8 bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                <WalletIcon />
                Complete Payment
              </h2>
              <Badge
                variant="outline"
                className="text-blue-400 border-blue-400"
              >
                {selectedPlan.name} Plan
              </Badge>
            </div>

            {/* Price Display */}
            <div className="bg-zinc-800 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Plan Cost:</span>
                <span className="text-xl font-bold text-white">
                  ${selectedPlan.price} USD
                </span>
              </div>

              <hr className="border-zinc-700" />

              <div className="flex flex-col justify-center space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Amount to Pay:</span>
                  <span className="text-2xl font-bold text-blue-400">
                    {isLoadingPrice ? (
                      <div className="animate-pulse">Loading...</div>
                    ) : ethPrice ? (
                      `${formatEthAmount(ethAmount)} ETH`
                    ) : (
                      "Price unavailable"
                    )}
                  </span>
                </div>
                <div className="flex flex-row justify-between">
                  <div className="text-sm text-gray-500">
                    Powered by Etherscan API
                  </div>
                  <div className="text-sm text-gray-500">
                    Refreshing in {countdown} second{countdown !== 1 && "s"}...
                  </div>
                </div>
              </div>
            </div>

            {/* Recipient Address */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Payment Address:</label>
              <div className="bg-zinc-800 rounded-lg p-3 text-xs break-all select-all border border-zinc-700 font-mono text-white">
                {RECIPIENT_ADDRESS || "Address not configured"}
              </div>
            </div>

            {/* Wallet Connection Status */}
            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-xl ${isConnected ? "bg-green-400" : "bg-red-400"}`}
                  ></div>
                  <span className="font-medium text-white">
                    {isConnected ? "Wallet Connected" : "Wallet Not Connected"}
                  </span>
                </div>
                <ConnectButton />
              </div>
              {/* isConnected && (
                                <div className="mt-3 pt-3 border-t border-zinc-700">
                                    <div className="flex gap-4">
                                        <NetworkStatus />
                                        <SwitchChainButton />
                                    </div>
                                </div>
                            ) */}
              {isConnected && (
                <div className="mt-3 pt-3 border-t border-zinc-700 text-white">
                  <h1>Your Wallet Address: {address}</h1>
                </div>
              )}
            </div>

            {/* Payment Button */}
            <div className="space-y-4">
              {isConnected ? (
                <Button
                  variant="default"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg"
                  disabled={
                    isPaying ||
                    isTxLoading ||
                    isTxSuccess ||
                    !ethPrice ||
                    !RECIPIENT_ADDRESS
                  }
                  onClick={handlePayment}
                >
                  {isPaying || isTxLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Processing Payment...
                    </div>
                  ) : isTxSuccess ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Payment Successful!
                    </div>
                  ) : (
                    `Pay ${formatEthAmount(ethAmount)} ETH`
                  )}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-12 border-zinc-700 text-gray-400 cursor-not-allowed"
                  disabled
                >
                  Connect Wallet to Continue
                </Button>
              )}
            </div>

            {/* Error Display */}
            {payError && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-400 text-sm">{payError.message}</p>
              </div>
            )}

            {/* Transaction Hash */}
            {sendTxData && (
              <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
                <p className="text-green-400 text-sm">
                  Transaction Hash:
                  <a
                    href={`https://etherscan.io/tx/${sendTxData}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline ml-1 hover:text-green-300"
                  >
                    {sendTxData}
                  </a>
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Security Notice */}
      <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-400 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-gray-400">
            <p className="font-semibold text-white mb-1">Secure Payment</p>
            <p>
              Your payment is processed directly on the blockchain. Make sure
              you&apos;re connected to the correct network and have sufficient
              ETH for gas fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
