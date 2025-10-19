import { Landing } from "@/components/layout/Landing";
import { LenisProvider } from "@/hooks/useLenisProvider";

export default function Home() {
  return (
    <LenisProvider>
      <div className="text-xl text-black">
        <Landing />
      </div>
    </LenisProvider>
  );
}
