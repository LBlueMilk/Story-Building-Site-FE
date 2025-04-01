'use client';

import { useState, Dispatch, SetStateAction, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { login, restoreAccount } from '@/services/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TokenService } from '@/services/tokenService';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { CustomInput } from '@/components/ui/CustomInput';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { UserType } from '@/types/user';



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
    const [rememberEmail, setRememberEmail] = useState(false);
    const [showRestoreDialog, setShowRestoreDialog] = useState(false);
    const [restoreNotified, setRestoreNotified] = useState(false);
    const [pendingUser, setPendingUser] = useState<UserType | null>(null);
    const [pendingToken, setPendingToken] = useState<string | null>(null);
    const router = useRouter();
    const { setToken, setUser } = useAuth();

    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberEmail(true);
        }
    }, []);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            toast.error('請輸入 Email 與密碼');
            return;
        }

        // 清除之前的錯誤提示
        setRestoreNotified(false);
        setLoading(true);

        try {
            // 解構完整登入資訊
            const { accessToken, refreshToken, user } = await login({
                email: email.trim().toLowerCase(),
                password,
            });

            // 若帳號已刪除，提示還原
            if (user.deleted_at) {
                setPendingUser(user);
                setPendingToken(accessToken);
                setShowRestoreDialog(true);
                return;
            }

            TokenService.setTokens(accessToken, refreshToken);
            setToken(accessToken);
            setUser(user);

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

            toast.success('登入成功');
            router.push('/profile');
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
        <>
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

            {/* 彈出恢復帳號的對話框 */}
            <ConfirmDialog
                open={showRestoreDialog}
                title="帳號已被刪除"
                description="您的帳號目前處於刪除狀態，是否要立即恢復？"
                onCancel={() => {
                    setShowRestoreDialog(false);
                    if (!restoreNotified) {
                        setRestoreNotified(true);
                        toast.info('您尚未恢復帳號，無法登入系統', { id: 'restore-info' });
                    }
                }}
                onConfirm={async () => {
                    if (!pendingUser || !pendingToken) {
                        toast.error('登入資料遺失，請重新登入');
                        setShowRestoreDialog(false);
                        return;
                    }
                    try {
                        toast.loading('正在恢復帳號...', { id: 'restore-loading' });

                        TokenService.setTokens(pendingToken, ''); // 若無 refreshToken 可給空字串
                        setToken(pendingToken);

                        await restoreAccount();

                        setUser(pendingUser);

                        toast.dismiss('restore-loading');
                        toast.success('帳號已成功恢復');
                        setShowRestoreDialog(false);
                        setOpen(false);
                        router.push('/profile');
                    } catch (err) {
                        toast.dismiss('restore-loading');

                        const axiosError = err as {
                            response?: {
                                data?: any;
                            };
                            message?: string;
                        };

                        if (axiosError.response?.data) {
                            console.error('還原帳號錯誤：', axiosError.response.data);
                        } else {
                            console.error('還原帳號錯誤（非 Axios）：', err);
                        }

                        toast.error('帳號恢復失敗，請稍後再試');
                    }
                }}
            />
        </>
    );
}
