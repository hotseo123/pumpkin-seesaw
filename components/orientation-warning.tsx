"use client"

import { useEffect, useState } from "react"
import { RotateCcw } from "lucide-react"

interface OrientationWarningProps {
  isPortrait: boolean
}

export function OrientationWarning({ isPortrait }: OrientationWarningProps) {
  const [dismissed, setDismissed] = useState(false)

  // 当方向改变时重置dismissed状态
  useEffect(() => {
    setDismissed(false)
  }, [isPortrait])

  if (!isPortrait || dismissed) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center p-6 text-center">
      <RotateCcw className="w-16 h-16 text-white mb-4 animate-spin-slow" />
      <h2 className="text-2xl font-bold text-white mb-4">请旋转设备</h2>
      <p className="text-white mb-8">为了获得最佳游戏体验，请将您的设备旋转至横屏模式。</p>
      <button
        className="px-6 py-3 bg-orange-500 text-white rounded-full font-bold text-lg hover:bg-orange-600 transition-colors"
        onClick={() => setDismissed(true)}
      >
        继续使用竖屏模式
      </button>
    </div>
  )
}
