"use client"

import { useEffect, useRef } from "react"
import type { ColorPreset } from "./pumpkin-game"

interface PumpkinProps {
  id: number
  x: number
  y: number
  size: number
  weight: number
  onSeesaw: boolean
  slotIndex?: number
  colorPreset?: ColorPreset
  onClick: () => void
  isMobile?: boolean
}

export function Pumpkin({
  id,
  x,
  y,
  size,
  weight,
  onSeesaw,
  slotIndex = 0,
  colorPreset = "default",
  onClick,
  isMobile = false,
}: PumpkinProps) {
  const pumpkinRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pumpkinRef.current) {
      // 南瓜移动到跷跷板上时的动画
      if (onSeesaw) {
        pumpkinRef.current.style.transition = "transform 0.5s ease-in-out, left 0.5s ease-in-out, top 0.5s ease-in-out"
      }
    }
  }, [onSeesaw])

  // 南瓜在跷跷板上时的位置更新
  useEffect(() => {
    if (pumpkinRef.current && onSeesaw) {
      // 使用更平滑的过渡效果
      pumpkinRef.current.style.transition = "left 0.5s ease-out, top 0.5s ease-out"
      pumpkinRef.current.style.left = `${x - size / 2}px`
      pumpkinRef.current.style.top = `${y - size / 2}px`
    }
  }, [x, y, size, onSeesaw])

  // 根据颜色预设和重量获取南瓜颜色
  const getPumpkinColor = () => {
    // 根据不同的颜色预设返回不同的颜色
    switch (colorPreset) {
      case "autumn":
        // 秋季色调：从深红棕色到浅橙色
        if (weight <= 3) return "bg-amber-300"
        if (weight <= 6) return "bg-amber-500"
        if (weight <= 9) return "bg-orange-600"
        return "bg-orange-800"

      case "pastel":
        // 柔和色调：柔和的粉色、紫色和蓝色
        if (weight <= 3) return "bg-pink-300"
        if (weight <= 6) return "bg-purple-300"
        if (weight <= 9) return "bg-blue-300"
        return "bg-indigo-300"

      case "vibrant":
        // 鲜艳色调：明亮的红色、绿色和黄色
        if (weight <= 3) return "bg-yellow-400"
        if (weight <= 6) return "bg-green-500"
        if (weight <= 9) return "bg-red-500"
        return "bg-purple-500"

      case "monochrome":
        // 单色调：从浅灰到深灰
        if (weight <= 3) return "bg-gray-300"
        if (weight <= 6) return "bg-gray-400"
        if (weight <= 9) return "bg-gray-600"
        return "bg-gray-800"

      case "default":
      default:
        // 默认橙色调
        if (weight <= 3) return "bg-orange-400"
        if (weight <= 6) return "bg-orange-500"
        if (weight <= 9) return "bg-orange-600"
        return "bg-orange-700"
    }
  }

  // 获取南瓜茎的颜色
  const getStemColor = () => {
    switch (colorPreset) {
      case "autumn":
        return "bg-amber-950"
      case "pastel":
        return "bg-green-400"
      case "vibrant":
        return "bg-lime-600"
      case "monochrome":
        return "bg-gray-900"
      default:
        return "bg-green-800"
    }
  }

  // 根据设备类型调整字体大小
  const getFontSize = () => {
    if (isMobile) {
      return `${size / 4}px` // 移动设备上字体更小
    }
    return `${size / 3}px` // 桌面设备上的字体大小
  }

  return (
    <div
      ref={pumpkinRef}
      className={`absolute cursor-pointer transform transition-transform hover:scale-105 ${onSeesaw ? "" : "animate-pulse"}`}
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        // 根据槽位索引设置z-index，确保正确的视觉层次
        zIndex: onSeesaw ? 20 + slotIndex : 10,
      }}
      onClick={() => onClick()} // 修改这里，使南瓜无论是否在跷跷板上都可以点击
    >
      {/* Pumpkin body */}
      <div
        className={`w-full h-full rounded-full ${getPumpkinColor()} relative flex items-center justify-center`}
        style={{
          boxShadow: "inset 0 -10px 20px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.3)",
        }}
      >
        {/* Pumpkin ridges */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, transparent 60%, rgba(0,0,0,0.1) 60%)",
          }}
        ></div>

        {/* Pumpkin stem */}
        <div
          className={`absolute ${getStemColor()} rounded-sm`}
          style={{
            top: "-10%",
            left: "40%",
            width: "20%",
            height: "15%",
          }}
        ></div>

        {/* Weight label */}
        <div className="text-white font-bold text-center" style={{ fontSize: getFontSize() }}>
          {weight}公斤
        </div>
      </div>
    </div>
  )
}
