export default function DynamicButton({ title, emoji, className, onClick }: { title: string, emoji?: string, className?: string, onClick?: () => void }) {
    return (
        <>
            {emoji ?
                (<button className={`relative bg-white text-black flex justify-center group/modal-btn overflow-hidden p-2 rounded-lg w-full cursor-pointer ${className}`} onClick={onClick}>
                    <span className="group-hover/modal-btn:translate-x-70 text-center transition duration-500 text-sm">
                        {title}
                    </span>
                    <div className="-translate-x-70 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
                        <span className="text-xl">{emoji}</span>
                    </div>
                </button>)
                :
                (<button className="relative bg-white text-black flex justify-center p-2 rounded-lg w-full" disabled>
                    <span className="text-center text-sm">
                        {title}
                    </span>
                </button>)
            }
        </>
    )
}