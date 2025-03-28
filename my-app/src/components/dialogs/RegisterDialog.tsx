'use client';

import { useState, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/services/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { CustomInput } from '@/components/ui/CustomInput'; // 引入 CustomInput

interface RegisterDialogProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    openLogin: () => void;
}

export default function RegisterDialog({ open, setOpen, openLogin }: RegisterDialogProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setToken, setUser } = useAuth();

    const handleRegister = async () => {
        try {
            setLoading(true);
            const response = await register({ email, password, name });
            const { accessToken, refreshToken, user } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            setUser(user);
            setToken(accessToken);
            setOpen(false);
            setName('');
            setEmail('');
            setPassword('');
            toast.success('註冊成功 🎉 請盡早至信箱驗證帳號');
            router.push('/');
        } catch (err: any) {
            const rawMessage = err?.response?.data?.message;
            const finalMessage =
                typeof rawMessage === 'string' ? rawMessage : '註冊失敗，請稍後再試';
            toast.dismiss('register-error');
            toast.error(finalMessage, { id: 'register-error' });
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>註冊</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleRegister();
                        }}
                        className="flex flex-col items-center w-full"
                    >
                        <CustomInput
                            type="text"
                            placeholder="名稱"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            minLength={2}
                            className="m-2 w-full"
                            onInvalid={(e) => e.currentTarget.setCustomValidity('請輸入有效的名稱')}
                            onInput={(e) => e.currentTarget.setCustomValidity('')}
                        />
                        <CustomInput
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="m-2 w-full"
                            onInvalid={(e) => e.currentTarget.setCustomValidity('請輸入有效的 Email')}
                            onInput={(e) => e.currentTarget.setCustomValidity('')}
                        />
                        <div className="relative w-full m-2">
                            <CustomInput
                                type={showPassword ? 'text' : 'password'}
                                placeholder="密碼"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="border p-2 w-full pr-10"
                                onInvalid={(e) => e.currentTarget.setCustomValidity('密碼至少需要 6 個字')}
                                onInput={(e) => e.currentTarget.setCustomValidity('')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-500 text-white px-4 py-2 mt-2 w-full disabled:opacity-50"
                        >
                            {loading ? '註冊中...' : '確認註冊'}
                        </button>
                    </form>

                    <div className="flex justify-center mt-2">
                        <button onClick={openLogin} className="text-blue-500 hover:underline text-sm">
                            已有帳號嗎？登入
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
