"use client"

import { useEffect, useRef, useState } from "react"
import { Pumpkin } from "./pumpkin"
import { BalanceReward } from "./balance-reward"
import { Settings } from "./settings"
import { Cog } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

// 南瓜颜色预设
export type ColorPreset = "default" | "autumn" | "pastel" | "vibrant" | "monochrome"

// 跷跷板样式预设
export type SeesawStyle = "classic" | "modern" | "playful"

// 游戏设置接口
export interface GameSettings {
  colorPreset: ColorPreset
  seesawStyle: SeesawStyle
  leftPumpkinsMin: number
  leftPumpkinsMax: number
  rightPumpkinsMin: number
  rightPumpkinsMax: number
  minWeight: number
  maxWeight: number
}

// 默认游戏设置
const defaultSettings: GameSettings = {
  colorPreset: "default",
  seesawStyle: "classic",
  leftPumpkinsMin: 4,
  leftPumpkinsMax: 8,
  rightPumpkinsMin: 4,
  rightPumpkinsMax: 8,
  minWeight: 1,
  maxWeight: 12,
}

interface PumpkinData {
  id: number
  x: number
  y: number
  size: number
  weight: number
  side: "left" | "right" | null
  onSeesaw: boolean
  // 南瓜在跷跷板上的相对位置
  seesawPosition?: {
    distanceFromCenter: number // 距离中心点的距离，负值表示左侧
    baseY: number // 基础Y坐标（跷跷板水平时）
    slotIndex: number // 南瓜在跷跷板上的槽位索引
  }
}

