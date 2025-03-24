'use client';

import { useState, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '../../app/services/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '../../app/context/AuthContext';
import { toast } from 'sonner';

interface RegisterDialogProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    openLogin: () => void;
}

export default function RegisterDialog({ open, setOpen, openLogin }: RegisterDialogProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const router = useRouter();
    const { setToken, setUser } = useAuth();

    const handleRegister = async () => {
        try {
            const response = await register({ email, password, name });
            const { accessToken, refreshToken, user } = response.data;
    
            // 儲存 Token
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
    
            setUser(user);
            setToken(accessToken);                       
            setOpen(false);
            toast.success('註冊成功 🎉 請盡早至信箱驗證帳號');
            router.push('/');
        } catch (err) {
            // 錯誤透過 Interceptor 已處理
        }
    };
    

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>註冊</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center">
                    <input
                        className="border p-2 m-2 w-full"
                        type="text"
                        placeholder="名稱"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        className="border p-2 m-2 w-full"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="border p-2 m-2 w-full"
                        type="password"
                        placeholder="密碼"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleRegister} className="bg-green-500 text-white px-4 py-2 mt-2 w-full">
                        確認註冊
                    </button>
                    <button onClick={openLogin} className="text-blue-500 mt-2">
                        已有帳號嗎？登入
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
