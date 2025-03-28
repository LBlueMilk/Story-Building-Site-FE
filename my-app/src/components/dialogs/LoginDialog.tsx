'use client';

import { useState, Dispatch, SetStateAction, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { login } from '@/services/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TokenService } from '@/services/tokenService';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { CustomInput } from '@/components/ui/CustomInput';



interface LoginDialogProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    openRegister: () => void;
}

export default function LoginDialog({ open, setOpen, openRegister }: LoginDialogProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setToken, setUser } = useAuth();
    const [rememberEmail, setRememberEmail] = useState(false);

    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberEmail(true);
        }
    }, []);

    const handleLogin = async () => {
        if (email.trim() === '' || password.trim() === '') {
            toast.error('請輸入 Email 與密碼');
            return;
        }

        setLoading(true);

        try {
            const response = await login({
                email: email.trim().toLowerCase(),
                password: password,
            });

            const { accessToken, refreshToken, user } = response.data;

            TokenService.setTokens(accessToken, refreshToken);

            setUser(user);
            setToken(accessToken);

            // 記住信箱
            if (rememberEmail) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            setOpen(false);

            if (!rememberEmail) {
                setEmail('');
            }
            setPassword('');

            setPassword('');
            toast.success('登入成功');
            router.push('/');
        } catch (err: any) {
            const message = err?.response?.data?.message;
            let finalMessage = '登入失敗，請稍後再試';

            if (message === '登入失敗，請檢查您的帳號或密碼') {
                finalMessage = '帳號或密碼錯誤，請再試一次';
            } else if (message === '帳戶已鎖定，請稍後再試。') {
                finalMessage = '您的帳號已被鎖定，請稍後再試';
            } else if (message === '此帳戶無法使用密碼登入，請使用 OAuth 或重設密碼') {
                finalMessage = '此帳號僅支援第三方登入，請使用 Google 或 Facebook';
            } else if (message === 'Email 和密碼不能為空') {
                finalMessage = '請輸入 Email 與密碼';
            } else if (typeof message === 'string') {
                finalMessage = message;
            }

            toast.dismiss('login-error');
            toast.error(finalMessage, { id: 'login-error' });
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>登入</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleLogin();
                        }}
                        className="flex flex-col items-center w-full"
                    >
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
                        <div className="flex items-center mt-2 w-full">
                            <input
                                type="checkbox"
                                id="rememberEmail"
                                checked={rememberEmail}
                                onChange={(e) => setRememberEmail(e.target.checked)}
                                className="mr-2"
                            />
                            <label htmlFor="rememberEmail" className="text-sm text-gray-600">
                                記住 Email
                            </label>
                        </div>
                        <div className="relative w-full m-2">
                            <CustomInput
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
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
                            className="bg-blue-500 text-white px-4 py-2 mt-2 w-full disabled:opacity-50"
                        >
                            {loading ? '登入中...' : '確認登入'}
                        </button>
                    </form>

                    <div className="flex justify-between items-center w-full px-2 mt-2 text-sm text-blue-500">
                        <button onClick={openRegister} className="hover:underline">
                            還沒有帳號嗎？註冊
                        </button>
                        <button
                            onClick={() => toast.info('忘記密碼功能尚未實作')}
                            className="hover:underline"
                        >
                            忘記密碼？
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
