'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EmailDialog from '@/components/EmailDialog'; // 確認路徑
import { Button } from '@/components/ui/button';

export default function AnnouncementPage() {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>網站公告</CardTitle>
        </CardHeader>
        <CardContent>
          <p>這裡是網站公告內容，您可以放置最新消息或更新。</p>
        </CardContent>
      </Card>

      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>站長的話</CardTitle>
        </CardHeader>
        <CardContent>
          <p>這裡可以放置站長的話，介紹網站理念或其他訊息。</p>
        </CardContent>
      </Card>

      <Card className="w-full max-w-3xl">
        <CardHeader>
            <CardTitle>EMAIL 功能</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center space-y-4">
            <p>這裡可以放置說明 EMAIL 等內容。</p>
            <Button variant="outline" onClick={() => setOpenDialog(true)}>
                聯絡我們
            </Button>
            <EmailDialog open={openDialog} setOpen={setOpenDialog} />
            </div>
        </CardContent>
        </Card>
    </div>
  );
}