export function PumpkinGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pumpkins, setPumpkins] = useState<PumpkinData[]>([])
  const [seesawAngle, setSeesawAngle] = useState(0)
  const [leftWeight, setLeftWeight] = useState(0)
  const [rightWeight, setRightWeight] = useState(0)
  const [gameMessage, setGameMessage] = useState("")
  const [showReward, setShowReward] = useState(false)
  const [showResetPrompt, setShowResetPrompt] = useState(false)
  const [isBalanced, setIsBalanced] = useState(false)
  const [hasShownReward, setHasShownReward] = useState(false)

  // 设置相关状态
  const [settings, setSettings] = useState<GameSettings>(defaultSettings)
  const [showSettings, setShowSettings] = useState(false)

  // 跷跷板上的槽位管理
  const [leftSlots, setLeftSlots] = useState<boolean[]>(Array(8).fill(false)) // 左侧8个槽位
  const [rightSlots, setRightSlots] = useState<boolean[]>(Array(8).fill(false)) // 右侧8个槽位

  // 获取移动设备信息
  const { isMobile, screenWidth, screenHeight } = useMobile()

  // 根据屏幕尺寸计算游戏尺寸和位置
  const gameScale = isMobile ? Math.min(screenWidth / 1000, screenHeight / 800) : 1

  // 跷跷板中心点坐标 - 根据设备类型调整
  const seesawCenterX = isMobile ? screenWidth / 2 : 500
  const seesawCenterY = isMobile ? screenHeight * 0.6 : 550

  // 生成随机南瓜
  const generateRandomPumpkins = () => {
    // 根据设置生成随机数量的左侧南瓜
    const leftCount = Math.floor(
      Math.random() * (settings.leftPumpkinsMax - settings.leftPumpkinsMin + 1) + settings.leftPumpkinsMin,
    )
    const leftPumpkins: PumpkinData[] = []

    // 调整南瓜位置计算，适应移动设备
    const calculatePumpkinPosition = (side: "left" | "right", index: number) => {
      const row = Math.floor(index / 3)
      const col = index % 3

      if (side === "left") {
        if (isMobile) {
          // 移动设备上左侧南瓜位置
          return {
            x: 60 + col * 60,
            y: 60 + row * 80,
          }
        } else {
          // 桌面设备上左侧南瓜位置
          return {
            x: 80 + col * 80,
            y: 80 + row * 100,
          }
        }
      } else {
        if (isMobile) {
          // 移动设备上右侧南瓜位置
          return {
            x: screenWidth - 60 - col * 60,
            y: 60 + row * 80,
          }
        } else {
          // 桌面设备上右侧南瓜位置
          return {
            x: 760 + col * 80,
            y: 80 + row * 100,
          }
        }
      }
    }

    for (let i = 0; i < leftCount; i++) {
      // 计算位置，确保南瓜不重叠
      const position = calculatePumpkinPosition("left", i)

      // 随机大小和重量 - 移动设备上南瓜稍小
      const size = isMobile
        ? 40 + Math.floor(Math.random() * 40)
        : // 40-80 移动设备
          60 + Math.floor(Math.random() * 60) // 60-120 桌面设备
      const weight = settings.minWeight + Math.floor(Math.random() * (settings.maxWeight - settings.minWeight + 1))

      leftPumpkins.push({
        id: i + 1,
        x: position.x,
        y: position.y,
        size,
        weight,
        side: "left",
        onSeesaw: false,
      })
    }

    // 根据设置生成随机数量的右侧南瓜
    const rightCount = Math.floor(
      Math.random() * (settings.rightPumpkinsMax - settings.rightPumpkinsMin + 1) + settings.rightPumpkinsMin,
    )
    const rightPumpkins: PumpkinData[] = []

    for (let i = 0; i < rightCount; i++) {
      // 计算位置，确保南瓜不重叠
      const position = calculatePumpkinPosition("right", i)

      // 随机大小和重量
      const size = isMobile
        ? 40 + Math.floor(Math.random() * 40)
        : // 移动设备
          60 + Math.floor(Math.random() * 60) // 桌面设备
      const weight = settings.minWeight + Math.floor(Math.random() * (settings.maxWeight - settings.minWeight + 1))

      rightPumpkins.push({
        id: leftCount + i + 1,
        x: position.x,
        y: position.y,
        size,
        weight,
        side: "right",
        onSeesaw: false,
      })
    }

    return [...leftPumpkins, ...rightPumpkins]
  }

  // Initialize pumpkins
  useEffect(() => {
    setPumpkins(generateRandomPumpkins())
  }, [screenWidth, screenHeight]) // 屏幕尺寸变化时重新生成南瓜

  // 找到下一个可用的槽位
  const findNextAvailableSlot = (side: "left" | "right") => {
    const slots = side === "left" ? leftSlots : rightSlots
    const setSlots = side === "left" ? setLeftSlots : setRightSlots

    // 找到第一个未被占用的槽位
    const index = slots.findIndex((slot) => !slot)

    if (index !== -1) {
      // 标记槽位为已占用
      const newSlots = [...slots]
      newSlots[index] = true
      setSlots(newSlots)
      return index
    }

    // 如果所有槽位都被占用，返回一个随机槽位（堆叠效果）
    return Math.floor(Math.random() * slots.length)
  }

  // Handle pumpkin click
  const handlePumpkinClick = (id: number) => {
    setPumpkins((prevPumpkins) => {
      const clickedPumpkin = prevPumpkins.find((pumpkin) => pumpkin.id === id)

      // 如果南瓜已经在跷跷板上，则将其移除
      if (clickedPumpkin && clickedPumpkin.onSeesaw) {
        // 释放槽位
        if (clickedPumpkin.side === "left" && clickedPumpkin.seesawPosition) {
          const newLeftSlots = [...leftSlots]
          newLeftSlots[clickedPumpkin.seesawPosition.slotIndex] = false
          setLeftSlots(newLeftSlots)
          // setLeftWeight((prev) => prev - clickedPumpkin.weight)
          setLeftWeight((prev) => leftWeight - clickedPumpkin.weight)
          setGameMessage(`从左侧移除了 ${clickedPumpkin.weight}公斤!`)
        } else if (clickedPumpkin.side === "right" && clickedPumpkin.seesawPosition) {
          const newRightSlots = [...rightSlots]
          newRightSlots[clickedPumpkin.seesawPosition.slotIndex] = false
          setRightSlots(newRightSlots)
          // setRightWeight((prev) => prev - clickedPumpkin.weight)
          setRightWeight((prev) => rightWeight - clickedPumpkin.weight)
          setGameMessage(`从右侧移除了 ${clickedPumpkin.weight}公斤!`)
        }

        // 计算返回位置 - 适应移动设备
        let returnX, returnY
        if (clickedPumpkin.side === "left") {
          // 返回左上角区域
          const index = clickedPumpkin.id - 1
          const row = Math.floor(index / 3)
          const col = index % 3

          if (isMobile) {
            returnX = 60 + col * 60
            returnY = 60 + row * 80
          } else {
            returnX = 80 + col * 80
            returnY = 80 + row * 100
          }
        } else {
          // 返回右上角区域
          const leftCount = prevPumpkins.filter((p) => p.side === "left").length
          const index = clickedPumpkin.id - leftCount - 1
          const row = Math.floor(index / 3)
          const col = index % 3

          if (isMobile) {
            returnX = screenWidth - 60 - col * 60
            returnY = 60 + row * 80
          } else {
            returnX = 760 + col * 80
            returnY = 80 + row * 100
          }
        }

        return prevPumpkins.map((pumpkin) => {
          if (pumpkin.id === id) {
            return {
              ...pumpkin,
              x: returnX,
              y: returnY,
              onSeesaw: false,
              seesawPosition: undefined,
            }
          }
          return pumpkin
        })
      }

      // 如果南瓜不在跷跷板上，则将其放到跷跷板上
      return prevPumpkins.map((pumpkin) => {
        if (pumpkin.id === id && !pumpkin.onSeesaw) {
          // 确定南瓜放置的槽位
          const side = pumpkin.side as "left" | "right"
          const slotIndex = findNextAvailableSlot(side)

          // 根据槽位计算距离中心点的距离 - 移动设备上距离更短
          let distanceFromCenter: number
          const seesawLength = isMobile ? 300 : 400

          if (side === "left") {
            // 左侧槽位，从外到内排列
            distanceFromCenter = -seesawLength * 0.85 + slotIndex * (seesawLength * 0.1)
            // setLeftWeight((prev) => prev + pumpkin.weight)
            setLeftWeight(() => leftWeight + pumpkin.weight)
            setGameMessage(`在左侧添加了 ${pumpkin.weight}公斤!`)
          } else {
            // 右侧槽位，从内到外排列
            distanceFromCenter = seesawLength * 0.85 - slotIndex * (seesawLength * 0.1)
            // setRightWeight((prev) => prev + pumpkin.weight)
            setRightWeight((prev) => rightWeight + pumpkin.weight)
            setGameMessage(`在右侧添加了 ${pumpkin.weight}公斤!`)
          }

          // 计算初始位置（跷跷板水平时）
          const baseX = seesawCenterX + distanceFromCenter
          // 根据槽位索引添加一些垂直偏移，创造堆叠效果
          const verticalOffset = (isMobile ? -30 : -40) - (slotIndex % 2) * (isMobile ? 5 : 10)
          const baseY = seesawCenterY + verticalOffset

          // 计算实际位置（考虑当前角度）
          const angleInRadians = (seesawAngle * Math.PI) / 180
          const offsetX = distanceFromCenter * Math.cos(angleInRadians) - verticalOffset * Math.sin(angleInRadians)
          const offsetY = distanceFromCenter * Math.sin(angleInRadians) + verticalOffset * Math.cos(angleInRadians)

          const newX = seesawCenterX + offsetX
          const newY = seesawCenterY + offsetY

          return {
            ...pumpkin,
            x: newX,
            y: newY,
            onSeesaw: true,
            seesawPosition: {
              distanceFromCenter,
              baseY,
              slotIndex,
            },
          }
        }
        return pumpkin
      })
    })
  }

  // 当跷跷板角度变化时，更新所有在跷跷板上的南瓜位置
  useEffect(() => {
    setPumpkins((prevPumpkins) => {
      return prevPumpkins.map((pumpkin) => {
        if (pumpkin.onSeesaw && pumpkin.seesawPosition) {
          const { distanceFromCenter, baseY } = pumpkin.seesawPosition

          // 计算新位置
          const angleInRadians = (seesawAngle * Math.PI) / 180
          const verticalOffset = baseY - seesawCenterY
          const offsetX = distanceFromCenter * Math.cos(angleInRadians) - verticalOffset * Math.sin(angleInRadians)
          const offsetY = distanceFromCenter * Math.sin(angleInRadians) + verticalOffset * Math.cos(angleInRadians)

          const newX = seesawCenterX + offsetX
          const newY = seesawCenterY + offsetY

          return { ...pumpkin, x: newX, y: newY }
        }
        return pumpkin
      })
    })
  }, [seesawAngle])

  // 检查是否平衡
  useEffect(() => {
    // 如果有南瓜在跷跷板上，且角度接近0，则认为平衡
    const hasSeesawPumpkins = pumpkins.some((p) => p.onSeesaw)
    const isNowBalanced = Math.abs(seesawAngle) < 3 && leftWeight > 0 && rightWeight > 0

    // 只有当状态从不平衡变为平衡时才触发奖励，并且之前没有显示过奖励
    if (isNowBalanced && !isBalanced && hasSeesawPumpkins && !hasShownReward) {
      setShowReward(true)
      setHasShownReward(true)
      setGameMessage("太棒了！你成功平衡了跷跷板！")

      // 3秒后显示重置提示
      setTimeout(() => {
        setShowResetPrompt(true)
      }, 3000)
    }

    setIsBalanced(isNowBalanced)
  }, [seesawAngle, leftWeight, rightWeight, pumpkins, isBalanced, hasShownReward])

  // Update seesaw angle based on weights
  useEffect(() => {
    const weightDifference = leftWeight - rightWeight
    const maxAngle = 30
    const newAngle = Math.max(Math.min(weightDifference * 2, maxAngle), -maxAngle)
    setSeesawAngle(newAngle)

    if (Math.abs(newAngle) < 5 && leftWeight > 0 && rightWeight > 0) {
      setGameMessage("太棒了！跷跷板几乎平衡了！")
    } else if (newAngle === maxAngle) {
      setGameMessage("左侧太重了！")
    } else if (newAngle === -maxAngle) {
      setGameMessage("右侧太重了！")
    }
  }, [leftWeight, rightWeight])

  // 继续游戏，关闭提示但不重置
  const continueGame = () => {
    setShowResetPrompt(false)
  }

  // 重置游戏
  const resetGame = () => {
    // 隐藏奖励和提示
    setShowReward(false)
    setShowResetPrompt(false)
    setIsBalanced(false)
    setHasShownReward(false)

    // 生成新的随机南瓜
    setPumpkins(generateRandomPumpkins())

    // 重置权重和槽位
    setLeftWeight(0)
    setRightWeight(0)
    setLeftSlots(Array(8).fill(false))
    setRightSlots(Array(8).fill(false))
    setGameMessage("点击南瓜将它们放在跷跷板上！")
  }

  // 应用设置并重新开始游戏
  const applySettings = (newSettings: GameSettings) => {
    setSettings(newSettings)
    setShowSettings(false)

    // 应用新设置并重置游戏
    setTimeout(() => {
      resetGame()
    }, 100)
  }

  // 计算跷跷板端点的位置（用于显示重量）
  const getSeesawEndPosition = (side: "left" | "right") => {
    const distance = side === "left" ? (isMobile ? -300 : -400) : isMobile ? 300 : 400
    const angleInRadians = (seesawAngle * Math.PI) / 180

    // 计算端点位置
    const x = seesawCenterX + distance * Math.cos(angleInRadians)
    const y = seesawCenterY + distance * Math.sin(angleInRadians)

    return { x, y }
  }

  // 获取左右端点位置
  const leftEndPos = getSeesawEndPosition("left")
  const rightEndPos = getSeesawEndPosition("right")

  // 根据选择的样式获取跷跷板的样式
  const getSeesawStyles = () => {
    switch (settings.seesawStyle) {
      case "modern":
        return {
          board: "bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700",
          base: "bg-gray-800",
          pivot: "bg-gray-900",
          endCaps: "bg-gray-800",
          slotEmpty: "bg-gray-500 opacity-50",
          slotFilled: "bg-gray-800",
          weightDisplay: "bg-gray-800",
        }
      case "playful":
        return {
          board: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
          base: "bg-indigo-800",
          pivot: "bg-indigo-600",
          endCaps: "bg-pink-600",
          slotEmpty: "bg-yellow-400 opacity-50",
          slotFilled: "bg-yellow-600",
          weightDisplay: "bg-indigo-600",
        }
      case "classic":
      default:
        return {
          board: "bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700",
          base: "bg-amber-950",
          pivot: "bg-amber-900",
          endCaps: "bg-amber-800",
          slotEmpty: "bg-amber-500 opacity-50",
          slotFilled: "bg-amber-800",
          weightDisplay: "bg-amber-800",
        }
    }
  }

  const seesawStyles = getSeesawStyles()

  // 计算跷跷板尺寸 - 移动设备上更小
  const seesawWidth = isMobile ? 600 : 800
  const seesawHeight = isMobile ? 30 : 40

  return (
    <div className="relative w-full h-full">
      {/* 设置按钮 */}
      <div className="absolute top-4 right-4 z-40">
        <button
          className="bg-amber-600 hover:bg-amber-700 text-white rounded-full p-2 shadow-lg transition-colors"
          onClick={() => setShowSettings(true)}
        >
          <Cog className="w-6 h-6" />
        </button>
      </div>

      {/* Game message */}
      <div className="absolute top-4 left-0 right-0 text-center">
        <div className="inline-block bg-white px-4 py-2 rounded-full shadow-md text-lg font-bold text-orange-800">
          {gameMessage || "点击南瓜将它们放在跷跷板上！"}
        </div>
      </div>

      {/* 跷跷板 */}
      <div
        className="absolute left-0 right-0 flex justify-center items-center"
        style={{ top: isMobile ? `${seesawCenterY}px` : "550px" }}
      >
        {/* 跷跷板底座 */}
        <div className="relative">
          {/* 支点底座 */}
          <div
            className={`absolute left-1/2 bottom-0 ${seesawStyles.base} rounded-md transform -translate-x-1/2`}
            style={{
              width: isMobile ? "80px" : "100px",
              height: isMobile ? "20px" : "30px",
            }}
          ></div>

          {/* 三角形支点 */}
          <div
            className={`absolute left-1/2 ${seesawStyles.pivot} rounded-md transform -translate-x-1/2 rotate-45`}
            style={{
              bottom: isMobile ? "20px" : "30px",
              width: isMobile ? "40px" : "60px",
              height: isMobile ? "40px" : "60px",
            }}
          ></div>

          {/* 跷跷板木板 */}
          <div
            className={`relative ${seesawStyles.board} rounded-lg shadow-lg transform origin-center transition-transform duration-1000`}
            style={{
              width: `${seesawWidth}px`,
              height: `${seesawHeight}px`,
              transform: `rotate(${seesawAngle}deg)`,
            }}
          >
            {/* 跷跷板纹理 */}
            <div className="absolute inset-0 flex justify-between px-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="w-[2px] h-full bg-black opacity-10"></div>
              ))}
            </div>

            {/* 跷跷板左右端点标记 */}
            <div
              className={`absolute left-0 top-0 ${seesawStyles.endCaps} rounded-l-lg`}
              style={{
                width: isMobile ? "40px" : "50px",
                height: `${seesawHeight}px`,
              }}
            ></div>
            <div
              className={`absolute right-0 top-0 ${seesawStyles.endCaps} rounded-r-lg`}
              style={{
                width: isMobile ? "40px" : "50px",
                height: `${seesawHeight}px`,
              }}
            ></div>

            {/* 左侧放置区域指示 */}
            <div
              className="absolute left-0 top-[-15px] flex justify-between"
              style={{
                width: isMobile ? "240px" : "300px",
                left: isMobile ? "40px" : "50px",
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full ${leftSlots[i] ? seesawStyles.slotFilled : seesawStyles.slotEmpty}`}
                  style={{
                    width: isMobile ? "15px" : "20px",
                    height: isMobile ? "8px" : "10px",
                  }}
                />
              ))}
            </div>

            {/* 右侧放置区域指示 */}
            <div
              className="absolute right-0 top-[-15px] flex justify-between"
              style={{
                width: isMobile ? "240px" : "300px",
                right: isMobile ? "40px" : "50px",
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full ${rightSlots[i] ? seesawStyles.slotFilled : seesawStyles.slotEmpty}`}
                  style={{
                    width: isMobile ? "15px" : "20px",
                    height: isMobile ? "8px" : "10px",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 左侧重量显示 - 移至跷跷板左端 */}
      <div
        className="absolute flex items-center justify-center z-30"
        style={{
          left: `${leftEndPos.x - (isMobile ? 20 : 30)}px`,
          top: `${leftEndPos.y - (isMobile ? 20 : 30)}px`,
          transform: `rotate(${seesawAngle}deg)`,
          transition: "left 0.5s ease-out, top 0.5s ease-out, transform 0.5s ease-out",
        }}
      >
        <div
          className={`${seesawStyles.weightDisplay} text-white font-bold px-3 py-2 rounded-full shadow-lg text-center`}
          style={{
            minWidth: isMobile ? "60px" : "80px",
            fontSize: isMobile ? "14px" : "16px",
          }}
        >
          {leftWeight}公斤
        </div>
      </div>

      {/* 右侧重量显示 - 移至跷跷板右端 */}
      <div
        className="absolute flex items-center justify-center z-30"
        style={{
          left: `${rightEndPos.x - (isMobile ? 20 : 30)}px`,
          top: `${rightEndPos.y - (isMobile ? 20 : 30)}px`,
          transform: `rotate(${seesawAngle}deg)`,
          transition: "left 0.5s ease-out, top 0.5s ease-out, transform 0.5s ease-out",
        }}
      >
        <div
          className={`${seesawStyles.weightDisplay} text-white font-bold px-3 py-2 rounded-full shadow-lg text-center`}
          style={{
            minWidth: isMobile ? "60px" : "80px",
            fontSize: isMobile ? "14px" : "16px",
          }}
        >
          {rightWeight}公斤
        </div>
      </div>

      {/* 重置按钮 - 移到跷跷板下方 */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2"
        style={{ top: isMobile ? `${seesawCenterY + 100}px` : "650px" }}
      >
        <button
          className="px-6 py-3 bg-orange-500 text-white rounded-full font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg"
          onClick={resetGame}
        >
          重新开始
        </button>
      </div>

      {/* 平衡奖励动画 */}
      {showReward && <BalanceReward />}

      {/* 重置游戏提示 */}
      {showResetPrompt && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md text-center">
            <h2 className="text-2xl font-bold text-orange-800 mb-4">恭喜你！</h2>
            <p className="text-lg text-gray-700 mb-6">你成功地平衡了跷跷板！你想要开始新的挑战吗？</p>
            <div className="flex justify-center space-x-4">
              <button
                className="px-6 py-2 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition-colors"
                onClick={resetGame}
              >
                开始新游戏
              </button>
              <button
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-full font-bold hover:bg-gray-400 transition-colors"
                onClick={continueGame}
              >
                继续游戏
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 设置对话框 */}
      {showSettings && (
        <Settings currentSettings={settings} onApply={applySettings} onCancel={() => setShowSettings(false)} />
      )}

      {/* Pumpkins */}
      {pumpkins.map((pumpkin) => (
        <Pumpkin
          key={pumpkin.id}
          id={pumpkin.id}
          x={pumpkin.x}
          y={pumpkin.y}
          size={pumpkin.size}
          weight={pumpkin.weight}
          onSeesaw={pumpkin.onSeesaw}
          slotIndex={pumpkin.seesawPosition?.slotIndex}
          colorPreset={settings.colorPreset}
          onClick={() => handlePumpkinClick(pumpkin.id)}
          isMobile={isMobile}
        />
      ))}
    </div>
  )
}
