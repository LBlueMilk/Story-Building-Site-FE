"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuth, } from "@/context/AuthContext";
import { StoryType } from "@/types/story";

interface CreateStoryDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}



export default function CreateStoryDialog({ open, setOpen }: CreateStoryDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();

  const handleCreateStory = async () => {
    if (title.trim() === "") {
      toast.error("故事標題不能為空");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        isPublic,
      };

      const response = await api.post<StoryType>("/story", payload);

      if (response.status === 201 || response.status === 200) {
        toast.success("故事建立成功 🎉");
        // 更新使用者資料
        const newStory: StoryType = response.data;

        if (user) {
          const updatedUser = {
            ...user,
            stories: [...(user.stories ?? []), newStory],
          };
          setUser(updatedUser);
        }
        // 清空欄位
        setTitle("");
        setDescription("");
        setIsPublic(false);
        setOpen(false);
      } else {
        toast.dismiss('story-error');
        toast.error("故事建立失敗", { id: 'story-error' });
      }

    } catch (error) {
      console.error(error);
      toast.dismiss('story-error');
      toast.error("故事建立失敗，請稍後再試", { id: 'story-error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="px-3 h-8">建立故事</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">建立新故事</DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto scrollbar-thin">
          <form onSubmit={(e) => { e.preventDefault(); handleCreateStory(); }} className="grid gap-5 py-2">
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
              {loading ? "建立中..." : "送出"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
