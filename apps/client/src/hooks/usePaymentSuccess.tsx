"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createInstance, deployArweaveContract } from "@/lib/api";
import { useAppwrite } from "@/context/AppwriteContext";

interface CreateInstanceResponse {
  instanceKeyHash: string;
  userId: string;
  name: string;
  description?: string;
  arweave_wallet_address: string;
  isActive: boolean;
}

interface DeployContractResponse {
  contractId: string;
  contractHashFingerprint: string;
  userId: string;
  deployedAt: string;
  keyId: string;
}

interface UsePaymentSuccessReturn {
  isProcessing: boolean;
  isSuccess: boolean;
  instanceData: CreateInstanceResponse | null;
  contractData: DeployContractResponse | null;
  contractHashFingerprint: string | null;
  showToken: boolean;
  error: string | null;
}

export const usePaymentSuccess = (): UsePaymentSuccessReturn => {
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAppwrite();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [instanceData, setInstanceData] =
    useState<CreateInstanceResponse | null>(null);
  const [contractData, setContractData] =
    useState<DeployContractResponse | null>(null);
  const [contractHashFingerprint, setContractHashFingerprint] = useState<
    string | null
  >(null);
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasProcessedRef = useRef(false);

  // Check for existing token in localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("context0_token");
    if (storedToken) {
      setContractHashFingerprint(storedToken);
    }
  }, []);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const success = searchParams.get("success");

      if (
        success === "true" &&
        isAuthenticated &&
        !isProcessing &&
        !isSuccess &&
        !hasProcessedRef.current
      ) {
        hasProcessedRef.current = true;
        setIsProcessing(true);
        setError(null);

        try {
          if (!user?.$id) {
            throw new Error("User ID not available");
          }

          const response = await createInstance(user.$id, "new-contract");

          if (response && response.id) {
            setInstanceData({
              instanceKeyHash: response.id,
              userId: user.$id,
              name: response.name,
              description: "Created from payment",
              arweave_wallet_address: "",
              isActive: true,
            });

            // Now deploy the Arweave contract
            const deployResponse = await deployArweaveContract(user.$id);

            if (deployResponse) {
              setContractData({
                contractId: deployResponse.contractId || "",
                contractHashFingerprint: deployResponse.contractHashFingerprint || "",
                userId: user.$id,
                deployedAt: new Date().toISOString(),
                keyId: "",
              });
              setContractHashFingerprint(
                deployResponse.contractHashFingerprint || "",
              );

              // Store token in localStorage
              localStorage.setItem(
                "context0_token",
                deployResponse.contractHashFingerprint || "",
              );

              setShowToken(true);
              setIsSuccess(true);

              // Hide token after 30 seconds
              setTimeout(() => {
                setShowToken(false);
              }, 30000);
            } else {
              throw new Error(
                "Failed to deploy contract",
              );
            }
          } else {
            throw new Error("Failed to create instance");
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "An unexpected error occurred";
          setError(errorMessage);
          console.error("Error creating instance:", err);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    handlePaymentSuccess();
  }, [searchParams, isAuthenticated, isProcessing, isSuccess]);

  return {
    isProcessing,
    isSuccess,
    instanceData,
    contractData,
    contractHashFingerprint,
    showToken,
    error,
  };
};
