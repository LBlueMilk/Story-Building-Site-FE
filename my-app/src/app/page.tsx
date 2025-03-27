'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      {/* Hero 區塊 */}
      <section
        className="relative bg-gray-900 text-white py-24 text-center px-4 bg-fixed"
        style={{
          backgroundImage: "url('/hero-background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* 模糊漸層遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/40 backdrop-blur-sm" />
        <motion.div
          className="relative z-10 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            為你的 <span className="text-primary">故事</span>，建構一個 <span className="text-primary">世界</span>
          </h1>
          <p className="text-lg md:text-xl mb-4">
            整合角色管理、時間軸編排與自由畫布，一站式提升你的創作效率。
          </p>
          <p className="text-sm text-gray-300 mb-8">
            從混亂的創意筆記，走向有結構的小說宇宙。
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className="text-lg px-6 py-4"
              onClick={() => router.push('/register')}
            >
              🚀 立即加入，開始創作
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll Down 提示 */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        >
          <p className="text-sm text-gray-300">向下滑動了解更多</p>
          <div className="animate-bounce mt-1">
            <div className="w-6 h-6 border-b-2 border-r-2 border-white transform rotate-45 mx-auto" />
          </div>
        </motion.div>
      </section>

      {/* 功能區塊 */}
      <section className="py-16 px-4 bg-white text-center">
        <h2 className="text-3xl font-semibold mb-10">我們提供的功能</h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: '📘 角色管理',
              desc: '記錄角色背景、關係與設定，支援標籤與分類。',
              img: '/feature-character.png',
              alt: '角色管理',
              delay: 0.1,
            },
            {
              title: '📅 視覺化時間軸',
              desc: '事件以時間軸方式排列，幫助你掌握故事脈絡。',
              img: '/feature-timeline.png',
              alt: '時間軸',
              delay: 0.2,
            },
            {
              title: '🗺️ 自由畫布',
              desc: '繪製地圖、標記場景、支援手繪與便條互動。',
              img: '/feature-canvas.png',
              alt: '自由畫布',
              delay: 0.3,
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-transform hover:-translate-y-1"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: item.delay }}
            >
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Image
                  src={item.img}
                  alt={item.alt}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA 區塊 */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-100 text-center">
        <motion.h2
          className="text-2xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          準備好開始打造你的小說宇宙了嗎？
        </motion.h2>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            className="text-lg px-6 py-4"
            onClick={() => router.push('/register')}
          >
            ✍️ 立即開始
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
