export const getEthPrice = async (): Promise<number | null> => {
	if (!process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY) {
		console.error('ETHERSCAN_API_KEY is not set in environment variables');
		return null;
	}

	try {
		const params = new URLSearchParams({
			chainid: '1',
			module: 'stats',
			action: 'ethprice',
			apikey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
		});

		const response = await fetch(`https://api.etherscan.io/v2/api?${params}`);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = (await response.json()) as {
			status: string;
			result?: { ethusd: string };
		};

		if (data.status === '1' && data.result) {
			return parseFloat(data.result.ethusd);
		}

		return null;
	} catch (error) {
		console.error('Error fetching ETH price:', error);
		return null;
	}
};

// Utility function to convert USD to ETH
export const convertUsdToEth = (usdAmount: number, ethPrice: number): number => {
	return usdAmount / ethPrice;
};

// Utility function to format ETH amount
export const formatEthAmount = (ethAmount: number): string => {
	return ethAmount.toFixed(6);
};
