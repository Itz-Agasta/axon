import { useChainId, useChains, useSwitchChain } from "wagmi"
import { Button } from "@/components/ui/button"

export function NetworkStatus() {
    const chainId = useChainId()
    const chains = useChains()

    const currentChain = chains.find(c => c.id === chainId)

    if (!currentChain) {
        return <div>Not connected to any network</div>
    }

    return (
        <div>
            <div className="text-white font-bold text-lg">Connected to {currentChain.name}</div>
            <div>Chain ID: {chainId}</div>
            <div>Supported chains: {chains.map(c => c.name).join(", ")}</div>
        </div>
    )
}


export function SwitchChainButton() {
    const { chains, switchChain } = useSwitchChain()

    return (
        <div>
            {chains.map((chain) => (
                <Button
                    variant="default" size="sm" className="bg-green-600 hover:bg-green-500 text-white cursor-pointer"
                    key={chain.id}
                    onClick={() => switchChain({ chainId: chain.id })}
                >
                    Switch to {chain.name}
                </Button>
            ))}
        </div>
    )
}