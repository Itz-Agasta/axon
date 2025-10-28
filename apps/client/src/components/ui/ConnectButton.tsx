import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

export const ConnectButton = () => {
    const { address } = useAccount()
    const { connectors, connect, isPending } = useConnect()
    const { disconnect } = useDisconnect()

    return (
        <div>
            {address ? (
                <Button variant="default" size="sm" className="bg-red-500 text-white cursor-pointer" onClick={() => disconnect()}>Disconnect</Button>
            ) : (
                <Popover>
                    <PopoverTrigger>
                        <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-500 text-white cursor-pointer">
                            Connect Wallet
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="flex flex-col gap-2 bg-white">
                        {connectors ? connectors.map((connector) => (
                            <Button variant="default" size="sm" className="bg-gray-300 hover:bg-gray-400 text-black cursor-pointer" key={connector.uid} onClick={() => connect({ connector })} disabled={isPending}>
                                {isPending ? "Connecting..." : `Connect with ${connector.name}`}
                            </Button>
                        )) : <></>}
                    </PopoverContent>
                </Popover>
            )}
        </div>
    )
}