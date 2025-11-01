"use client";
import React, { useEffect, useState, Suspense } from "react";
import DashboardNavbar from "@/components/ui/DashboardNavbar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getUserSubscription } from "@/lib/api";
import { useRouter } from "next/navigation";
import { usePaymentSuccess } from "@/hooks/usePaymentSuccess";
import { CodeBlock } from "@/components/ui/code-block";
import { useAppwrite } from "@/context/AppwriteContext";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-800 p-6 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white mt-2">{value}</p>
      </div>
      <div className="p-3 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl">
        {icon}
      </div>
    </div>
  </div>
);

const DashboardContent: React.FC = () => {
  const { isAuthenticated, user } = useAppwrite();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const {
    isProcessing,
    isSuccess,
    instanceData,
    contractHashFingerprint,
    showToken,
    error,
  } = usePaymentSuccess();
  const [monthlyData, setMonthlyData] = useState([
    { name: "Jan", memories: 0 },
    { name: "Feb", memories: 0 },
    { name: "Mar", memories: 0 },
    { name: "Apr", memories: 0 },
    { name: "May", memories: 0 },
    { name: "Jun", memories: 3 },
  ]);
  const [stats, setStats] = useState({
    space: "0/1GB",
    requests: "0",
    memories: "0",
    growthRate: "0%",
  });
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, user: "", action: "", time: "", avatar: "" },
  ]);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("");
  const [quotaUsed, setQuotaUsed] = useState<number>(0);

  useEffect(() => {
    const checkSubscriptionAndInitialize = async () => {
      try {
        if (!user?.$id) {
          console.error("User ID not available, user might not be signed in");
          //router.push("/payment");
          return;
        }

        // Check user subscription
        const subscriptionData = await getUserSubscription(user.$id);
        if (
          !subscriptionData ||
          !subscriptionData.data ||
          !subscriptionData.data.isActive
        ) {
          console.log("User is not subscribed, redirecting to payment page");
          router.push("/payment");
          return;
        }

        // Set subscription plan and quota used
        setSubscriptionPlan(subscriptionData.data.plan || "free");
        const quotaUsedValue = subscriptionData.data.quotaUsed || 0;
        setQuotaUsed(quotaUsedValue);

        // Update stats with quota used
        setStats((prevStats) => ({
          ...prevStats,
          memories: quotaUsedValue.toString(),
        }));

        // Update monthly data with current quota used (last month)
        setMonthlyData((prevData) =>
          prevData.map((item, index) =>
            index === prevData.length - 1
              ? { ...item, memories: quotaUsedValue }
              : item,
          ),
        );
      } catch (error) {
        console.error("Error checking subscription or fetching data:", error);
        // On error, redirect to payment page to be safe
        router.push("/payment");
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscriptionAndInitialize();
  }, [user?.$id, router, isAuthenticated]);

  // Handle payment success instance creation
  useEffect(() => {
    if (isSuccess && contractHashFingerprint) {
      console.log(
        "Instance and contract created successfully. Token:",
        contractHashFingerprint,
      );
	}
	if (error) {
		console.error("Error creating instance:", error);
	}
}, [isSuccess, contractHashFingerprint, error]);

	// Redirect to sign in if user is not authenticated
	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/auth/login");
		}
	}, [isAuthenticated, router]);

	// Show loading state while checking subscription or processing payment
	if (isLoading || isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        {isProcessing && (
          <p className="text-white ml-4" style={{ fontFamily: "Regular" }}>
            Creating instance and deploying contract...
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Use DashboardNavbar instead of FloatingNavbar */}
      <DashboardNavbar />

      {/* Main Content */}
      <div className="flex flex-col">
        {/* Success Notification */}
        {isSuccess && contractHashFingerprint && showToken && (
          <div className="mx-6 mt-6 ml-22 p-4 bg-green-900/80 border border-green-700 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-white" style={{ fontFamily: "SemiBold" }}>
                  Instance and Contract Created Successfully!
                </h4>
                <p
                  className="text-white text-sm"
                  style={{ fontFamily: "Regular" }}
                >
                  Instance and contract deployed successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mx-6 mt-6 ml-22 p-4 bg-red-900/80 border border-red-700 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-white" style={{ fontFamily: "SemiBold" }}>
                  Error Creating Instance
                </h4>
                <p
                  className="text-white text-sm"
                  style={{ fontFamily: "Regular" }}
                >
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <main className="flex-1 p-6 ml-16">
          {/* Context0 Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl text-white" style={{ fontFamily: "Bold" }}>
              Context0
            </h1>
            <p
              className="text-white text-lg mt-2"
              style={{ fontFamily: "Regular" }}
            >
              Current Plan: {subscriptionPlan}
            </p>
          </div>

          {/* Setup Instructions */}
          {showToken ? (
            <div className="mb-8">
              <CodeBlock
                language="bash"
                filename="setup.sh"
                code={`TOKEN=${contractHashFingerprint || "your-token-here"}`}
              />
            </div>
          ) : (
            <></>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Context0 Instance */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-800 p-6">
              <h3
                className="text-lg text-white mb-6"
                style={{ fontFamily: "SemiBold" }}
              >
                Context0 Instance
              </h3>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-white text-sm"
                    style={{ fontFamily: "Regular" }}
                  >
                    Memories:
                  </span>
                  <span
                    className="text-white"
                    style={{ fontFamily: "SemiBold" }}
                  >
                    {stats.memories}/1K
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((parseInt(stats.memories) / 1000) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Right Column - Metric Graph */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-800 p-6">
              <h3
                className="text-lg text-white mb-6"
                style={{ fontFamily: "SemiBold" }}
              >
                Memory Usage Over Time
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.95)",
                      color: "#fff",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="memories"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#3B82F6" }}
                    name="Memories"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
};

export default Dashboard;
