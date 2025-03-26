'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { verifyPassword } from '@/services/auth';

interface ConfirmPasswordDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    onVerified: () => void;
}

export default function ConfirmPasswordDialog({
    open,
    setOpen,
    onVerified,
}: ConfirmPasswordDialogProps) {
    const [password, setPassword] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = async () => {
        setIsVerifying(true);
        try {
            await verifyPassword(password); // 呼叫驗證 API
            toast.success('密碼驗證成功');
            setOpen(false);
            onVerified(); // 通知 Profile 執行更新
        } catch (err: any) {
            const message = err.response?.data?.message || '密碼驗證失敗，請重新輸入';
            toast.error(message);
        } finally {
            setIsVerifying(false);
            setPassword('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>請輸入密碼驗證身份</DialogTitle>
                </DialogHeader>
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="請輸入密碼"
                    disabled={isVerifying}
                />
                <DialogFooter>
                    <Button onClick={handleVerify} disabled={isVerifying || !password}>
                        {isVerifying ? '驗證中...' : '確認'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
