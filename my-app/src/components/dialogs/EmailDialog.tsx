'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from 'sonner';


interface EmailDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function EmailDialog({ open, setOpen }: EmailDialogProps) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 呼叫後端 API
      await axios.post('https://localhost:7276/api/contact/send', {
        name,
        email,
        message
      });

      toast.success('訊息已成功寄出！');
      // 清空表單
      setName('');
      setEmail('');
      setMessage('');
      setOpen(false);
    } catch (error) {
      console.error('發送失敗:', error);
      toast.dismiss('email-error'); // 關掉舊的錯誤提示
      toast.error('發送失敗，請稍後再試', { id: 'email-error' }); // 限制只顯示一次
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white dark:bg-neutral-900 text-black dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold">聯絡我們</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <Input
            placeholder="姓名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Textarea
            placeholder="有什麼問題呢?"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? '寄送中...' : '送出'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
