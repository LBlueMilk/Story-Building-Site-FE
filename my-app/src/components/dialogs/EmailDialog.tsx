'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/services/api';

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
      await api.post('/contact/send', {
        Name: name,
        Email: email,
        Message: message
      });

      toast.success('訊息已成功寄出！');
      // 清空表單
      setName('');
      setEmail('');
      setMessage('');
      setOpen(false);
    } catch (error: any) {
      console.error('發送失敗:', error);

      const errorData = error?.response?.data;

      let errorMessage =
        errorData?.error ||
        errorData?.message ||
        errorData?.title ||
        error?.message ||
        '發送失敗，請稍後再試';

      if (errorData?.errors && typeof errorData.errors === 'object') {
        const firstKey = Object.keys(errorData.errors)[0];
        if (firstKey && Array.isArray(errorData.errors[firstKey])) {
          errorMessage = errorData.errors[firstKey][0];
        }
      }

      toast.dismiss('email-error');
      toast.error(errorMessage, { id: 'email-error' });
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
