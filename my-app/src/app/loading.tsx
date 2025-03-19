'use client';

import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Loader2 className="animate-spin w-12 h-12 text-primary" />
    </div>
  );
}
