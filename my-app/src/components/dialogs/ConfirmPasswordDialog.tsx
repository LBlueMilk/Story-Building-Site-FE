'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { verifyPassword } from '@/services/auth';
import { toastError, toastSuccess } from '@/lib/toastUtils';

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
        if (!password) {
            toast.error('請輸入密碼');
            return;
        }

        setIsVerifying(true);

        try {
            await verifyPassword(password); // 呼叫驗證 API
            toastSuccess('密碼驗證成功');
            setOpen(false);
            onVerified(); // 通知 Profile 執行更新
        } catch (err: any) {
            console.log("⚠️ 進入 catch 區塊");

            let finalMessage = '密碼驗證失敗，請重新輸入';

            try {
                const resData = err?.response?.data;

                if (resData) {
                    if (typeof resData === 'string') {
                        finalMessage = resData;
                    } else if (typeof resData?.message === 'string') {
                        finalMessage = resData.message;
                    } else if (typeof resData?.title === 'string') {
                        finalMessage = resData.title;
                    } else {
                        finalMessage = JSON.stringify(resData);
                    }
                } else if (err?.message) {
                    finalMessage = err.message;
                }
            } catch (parseErr) {
                console.warn('錯誤訊息解析失敗:', parseErr);
            }

            if (!finalMessage || finalMessage.trim() === '') {
                finalMessage = '密碼驗證失敗，請重新輸入';
            }

            console.error('密碼驗證失敗:', err);
            console.log('toast 預備顯示:', finalMessage);
            toast.error(finalMessage || '密碼驗證失敗');
        }
        finally {
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
