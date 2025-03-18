'use client';

import { useState, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../app/context/AuthContext';
import { login } from '../app/services/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface LoginDialogProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    openRegister: () => void;
}

export default function LoginDialog({ open, setOpen, openRegister }: LoginDialogProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { setToken } = useAuth();

    const handleLogin = async () => {
        try {
            const response = await login({ email, password });
            const { accessToken } = response.data;
            setToken(accessToken);
            setOpen(false);
            router.push('/');
        } catch (err) {
            // 已經透過 Interceptor 統一處理錯誤
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>登入</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center">
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="m-2 w-full"
                    />

                    <input
                        className="border p-2 m-2 w-full"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 mt-2 w-full">
                        確認登入
                    </button>
                    <button onClick={openRegister} className="text-blue-500 mt-2">
                        還沒有帳號嗎？註冊
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
