import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '🎃南瓜跷跷板 & 南瓜平衡游戏 - 嘻嘻IT',
  description: '一个寓教于乐的互动小游戏，帮助儿童通过点击选择南瓜到跷跷板两侧，直观地理解重量与数字大小的关系。点击左侧或者右侧上方的南瓜，南瓜会掉落到左侧或者右侧对应的跷跷板上，跷跷板会平滑的弹起或者落下，通过调准南瓜的数量，使跷跷板达到平衡，最终获得游戏的成功。',
  generator: '11meigui.com',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
         <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0" />
      </head>
      <body>
      <header className='header'>
  <nav>
    <div className='logo'>
      🎃 南瓜跷跷板
    </div>
    <a href="https://github.com/hotseo123/pumpkin-seesaw" target="_blank" className='github'>
      ⭐ 查看源码 on GitHub
    </a>
  </nav>
</header>
        {children}
        <footer className='copyright'>
        © 2025 Seesaw Game. Created by <a href="https://www.11meigui.com/">嘻嘻IT</a>
        </footer>
      </body>
    </html>
  )
}
