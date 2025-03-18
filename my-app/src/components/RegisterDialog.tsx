'use client';

import { useState, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '../app/services/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RegisterDialogProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    openLogin: () => void;
}

export default function RegisterDialog({ open, setOpen, openLogin }: RegisterDialogProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleRegister = async () => {
        try {
            await register({ email, password });
            setOpen(false);
            router.push('/login');
            openLogin();
        } catch (err) {

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
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="border p-2 m-2 w-full"
                        type="password"
                        placeholder="Password"
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
