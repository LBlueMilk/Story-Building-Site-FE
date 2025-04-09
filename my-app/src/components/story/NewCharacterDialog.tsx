'use client';

import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  onSubmit: (name: string, desc: string) => void;
}

export default function NewCharacterDialog({ onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    onSubmit(name.trim(), desc.trim());
    setName('');
    setDesc('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-2 w-full" variant="outline">➕ 新增角色</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增角色</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="角色名稱" value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea placeholder="角色簡介" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={handleCreate}>新增</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
