'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { StoryType, StoryResponse } from '@/types/story';
import { useStory } from '@/context/StoryContext';
import api from '@/services/api';
import { updateStory } from '@/services/story.client';

interface StoryDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  initialStory?: StoryResponse | null;
  onUpdate?: () => void;
}

export default function StoryDialog({ open, setOpen, initialStory = null, onUpdate }: StoryDialogProps) {
  const isEditMode = initialStory !== null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();
  const { fetchStories } = useStory();

  useEffect(() => {
    if (isEditMode && initialStory) {
      setTitle(initialStory.title);
      setDescription(initialStory.description ?? '');
      setIsPublic(initialStory.isPublic);
    }
  }, [initialStory, isEditMode]);

  const handleSubmit = async () => {
    if (title.trim() === '') {
      toast.error('故事標題不能為空');
      return;
    }

    try {
      setLoading(true);

      if (isEditMode && initialStory) {
        // 更新故事
        await updateStory(initialStory.id, {
          title: title.trim(),
          description: description.trim() || null,
          isPublic,
        });

        toast.success('故事更新成功 ✅');
        onUpdate?.();
        setOpen(false);
      } else {
        // 建立故事
        const payload = {
          title: title.trim(),
          description: description.trim() || null,
          isPublic,
        };

        const response = await api.post<StoryType>('/story', payload);
        if (response.status === 201 || response.status === 200) {
          toast.success('故事建立成功 🎉');
          if (user) {
            const updatedUser = {
              ...user,
              stories: [...(user.stories ?? []), response.data],
            };
            setUser(updatedUser);
          }
          await fetchStories();
          setTitle('');
          setDescription('');
          setIsPublic(false);
          setOpen(false);
        } else {
          toast.error('故事建立失敗');
        }
      }
    } catch (error: any) {
      toast.error(error.message || '操作失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isEditMode ? '編輯故事' : '建立新故事'}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto scrollbar-thin">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="grid gap-5 py-2">
            <div className="grid gap-3">
              <Label htmlFor="title">標題</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="請輸入故事標題"
                maxLength={255}
                className="h-10"
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="描述內容 (可選)"
                maxLength={5000}
                rows={4}
                className="resize-none overflow-y-auto max-h-80"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>是否公開</Label>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? (isEditMode ? '更新中...' : '建立中...') : (isEditMode ? '儲存變更' : '送出')}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
