"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { ColorPreset, GameSettings, SeesawStyle } from "./pumpkin-game"

interface SettingsProps {
  currentSettings: GameSettings
  onApply: (settings: GameSettings) => void
  onCancel: () => void
}

export function Settings({ currentSettings, onApply, onCancel }: SettingsProps) {
  // 使用当前设置初始化状态
  const [settings, setSettings] = useState<GameSettings>({ ...currentSettings })

  // 处理设置变更
  const handleChange = (field: keyof GameSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // 处理数字输入变更
  const handleNumberChange = (field: keyof GameSettings, value: string) => {
    const numValue = Number.parseInt(value)
    if (!isNaN(numValue)) {
      handleChange(field, numValue)
    }
  }

  // 验证设置是否有效
  const isValid = () => {
    return (
      settings.leftPumpkinsMin <= settings.leftPumpkinsMax &&
      settings.rightPumpkinsMin <= settings.rightPumpkinsMax &&
      settings.minWeight <= settings.maxWeight &&
      settings.leftPumpkinsMin >= 1 &&
      settings.rightPumpkinsMin >= 1 &&
      settings.minWeight >= 1
    )
  }

  // 颜色预设选项
  const colorPresets = [
    { value: "default", label: "默认橙色" },
    { value: "autumn", label: "秋季色调" },
    { value: "pastel", label: "柔和色调" },
    { value: "vibrant", label: "鲜艳色调" },
    { value: "monochrome", label: "单色调" },
  ]

  // 跷跷板样式选项
  const seesawStyles = [
    { value: "classic", label: "经典木质" },
    { value: "modern", label: "现代金属" },
    { value: "playful", label: "彩色童趣" },
  ]

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-orange-800">游戏设置</h2>
          <button className="text-gray-500 hover:text-gray-700 transition-colors" onClick={onCancel}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* 南瓜颜色预设 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">南瓜颜色预设</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={settings.colorPreset}
              onChange={(e) => handleChange("colorPreset", e.target.value as ColorPreset)}
            >
              {colorPresets.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          {/* 跷跷板样式预设 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">跷跷板样式</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={settings.seesawStyle}
              onChange={(e) => handleChange("seesawStyle", e.target.value as SeesawStyle)}
            >
              {seesawStyles.map((style) => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>

          {/* 左侧南瓜数量设置 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">左侧南瓜最小数量</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="1"
                max="10"
                value={settings.leftPumpkinsMin}
                onChange={(e) => handleNumberChange("leftPumpkinsMin", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">左侧南瓜最大数量</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="1"
                max="10"
                value={settings.leftPumpkinsMax}
                onChange={(e) => handleNumberChange("leftPumpkinsMax", e.target.value)}
              />
            </div>
          </div>

          {/* 右侧南瓜数量设置 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">右侧南瓜最小数量</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="1"
                max="10"
                value={settings.rightPumpkinsMin}
                onChange={(e) => handleNumberChange("rightPumpkinsMin", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">右侧南瓜最大数量</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="1"
                max="10"
                value={settings.rightPumpkinsMax}
                onChange={(e) => handleNumberChange("rightPumpkinsMax", e.target.value)}
              />
            </div>
          </div>

          {/* 南瓜重量设置 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">南瓜最小重量</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="1"
                max="20"
                value={settings.minWeight}
                onChange={(e) => handleNumberChange("minWeight", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">南瓜最大重量</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="1"
                max="20"
                value={settings.maxWeight}
                onChange={(e) => handleNumberChange("maxWeight", e.target.value)}
              />
            </div>
          </div>

          {/* 错误提示 */}
          {!isValid() && <div className="text-red-500 text-sm">请确保最小值不大于最大值，且所有数值都大于等于1。</div>}

          {/* 按钮 */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-400 transition-colors"
              onClick={onCancel}
            >
              取消
            </button>
            <button
              className="px-4 py-2 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-colors"
              onClick={() => isValid() && onApply(settings)}
              disabled={!isValid()}
            >
              应用设置
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
