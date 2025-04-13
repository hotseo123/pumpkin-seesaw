"use client"

import { useEffect, useState } from "react"
import { useMobile } from "@/hooks/use-mobile"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  speedX: number
  speedY: number
  rotation: number
  rotationSpeed: number
}

export function BalanceReward() {
  const [particles, setParticles] = useState<Particle[]>([])
  const { isMobile, screenWidth, screenHeight } = useMobile()

  // 生成随机颜色
  const getRandomColor = () => {
    const colors = [
      "#FFD700", // 金色
      "#FFA500", // 橙色
      "#FF4500", // 红橙色
      "#FF6347", // 番茄色
      "#FF8C00", // 深橙色
      "#FFB6C1", // 浅粉色
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // 初始化粒子
  useEffect(() => {
    const newParticles: Particle[] = []

    // 创建粒子数量 - 移动设备上减少粒子数量
    const particleCount = isMobile ? 30 : 50

    // 从屏幕中心发射
    const centerX = screenWidth / 2
    const centerY = screenHeight / 2

    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
      // 随机速度和方向
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 4

      // 移动设备上粒子更小
      const particleSize = isMobile
        ? 5 + Math.random() * 15
        : // 移动设备
          10 + Math.random() * 20 // 桌面设备

      newParticles.push({
        id: i,
        x: centerX,
        y: centerY,
        size: particleSize,
        color: getRandomColor(),
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        rotation: Math.random() * 360,
        rotationSpeed: -5 + Math.random() * 10,
      })
    }

    setParticles(newParticles)

    // 创建星星动画
    const interval = setInterval(() => {
      setParticles((prevParticles) => {
        return prevParticles
          .map((particle) => {
            // 更新位置
            const x = particle.x + particle.speedX
            const y = particle.y + particle.speedY

            // 更新旋转
            const rotation = particle.rotation + particle.rotationSpeed

            // 减小速度（模拟重力和阻力）
            const speedX = particle.speedX * 0.98
            const speedY = particle.speedY * 0.98 + 0.1 // 添加一点重力

            // 减小尺寸（模拟消失）
            const size = particle.size * 0.99

            return {
              ...particle,
              x,
              y,
              rotation,
              speedX,
              speedY,
              size,
            }
          })
          .filter((particle) => particle.size > 0.5) // 移除太小的粒子
      })
    }, 16) // 约60fps

    // 5秒后清除动画
    const timeout = setTimeout(() => {
      clearInterval(interval)
      setParticles([])
    }, 5000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isMobile, screenWidth, screenHeight])

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* 星星粒子 */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: "50%",
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.size / 30, // 随着尺寸减小而变透明
          }}
        />
      ))}

      {/* 中央闪光效果 */}
      <div
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
        style={{
          width: isMobile ? "120px" : "160px",
          height: isMobile ? "120px" : "160px",
          background: "radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,215,0,0) 70%)",
        }}
      />

      {/* 文字提示 */}
      <div className="absolute left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2">
        <div className={`font-bold text-yellow-500 animate-bounce shadow-text ${isMobile ? "text-3xl" : "text-4xl"}`}>
          平衡成功！
        </div>
      </div>
    </div>
  )
}
