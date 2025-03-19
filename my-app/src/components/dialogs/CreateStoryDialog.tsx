"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import axios from "@/app/services/api";

export default function CreateStoryDialog() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

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

      const response = await axios.post("/api/story", payload);

      toast.success("故事建立成功");

      // 成功後可選擇刷新或跳轉
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "建立失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="px-3 h-8">建立故事</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>建立新故事</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label>標題</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="請輸入故事標題"
              maxLength={255}
            />
          </div>
          <div>
            <Label>描述</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述內容 (可選)"
              maxLength={5000}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>是否公開</Label>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
          <Button onClick={handleCreateStory} disabled={loading}>
            {loading ? "建立中..." : "送出"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
