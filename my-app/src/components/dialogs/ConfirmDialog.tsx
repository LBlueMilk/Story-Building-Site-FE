'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import { useStory } from "@/context/StoryContext";

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
}: {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  description: string
}) {
  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onCancel}>取消</Button>
          </DialogClose>
          <Button onClick={onConfirm}>確認</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
