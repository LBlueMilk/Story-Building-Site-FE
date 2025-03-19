'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-4xl font-bold mb-4">找不到頁面</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        很抱歉，您要查看的頁面不存在或已被移除。
      </p>
      <Link href="/">
        <Button variant="secondary" className="px-6 py-2">
          返回首頁
        </Button>
      </Link>
    </div>
  );
}
