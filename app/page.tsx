"use client"
import { PumpkinGame } from "@/components/pumpkin-game"
import { useMobile } from "@/hooks/use-mobile"
import { OrientationWarning } from "@/components/orientation-warning"

export default function Home() {
  const { isMobile, isPortrait } = useMobile()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-orange-100">
      {isMobile && <OrientationWarning isPortrait={isPortrait} />}

      <h1 className="text-3xl font-bold text-orange-800 mb-4">南瓜平衡游戏</h1>
      <p className="text-lg text-orange-700 mb-6">点击南瓜将它们放在跷跷板上，学习重量和平衡的概念！</p>

      <div className="relative w-full max-w-[1000px] h-[800px] md:h-[800px] bg-amber-100 rounded-lg shadow-lg overflow-hidden">
        <PumpkinGame />
      </div>
    </main>
  )
}
